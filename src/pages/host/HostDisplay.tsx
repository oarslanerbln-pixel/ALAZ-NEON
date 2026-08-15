import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { collection, query, where, limit, getDocs, doc, writeBatch } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { ParticleBackground } from "../../components/ParticleBackground";
import { KineticSpark } from "../../components/KineticSpark";
import { sounds, SoundManager } from "../../lib/audio";
import { calculateRoundScores } from "../../lib/scoring";
import { Sentinel } from "../../lib/sentinel";

// Hooks
import { useHostRoom } from "../../hooks/useHostRoom";

// Types
import type { RoundResultInfo, Answer } from "../../types/database";

// Extracted Components
import { HostHeader } from "./components/HostHeader";
import { HostLobby } from "./views/HostLobby";
import { HostIntro } from "./views/HostIntro";
import { HostPlaying } from "./views/HostPlaying";
import { HostReview } from "./views/HostReview";
import { HostStandings } from "./views/HostStandings";
import { HostPodium } from "./views/HostPodium";
import { HostQuizDisplay } from "./quiz/HostQuizDisplay";
import { DatabaseStatus } from "../../components/DatabaseStatus";
import { EmojiRain } from "../../components/EmojiRain";
import { LetterSpinner } from "../../components/LetterSpinner";
import {
  getRoundIntelligence,
  logRoundIntelligence,
  evaluateBestOfNight,
  type JulesAward
} from "../../lib/intelligence";

export function HostDisplay() {
  const [searchParams] = useSearchParams();
  const roomId = searchParams.get("roomId");
  const hostRoom = useHostRoom(roomId);

  // Route to Quiz Display if game_type is quiz. This must happen before any
  // of the classic-game-only hooks below are declared, so the quiz view
  // never runs those hooks at all (keeps hook order stable either way).
  if (hostRoom.room?.game_type === "quiz") {
    return <HostQuizDisplay roomId={roomId} {...hostRoom} />;
  }

  return <HostDisplayGame roomId={roomId} {...hostRoom} />;
}

