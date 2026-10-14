import { useState, useEffect, useCallback, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { collection, query, where, getDocs, doc, writeBatch, onSnapshot } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { ParticleBackground } from "../../../components/ParticleBackground";
import { TVScaleFrame } from "../../../components/TVScaleFrame";
import { SoundManager, sounds } from "../../../lib/audio";
import { getQuizQuestions } from "../../../lib/quizQuestions";
import { recentQuestionIds, rememberQuestions } from "../../../lib/questionHistory";
import { scoreQuizQuestion, type FastestWinner, type VoteStats } from "../../../lib/quizScoring";

import type { Answer } from "../../../types/database";

import { HostQuizIntro } from "./views/HostQuizIntro";
import { QuizFinished } from "./views/QuizFinished";
import { QuizLeaderboard } from "./views/QuizLeaderboard";
import { QuizQuestionActive } from "./views/QuizQuestionActive";
import { QuizQuestionIntro } from "./views/QuizQuestionIntro";
import { QuizReveal } from "./views/QuizReveal";
import { OPTION_STYLES } from "./views/quizStyles";
import { HostHeader } from "../components/HostHeader";
import { HostLobby } from "../views/HostLobby";
import { HostTutorial } from "../components/HostTutorial";
import { useLocale } from "../../../hooks/useLocale";
import { grantGameRewards } from "../../../lib/rewards";
import { useVenue } from "../../../contexts/VenueContextCore";

import type { Room, Player } from "../../../types/database";
import { createLogger } from "../../../lib/logger";

const log = createLogger("HostQuizDisplay");

export function HostQuizDisplay({
  room,
  players,
  updateRoomStatus,
  updatePlayerScore,
}: {
  room: Room;
  players: Player[];
  updateRoomStatus: (status: Room["status"], extra?: Partial<Room>) => Promise<void>;
  updatePlayerScore: (playerId: string, score: number) => Promise<void>;
}) {
  const { t } = useLocale();
  const { venue } = useVenue();

  const grantQuizRewards = () =>
    grantGameRewards(room.id, "individual", players, venue).catch((err) =>
      log.error("Ödül dağıtımı başarısız:", err),
    );

  const [searchParams] = useSearchParams();
  const roomId = searchParams.get("roomId");

  const [timeLeft, setTimeLeft] = useState(room?.timer_setting || 30);
  const roundEndTime = room?.round_end_time ?? null;

  const [answeredCount, setAnsweredCount] = useState(0);
  const [voteStats, setVoteStats] = useState<VoteStats>({ A: 0, B: 0, C: 0, D: 0, total: 0 });
  const [fastestWinner, setFastestWinner] = useState<FastestWinner | null>(null);
  
  // Track streaks per player (consecutive correct answers)
  const streaksRef = useRef<Record<string, number>>({});
  const [playerStreaks, setPlayerStreaks] = useState<Record<string, number>>({});

  // Reentrancy guard for ending question
  const endingQuestionRef = useRef(false);

  // Derive game state directly from room.status — single source of truth
  const rawStatus = room?.status || "quiz_lobby";
  const gameState =
    rawStatus === "lobby" ? "quiz_lobby" :
    rawStatus === "tutorial" ? "tutorial" :
    rawStatus.startsWith("quiz_") || rawStatus.startsWith("question_") || rawStatus === "finished"
      ? rawStatus
      : "quiz_lobby";

  const currentQIndex = room?.current_question_index ?? 0;
  const currentQuestion = room?.quiz_questions?.[currentQIndex] ?? null;
  const totalRounds = room?.total_rounds || 5;
  const currentRoundNum = room?.current_round || currentQIndex + 1;
  const isFinalRound = currentRoundNum >= totalRounds;

  const startGame = async () => {
    if (!roomId || !room) return;
    
    // Clear old answers
    try {
      const q = query(collection(db, "answers"), where("room_id", "==", roomId));
      const snapshot = await getDocs(q);
      if (!snapshot.empty) {
        const batch = writeBatch(db);
        snapshot.forEach(docSnap => batch.delete(docSnap.ref));
        await batch.commit();
      }
    } catch (e) {
      log.warn("Could not delete old answers:", e);
    }

    // Reset streaks
    streaksRef.current = {};
    setPlayerStreaks({});

    // Ikinci tur da ayni secim ve hafizayi kullanmali: aksi halde host'un
    // kategori secimi yalnizca ilk turda gecerli olur ve tekrar hafizasi
    // gece icinde delinirdi.
    const questions = getQuizQuestions(room.locale || "tr", totalRounds, {
      topics: room.quiz_topics,
      recentIds: recentQuestionIds(),
    });
    rememberQuestions(questions.map((q) => q.id));

    if (room.current_round === 0) {
      await updateRoomStatus("tutorial", {
        tutorial_step: 0,
        current_question_index: 0,
        quiz_questions: questions,
      });
    } else {
      await updateRoomStatus("quiz_intro", {
        current_question_index: 0,
        quiz_questions: questions,
      });
    }
  };

  const handleTutorialComplete = async () => {
    if (!roomId) return;
    await updateRoomStatus("quiz_intro");
  };

  const onIntroComplete = useCallback(async () => {
    await updateRoomStatus("question_intro");
  }, [updateRoomStatus]);

  const startQuestionTimer = async () => {
    if (!roomId || !room) return;
    
    SoundManager.getInstance().playMusic(sounds.GAME_PULSE, 0.4);
    const timeToAnswer = room.timer_setting || 30;
    const endTime = Date.now() + timeToAnswer * 1000;
    
    endingQuestionRef.current = false;
    setTimeLeft(timeToAnswer);
    setAnsweredCount(0);
    setFastestWinner(null);

    await updateRoomStatus("question_active", {
      time_left: timeToAnswer,
      round_end_time: endTime,
    });
  };

  const endQuestion = useCallback(async () => {
    if (!roomId || !room) return;
    if (endingQuestionRef.current) return;
    if (room.status !== "question_active") return;
    endingQuestionRef.current = true;

    SoundManager.getInstance().stopSound(sounds.GAME_PULSE);
    SoundManager.getInstance().playSFX(sounds.SIREN);

    await updateRoomStatus("question_reveal");

    // Give players a brief grace period to resolve in-flight answers
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // Fetch answers for the current question
    const questionIndexStr = (room.current_question_index ?? 0).toString();
    const q = query(
      collection(db, "answers"),
      where("room_id", "==", roomId),
      where("round_letter", "==", questionIndexStr)
    );
    
    const querySnapshot = await getDocs(q);
    const answers: Answer[] = [];
    querySnapshot.forEach((docSnap) => {
      answers.push({ id: docSnap.id, ...docSnap.data() } as Answer);
    });
    
    const currentQ = room.quiz_questions?.[room.current_question_index || 0];
    if (!currentQ) return;
    
    const result = scoreQuizQuestion({
      answers,
      players,
      correctOption: currentQ.correctOption,
      isFinalRound,
      streaks: streaksRef.current,
      questionStartTime: (room.round_end_time || Date.now()) - (room.timer_setting || 30) * 1000,
    });
    setVoteStats(result.stats);

    // Puanlar hız sırasıyla, tek tek yazılıyor (lib/quizScoring.ts).
    for (const { playerId, earned } of result.awards) {
      const playerInfo = players.find((p) => p.id === playerId);
      if (playerInfo) await updatePlayerScore(playerId, playerInfo.total_score + earned);
    }

    streaksRef.current = result.streaks;
    setPlayerStreaks({ ...result.streaks });
    setFastestWinner(result.fastest);

    // Play reveal chime
    SoundManager.getInstance().playSFX(sounds.SUCCESS);
  }, [roomId, room, players, isFinalRound, updateRoomStatus, updatePlayerScore]);

  // Timer logic
  useEffect(() => {
    if (gameState !== "question_active" || !roundEndTime) return;

    const tick = () => {
      const remaining = Math.max(0, Math.floor((roundEndTime - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 5 && remaining > 0) {
        SoundManager.getInstance().playSFX(sounds.TICK_URGENT);
      }
      return remaining;
    };

    if (tick() === 0) {
      const t = setTimeout(endQuestion, 0);
      return () => clearTimeout(t);
    }

    const interval = setInterval(() => {
      if (tick() === 0) {
        clearInterval(interval);
        endQuestion();
      }
    }, 500);
    return () => clearInterval(interval);
  }, [gameState, roundEndTime, endQuestion]);

  // Real-time listener for player answers during question_active
  useEffect(() => {
    if (gameState === "question_active" && roomId && players.length > 0) {
      let hasEnded = false;
      const questionIndexStr = (room.current_question_index ?? 0).toString();
      const q = query(
        collection(db, "answers"),
        where("room_id", "==", roomId),
        where("round_letter", "==", questionIndexStr)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const distinctPlayers = new Set(snapshot.docs.map((d) => d.data().player_id));
        setAnsweredCount(distinctPlayers.size);

        // If everyone answered, end question immediately
        if (!hasEnded && distinctPlayers.size >= players.length) {
          hasEnded = true;
          endQuestion();
        }
      });
      
      return () => unsubscribe();
    }
  }, [gameState, roomId, room.current_question_index, players.length, endQuestion]);

  const showLeaderboard = async () => {
    await updateRoomStatus("quiz_leaderboard");
  };

  const nextQuestion = async () => {
    if (!roomId || !room) return;
    
    const nextIndex = (room.current_question_index || 0) + 1;
    if (nextIndex >= totalRounds) {
      grantQuizRewards();
      SoundManager.getInstance().playSFX(sounds.FANFARE);
      await updateRoomStatus("finished");
    } else {
      await updateRoomStatus("question_intro", {
        current_question_index: nextIndex,
        current_round: nextIndex + 1,
      });
    }
  };

  const resetGame = async () => {
    if (!roomId) return;
    const batch = writeBatch(db);
    players.forEach(p => {
      const pRef = doc(db, "players", p.id);
      batch.update(pRef, { total_score: 0, lifetime_credited: 0 });
    });

    const q = query(collection(db, "answers"), where("room_id", "==", roomId));
    const snapshot = await getDocs(q);
    snapshot.forEach(docSnap => {
      batch.delete(docSnap.ref);
    });

    await batch.commit();
    streaksRef.current = {};
    setPlayerStreaks({});
    await updateRoomStatus("quiz_lobby", { current_round: 0, current_question_index: 0 });
  };


  return (
    <TVScaleFrame>
      <div 
        className="w-full h-full flex flex-col p-8 overflow-hidden bg-black text-white relative"
        data-tension={gameState === "question_active" && timeLeft <= 5 ? "high" : undefined}
      >
        <ParticleBackground speedMultiplier={gameState === "question_active" && timeLeft <= 5 ? 5 : 1} />
        
        {gameState === "question_active" && timeLeft <= 5 && (
          <div className="absolute inset-0 bg-red-600/20 animate-pulse pointer-events-none z-0" />
        )}

        <HostHeader 
          room={room} 
          onEndGameEarly={() => { grantQuizRewards(); updateRoomStatus("finished"); }} 
          onReturnToLobby={() => updateRoomStatus("night_lobby", { active_game: "none" })}
        />

        <div className="flex-1 flex items-center justify-center relative w-full z-10 mt-6">
          <AnimatePresence mode="wait">
            
            {/* LOBBY */}
            {gameState === "quiz_lobby" && (
              <motion.div
                key="quiz_lobby"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, y: -50 }}
                className="w-full flex flex-col items-center"
              >
                <div className="text-center mb-8">
                  <span className="px-6 py-2 rounded-full border border-blue-500/40 bg-blue-500/10 text-blue-400 font-mono tracking-widest text-sm uppercase">
                    ⚡ {t("quiz.subtitle")} ⚡
                  </span>
                  <h1 className="text-6xl md:text-7xl font-black text-white tracking-widest uppercase mt-3 drop-shadow-[0_0_40px_rgba(59,130,246,0.9)]">
                    {t("quiz.title")}
                  </h1>
                </div>

                <div className="w-full h-full relative">
                  <HostLobby
                    room={room}
                    players={players}
                    onStartGame={startGame}
                    onUpdateCategories={() => {}}
                  />
                </div>
              </motion.div>
            )}

            {/* TUTORIAL */}
            {gameState === "tutorial" && (
              <HostTutorial room={room} onComplete={handleTutorialComplete} />
            )}

            {/* CYBER INTRO */}
            {gameState === "quiz_intro" && (
              <HostQuizIntro onComplete={onIntroComplete} />
            )}

            {/* QUESTION INTRO (Get Ready) */}
            {gameState === "question_intro" && (
              <QuizQuestionIntro key="intro" currentQuestion={currentQuestion} currentRoundNum={currentRoundNum} totalRounds={totalRounds} isFinalRound={isFinalRound} onStartTimer={startQuestionTimer} />
            )}

            {/* ACTIVE QUESTION */}
            {gameState === "question_active" && (
              <QuizQuestionActive key="active" currentQuestion={currentQuestion} currentRoundNum={currentRoundNum} totalRounds={totalRounds} players={players} timeLeft={timeLeft} answeredCount={answeredCount} optionStyles={OPTION_STYLES} onEndQuestion={endQuestion} />
            )}

            {/* QUESTION REVEAL (Vote breakdown + Correct Option + Speed Demon + Fun Fact) */}
            {gameState === "question_reveal" && (
              <QuizReveal key="reveal" currentQuestion={currentQuestion} voteStats={voteStats} fastestWinner={fastestWinner} onShowLeaderboard={showLeaderboard} />
            )}

            {/* LEADERBOARD */}
            {gameState === "quiz_leaderboard" && (
              <QuizLeaderboard key="leaderboard" currentRoundNum={currentRoundNum} totalRounds={totalRounds} players={players} playerStreaks={playerStreaks} onNext={nextQuestion} />
            )}

            {/* GRAND FINALE — 3-TIER CYBERPUNK PODIUM */}
            {gameState === "finished" && (
              <QuizFinished key="finished" players={players} onReset={resetGame} />
            )}
            
          </AnimatePresence>
        </div>
      </div>
    </TVScaleFrame>
  );
}