function HostDisplayGame({
  roomId,
  room,
  players,
  submittedPlayerIds,
  updateRoomStatus,
  updatePlayerScore,
}: { roomId: string | null } & ReturnType<typeof useHostRoom>) {
  // Local UI States
  const [gameState, setGameState] = useState<
    | "intro"
    | "lobby"
    | "gameIntro"
    | "countdown"
    | "playing"
    | "review"
    | "standings"
    | "finished"
    | "closed"
  >(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const rId = urlParams.get("roomId");
    return rId && sessionStorage.getItem(`hostIntro_${rId}`)
      ? "lobby"
      : "intro";
  });
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentLetter, setCurrentLetter] = useState("?");
  const [nextLetter, setNextLetter] = useState("");
  const [roundEndTime, setRoundEndTime] = useState<number | null>(null);
  const [roundResults, setRoundResults] = useState<RoundResultInfo[]>([]);
  const [gameHistory, setGameHistory] = useState<RoundResultInfo[]>([]);
  const [awards, setAwards] = useState<{ creative: JulesAward | null; funny: JulesAward | null } | undefined>();
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Stats for Podium Badges
  const [playerStats, setPlayerStats] = useState<
    Record<
      string,
      { uniqueCount: number; earlyCount: number; blankCount: number }
    >
  >({});

  // Orchestrate Intro and Music
  useEffect(() => {
    const sound = SoundManager.getInstance();

    if (gameState === "intro") {
      sound.playMusic(sounds.LOBBY_AMBIENT, 0.6); // Start cinematic intro immediately
      const timer = setTimeout(() => {
        setGameState("lobby");
        if (roomId) sessionStorage.setItem(`hostIntro_${roomId}`, "true");
      }, 4000);
      return () => clearTimeout(timer);
    } else if (gameState === "lobby") {
      sound.playMusic(sounds.LOBBY_AMBIENT, 0.4);
      sound.startAmbientDrone();
    } else if (gameState === "gameIntro") {
      sound.stopSound(sounds.LOBBY_AMBIENT);
      sound.playMusic(sounds.GAME_PULSE, 0.5); // high energy
    } else if (gameState === "playing") {
      sound.stopSound(sounds.LOBBY_AMBIENT);
      sound.playMusic(sounds.GAME_PULSE, 0.3);
      sound.startAmbientDrone(); // Keep drone running for consistency
    } else if (gameState === "countdown") {
      sound.stopSound(sounds.LOBBY_AMBIENT);
    } else if (gameState === "review") {
      sound.stopSound(sounds.GAME_PULSE);
      sound.playMusic(sounds.LOBBY_AMBIENT, 0.2); // Low lobby music for review
    } else if (gameState === "standings") {
      sound.playMusic(sounds.LOBBY_AMBIENT, 0.4); // Bring back up a bit for standings
    } else {
      sound.stopSound(sounds.LOBBY_AMBIENT);
      sound.stopSound(sounds.GAME_PULSE);
      sound.stopAmbientDrone();
    }
  }, [gameState, roomId]);

  // Sync Game State with Room Status
  useEffect(() => {
    if (room) {
      if (gameState !== "intro" && gameState !== "gameIntro" && gameState !== "countdown") {
        const newStatus = room.status as typeof gameState;
        if (gameState !== newStatus) {
          setTimeout(() => setGameState(newStatus), 0);
        }
      }
      if (room.active_letter && room.active_letter !== currentLetter) {
        setTimeout(() => setCurrentLetter(room.active_letter || "?"), 0);
      }
    }
  }, [room, gameState, currentLetter]);

  // Derive the round countdown from the persisted server timestamp, not local
  // state alone — this is what lets the timer survive a host page refresh
  // instead of freezing forever with a stale/null end time.
  useEffect(() => {
    setRoundEndTime(room?.round_end_time ?? null);
  }, [room?.round_end_time]);

  const endRound = useCallback(async () => {
    if (!roomId || !room) return;
    setGameState("review");
    setIsAnalyzing(true);

    await updateRoomStatus("review");
    SoundManager.getInstance().playSFX(sounds.SIREN);

    // Give players 2.5 seconds to auto-submit their final answers
    await new Promise((resolve) => setTimeout(resolve, 2500));

    const letterToQuery = room.active_letter || currentLetter;

    const q = query(
      collection(db, "answers"),
      where("room_id", "==", roomId),
      where("round_letter", "==", letterToQuery),
      limit(500)
    );
    const querySnapshot = await getDocs(q);
    const rawAnswers: Answer[] = [];
    querySnapshot.forEach((docSnap) => {
      rawAnswers.push({ id: docSnap.id, ...docSnap.data() } as Answer);
    });

    if (!rawAnswers || rawAnswers.length === 0) {
      setIsAnalyzing(false);
      return;
    }

    // 1. SENTINEL FILTER: Remove shadowbanned players and sanitize payloads
    const safeAnswers: Answer[] = [];
    for (const ans of rawAnswers) {
      if (Sentinel.radar.isShadowbanned(ans.player_id)) {
        console.warn(
          `[SENTINEL] Dropping answer from shadowbanned player: ${ans.player_id}`,
        );
        continue;
      }

      // Sanitize all category inputs
      const safeData: Record<string, string> = {};
      if (ans.data) {
        for (const [cat, val] of Object.entries(ans.data)) {
          Reflect.set(safeData, cat, Sentinel.crypto.sanitizePayload(val || ""));
        }
      }

      safeAnswers.push({ ...ans, data: safeData });
    }

    if (safeAnswers.length === 0) {
      setIsAnalyzing(false);
      return; // Everyone was a bot, or no valid answers
    }

    // Use the safe, sanitized answers
    const results = calculateRoundScores(
      room,
      players,
      safeAnswers,
      letterToQuery,
    );
    setRoundResults(results.sort((a, b) => b.totalScore - a.totalScore));
    setGameHistory((prev) => [...prev, ...results]);

    // AI Intelligence Logging (Self-Learning)
    const prediction = getRoundIntelligence(
      letterToQuery,
      room.categories,
      players.length,
      room.timer_setting,
      room.current_round,
    );
    logRoundIntelligence(
      roomId,
      room.current_round,
      letterToQuery,
      room.categories,
      players.length,
      prediction.expectedAvgScore,
      results,
    ).then();

    // Update Stats for Podium — all at once inside functional updater (no stale closure)
    setPlayerStats((prev) => {
      const next = { ...prev };
      results.forEach((res) => {
        const current = Object.prototype.hasOwnProperty.call(next, res.playerId)
          ? next[res.playerId]
          : { uniqueCount: 0, earlyCount: 0, blankCount: 0 };
        const newStats = { ...current };
        if (res.earlyBonus) newStats.earlyCount++;
        Object.values(res.answers).forEach((ans) => {
          if (!ans.value) newStats.blankCount++;
          else if (ans.isUnique && ans.isValid) newStats.uniqueCount++;
        });
        next[res.playerId] = newStats;
      });
      return next;
    });

    // Push scores to DB
    for (const res of results) {
      await updatePlayerScore(res.playerId, res.totalScore);
    }

    setIsAnalyzing(false);
  }, [
    roomId,
    room,
    players,
    currentLetter,
    updateRoomStatus,
    updatePlayerScore,
  ]);

  const startGame = async () => {
    if (!roomId || !room) return;
    SoundManager.getInstance().playSFX(sounds.BURN);

    const letters = "ABCDEFGHIJKLMNOPRSTUVYZ".split("");
    const usedLetters = room.used_letters || [];
    let availableLetters = letters.filter(l => !usedLetters.includes(l));
    
    // If all letters used, reset pool
    if (availableLetters.length === 0) {
      availableLetters = letters;
    }
    
    const randomLetter = availableLetters[Math.floor(Math.random() * availableLetters.length)];
    setNextLetter(randomLetter);
    
    if (room.current_round === 0) {
      setGameState("gameIntro");
    } else {
      setGameState("countdown");
    }
  };

  const handleGameIntroComplete = () => {
    setGameState("countdown");
  };

  const handleSpinnerComplete = async () => {
    if (!roomId || !room) return;

    const nextRound = (room.current_round || 0) + 1;
    const usedLetters = room.used_letters || [];

    await updateRoomStatus("playing", {
      active_letter: nextLetter,
      current_round: nextRound,
      time_left: room.timer_setting,
      round_end_time: Date.now() + room.timer_setting * 1000,
      used_letters: [...usedLetters, nextLetter]
    });

    setCurrentLetter(nextLetter);
    setTimeLeft(room.timer_setting);

    // Notify Sentinel that the round timer has officially started
    Sentinel.radar.startRoundTime();

    setGameState("playing");
  };

  const toggleAnswerValidity = (playerId: string, category: string) => {
    SoundManager.getInstance().playSFX(sounds.CLICK);
    setRoundResults((prev) =>
      prev.map((res) => {
        if (res.playerId !== playerId) return res;
        const targetAns = Reflect.get(res.answers, category);
        const newValid = !targetAns.isValid;
        const basePoints = newValid ? (targetAns.isUnique ? 20 : 10) : 0;
        // Joker categories double valid points and carry a fixed -10 penalty
        // when invalid — mirrors the scoring rules in lib/scoring.ts.
        const newPoints = targetAns.isJoker
          ? newValid
            ? basePoints * 2
            : -10
          : basePoints;
        const pointDiff = newPoints - targetAns.points;

        const updatedResult = {
          ...res,
          roundScore: res.roundScore + pointDiff,
          totalScore: res.totalScore + pointDiff,
          answers: {
            ...res.answers,
            [category]: { ...targetAns, isValid: newValid, points: newPoints },
          },
        };

        updatePlayerScore(res.playerId, updatedResult.totalScore).then();
        return updatedResult;
      }),
    );
  };

  const nextStep = async () => {
    if (!roomId || !room) return;
    SoundManager.getInstance().playSFX(sounds.START);
    
    // Move from review to standings
    await updateRoomStatus("standings");
    setGameState("standings");
  };

  const proceedFromStandings = async () => {
    if (!roomId || !room) return;
    SoundManager.getInstance().playSFX(sounds.START);

    if (room.current_round >= room.total_rounds) {
      // Evaluate best of night before finishing
      const finalAwards = evaluateBestOfNight(gameHistory);
      setAwards(finalAwards);

      await updateRoomStatus("finished");
      setGameState("finished");
    } else {
      startGame();
    }
  };

  const resetGame = async () => {
    if (!roomId) return;
    const batch = writeBatch(db);
    players.forEach(p => {
      const pRef = doc(db, "players", p.id);
      batch.update(pRef, { total_score: 0 });
    });
    await batch.commit();
    setPlayerStats({});
    setRoundResults([]);
    setGameHistory([]);
    setAwards(undefined);
    Sentinel.radar.clearRadar(); // Clear bans on reset
    await updateRoomStatus("lobby", { current_round: 0, active_letter: "?" });
    setGameState("lobby");
  };

  const handleEndGameEarly = async () => {
    if (!roomId || !room) return;
    const confirmEnd = window.confirm("Oyunu şimdi bitirmek istediğinize emin misiniz? (Tüm sonuçlar toplanıp şampiyon ekranına geçilecek)");
    if (confirmEnd) {
      const finalAwards = evaluateBestOfNight(gameHistory);
      setAwards(finalAwards);
      await updateRoomStatus("finished");
      setGameState("finished");
    }
  };

  // Timer Logic (Optimistic UI)
  useEffect(() => {
    if (gameState === "playing") {
      const interval = setInterval(() => {
        if (!roundEndTime) return;

        const now = Date.now();
        const remaining = Math.max(
          0,
          Math.floor((roundEndTime - now) / 1000),
        );

        setTimeLeft(remaining);

        if (remaining === 0) {
          clearInterval(interval);
          endRound();
        }
      }, 500); // Check twice a second for precision

      return () => clearInterval(interval);
    }
  }, [gameState, roundEndTime, endRound]);

  // Calculate Aesthetic Tension
  const tensionRatio =
    room && room.total_rounds > 0
      ? (room.current_round || 0) / room.total_rounds
      : 0;

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--tension-level",
      tensionRatio.toString(),
    );
  }, [tensionRatio]);

  return (
    <div
      className={`flex-1 flex flex-col p-8 h-screen overflow-hidden ${gameState === "playing" && timeLeft <= 10 ? "animate-shake" : ""}`}
      data-tension={
        tensionRatio > 0.8 ? "high" : tensionRatio > 0.5 ? "medium" : "low"
      }
    >
      <ParticleBackground
        speedMultiplier={gameState === "playing" && timeLeft <= 10 ? 5 : 1}
      />
      {gameState === "playing" && timeLeft <= 10 && (
        <div className="danger-overlay" />
      )}

      {gameState !== "intro" && gameState !== "gameIntro" && <HostHeader room={room} onEndGameEarly={handleEndGameEarly} />}

      <div className="flex-1 flex items-center justify-center relative w-full">
        <AnimatePresence mode="wait">
          {gameState === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.2, filter: "blur(40px)" }}
              transition={{ duration: 1.5, ease: "circIn" }}
              className="bg-black fixed inset-0 z-[100] flex items-center justify-center overflow-hidden noise-suppression"
            >
              <div className="relative w-full max-w-7xl flex flex-col items-center justify-center">
                <KineticSpark delay={0.5} />
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0, 0.1, 0.05, 0.15] }}
                  transition={{
                    delay: 2,
                    duration: 4,
                    repeat: Infinity,
                    repeatType: "mirror",
                  }}
                  className="absolute inset-0 bg-alaz-orange/10 blur-[150px] -z-10 rounded-full"
                />
              </div>
            </motion.div>
          )}

          {gameState === "lobby" && (
            <HostLobby
              room={room}
              players={players}
              onStartGame={startGame}
              onUpdateCategories={(cats) =>
                updateRoomStatus("lobby", { categories: cats })
              }
            />
          )}

          {gameState === "gameIntro" && (
            <HostIntro players={players} onComplete={handleGameIntroComplete} />
          )}

          {gameState === "countdown" && (
            <LetterSpinner
              targetLetter={nextLetter}
              onComplete={handleSpinnerComplete}
            />
          )}

          {gameState === "playing" && (
            <HostPlaying
              currentLetter={currentLetter}
              timeLeft={timeLeft}
              categories={room?.categories || []}
              submittedPlayerIds={submittedPlayerIds}
              playersCount={players.length}
              currentRound={room?.current_round}
            />
          )}

          {gameState === "review" && (
            <HostReview
              room={room}
              isAnalyzing={isAnalyzing}
              roundResults={roundResults}
              players={players}
              currentLetter={currentLetter}
              onToggleAnswer={toggleAnswerValidity}
              onNextStep={nextStep}
            />
          )}

          {gameState === "standings" && (
            <HostStandings
              room={room}
              players={players}
              roundResults={roundResults}
              onNextStep={proceedFromStandings}
            />
          )}

          {gameState === "finished" && (
            <HostPodium
              room={room}
              players={players}
              playerStats={playerStats}
              awards={awards}
              onResetGame={resetGame}
            />
          )}
        </AnimatePresence>
      </div>

      {(gameState === "review" || gameState === "standings" || gameState === "finished") && roomId && (
        <EmojiRain roomId={roomId} />
      )}

      <DatabaseStatus />
    </div>
  );
}
