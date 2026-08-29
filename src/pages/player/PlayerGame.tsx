import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useNavigate } from "react-router-dom";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { NeonIcon } from "../../components/NeonIcon";
import { DatabaseStatus } from "../../components/DatabaseStatus";
import { useToast } from "../../contexts/ToastContextCore";
import { sounds, SoundManager } from "../../lib/audio";
import { useLocale } from "../../hooks/useLocale";

// Hooks
import { useRoom } from "../../hooks/useRoom";
import { usePlayer } from "../../hooks/usePlayer";
import { useEmojiPulse } from "../../hooks/useEmojiPulse";

// Extracted Components
import { PlayerHeader } from "./components/PlayerHeader";
import { EmojiToolbar } from "./components/EmojiToolbar";
import { PlayerLobby } from "./views/PlayerLobby";
import { PlayerPlaying } from "./views/PlayerPlaying";
import { PlayerReview } from "./views/PlayerReview";
import { PlayerStandings } from "./views/PlayerStandings";
import { PlayerQuizController } from "./quiz/PlayerQuizController";
import { PlayerBombController } from "./bomb/PlayerBombController";
import { PlayerSensorController } from "./sensor/PlayerSensorController";
import { PlayerWheelController } from "./wheel/PlayerWheelController";
import { PlayerOverloadGame } from "./overload/PlayerOverloadGame";
import { PlayerEchoController } from "./echo/PlayerEchoController";
import { PlayerPulseController } from "./pulse/PlayerPulseController";
import { PlayerSpectrumController } from "./spectrum/PlayerSpectrumController";
import { BackgroundSlider } from "../../components/BackgroundSlider";
import { PlayerTutorial } from "./components/PlayerTutorial";

export function PlayerGame() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const roomId = searchParams.get("roomId") || localStorage.getItem("cafe_game_roomId");
  const playerId = searchParams.get("playerId") || localStorage.getItem("cafe_game_playerId");

  // Centralized State Management via Hooks
  const { room } = useRoom(roomId);
  const { player } = usePlayer(playerId);
  const { sendReaction } = useEmojiPulse(roomId);
  const { t } = useLocale();

  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isLocked, setIsLocked] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [roundPoints, setRoundPoints] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(() => {
    if (room?.round_end_time) {
      return Math.max(0, Math.floor((room.round_end_time - Date.now()) / 1000));
    }
    return room?.timer_setting || 60;
  });
  const [localRoundEndTime, setLocalRoundEndTime] = useState<number | null>(null);
  const [jokerCategory, setJokerCategory] = useState<string | null>(null);

  const hasSubmitted = useRef(false);
  const lastScore = useRef(0);

  // Sync score gains for animations
  useEffect(() => {
    if (player) {
      const pointsGained = player.total_score - lastScore.current;
      if (pointsGained > 0) {
        setRoundPoints(pointsGained);
      }
      lastScore.current = player.total_score;
    }
  }, [player]);

  // Derived States
  const gameState = room?.status || "lobby";
  const activeLetter = room?.active_letter || "?";
  const categories = room?.categories || [];
  const timerSetting = room?.timer_setting || 60;
  const currentRound = room?.current_round || 0;

  // Handle Local States on Room Update
  useEffect(() => {
    if (gameState === "playing") {
      const endTime = room?.round_end_time || (Date.now() + (room?.timer_setting || 60) * 1000);
      const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      
      setTimeout(() => {
        setAnswers({});
        setIsLocked(false);
        hasSubmitted.current = false;
        setSubmitStatus("idle");
        setRoundPoints(null);
        setJokerCategory(null);
        setTimeLeft(remaining);
        setLocalRoundEndTime(endTime);
      }, 0);
    } else if (gameState === "review" || gameState === "standings" || gameState === "finished") {
      setTimeout(() => setIsLocked(true), 0);
    }
  }, [gameState, room?.round_end_time, room?.timer_setting]);

  // Timer Logic (Optimistic UI & Synced with round_end_time)
  useEffect(() => {
    if (gameState === "playing" && localRoundEndTime) {
      const updateTimer = () => {
        const now = Date.now();
        const remaining = Math.max(
          0,
          Math.floor((localRoundEndTime - now) / 1000),
        );
        setTimeLeft(remaining);
        return remaining;
      };

      // Run once immediately
      updateTimer();

      const interval = setInterval(() => {
        const remaining = updateTimer();
        if (remaining === 0) {
          clearInterval(interval);
          setIsLocked(true);
        }
      }, 500);

      return () => clearInterval(interval);
    }
  }, [gameState, localRoundEndTime]);

  const submitAnswers = useCallback(
    async (isEarly: boolean = false) => {
      // isEarly bir istisna değil, sadece "elle mi otomatik mi gönderildi" bilgisi.
      // Eskiden `!isEarly` koşulu buraya eklenmişti ve isEarly=true olan HER
      // çağrı hasSubmitted kontrolünü tamamen atlıyordu — hızlı iki dokunuşla
      // (veya erken gönderim + zaman aşımı çakışmasıyla) aynı tur için iki
      // "answers" dokümanı oluşup puanlamayı bozabiliyordu.
      if (!roomId || !playerId || hasSubmitted.current) return;
      setSubmitStatus("submitting");
      setIsLocked(true);
      hasSubmitted.current = true;

      const finalData = {
        ...answers,
        _earlySubmit: isEarly ? "true" : "false",
        _jokerCategory: jokerCategory || "",
      };

      let submitError = null;
      try {
        await addDoc(collection(db, "answers"), {
          room_id: roomId,
          player_id: playerId,
          round_letter: activeLetter,
          round_index: currentRound,
          data: finalData,
          created_at: new Date().toISOString()
        });
      } catch (err) {
        submitError = err;
      }

      if (submitError) {
        console.error("Error submitting answers:", submitError);
        showToast(t("game.submitError"), "error");
        setSubmitStatus("idle");
        setIsLocked(false);
        hasSubmitted.current = false;
      } else {
        setSubmitStatus("success");
        SoundManager.getInstance().playSFX(sounds.SUCCESS);
      }
    },
    [roomId, playerId, activeLetter, currentRound, answers, jokerCategory, showToast, t],
  );

  // Auto-submit only when locked AND game is playing or review
  useEffect(() => {
    if (isLocked && !hasSubmitted.current && (gameState === "playing" || gameState === "review")) {
      setTimeout(() => {
        submitAnswers(false).then();
      }, 0);
      if (typeof window !== "undefined" && window.navigator.vibrate) {
        try { window.navigator.vibrate(200); } catch { /* titreşim desteklenmiyor */ }
      }
    }
  }, [isLocked, gameState, submitAnswers]);

  // Route to Quiz Controller if active_game is quiz
  if ((room?.active_game === "quiz" || room?.game_type === "quiz") && player && room.status !== "tutorial" && room.status !== "ad_break") {
    return <PlayerQuizController room={room} player={player} />;
  }

  // Route to Bomb Controller if active_game is bomb (except during tutorial)
  if ((room?.active_game === "bomb" || room?.game_type === "bomb") && player && room.status !== "tutorial" && room.status !== "ad_break") {
    return <PlayerBombController room={room} player={player} />;
  }

  if ((room?.active_game === "sensor" || room?.game_type === "sensor") && player && room.status !== "tutorial" && room.status !== "ad_break") {
    return <PlayerSensorController room={room} player={player} />;
  }

  if ((room?.active_game === "wheel" || room?.game_type === "wheel") && player && room.status !== "tutorial" && room.status !== "ad_break") {
    return <PlayerWheelController room={room} player={player} />;
  }

  if (room?.active_game === "overload" && player && room.status !== "tutorial" && room.status !== "ad_break") {
    return <PlayerOverloadGame room={room} player={player} />;
  }

  if (room?.active_game === "echo" && player && room.status !== "tutorial" && room.status !== "ad_break") {
    return <PlayerEchoController room={room} player={player} />;
  }

  if (room?.active_game === "pulse" && player && room.status !== "tutorial" && room.status !== "ad_break") {
    return <PlayerPulseController room={room} player={player} />;
  }

  if (room?.active_game === "spectrum" && player && room.status !== "tutorial" && room.status !== "ad_break") {
    return <PlayerSpectrumController room={room} player={player} />;
  }

  // Render tutorial for all game modes if status is tutorial
  if (room?.status === "tutorial") {
    return <PlayerTutorial room={room} />;
  }

  if (gameState === "closed") {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 text-center">
        <NeonIcon type="rocket" color="orange" className="w-24 h-24 mb-8" />
        <h1 className="text-4xl font-black text-white italic mb-4">
          {t("game.roomClosed")}
        </h1>
        <p className="text-gray-400 mb-8">{t("game.roomClosedDesc")}</p>
        <button
          onClick={() => navigate("/")}
          className="glass-panel-alaz px-8 py-4 text-white font-bold rounded-sm"
        >
          {t("game.backHome")}
        </button>
      </div>
    );
  }

  return (
    <div 
      className="min-h-[100dvh] bg-black/60 flex flex-col text-white relative overflow-hidden font-inter transition-colors duration-500"
      data-tension={timeLeft <= 10 && timeLeft > 0 && gameState === "playing" ? "high" : undefined}
    >
      {timeLeft <= 10 && timeLeft > 0 && gameState === "playing" && (
        <div className="danger-overlay absolute inset-0 pointer-events-none z-30" />
      )}
      <AnimatePresence>
        {submitStatus === "success" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="absolute inset-0 bg-neon-blue/20 mix-blend-screen pointer-events-none z-50 flex items-center justify-center"
          >
            <div className="absolute inset-0 border-8 border-neon-blue/40 shadow-[inset_0_0_100px_rgba(0,243,255,0.4)]" />
          </motion.div>
        )}
        {submitStatus === "error" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-red-600/30 mix-blend-overlay pointer-events-none z-50 animate-glitch"
          />
        )}
      </AnimatePresence>
      <BackgroundSlider className="fixed inset-0 z-0 opacity-40 pointer-events-none overflow-hidden" />
      <PlayerHeader
        playerName={player?.nickname || t("game.player")}
        totalScore={player?.total_score || 0}
        timeLeft={timeLeft}
        maxTime={timerSetting}
        isSubmitting={submitStatus === "submitting"}
        activeLetter={activeLetter}
        currentRound={currentRound}
        gameState={gameState}
        roundPoints={roundPoints}
      />

      <main className="flex-1 overflow-y-auto touch-auto p-4 md:p-6 pb-[calc(9rem+env(safe-area-inset-bottom))] relative z-10">
        <AnimatePresence mode="wait">
          {(gameState === "lobby" || gameState === "night_lobby") && <PlayerLobby room={room} roomId={roomId} />}

          {(gameState === "intro" || gameState === "gameIntro" || gameState === "countdown" || gameState === "ad_break") && (
            <motion.div
              key="preparing"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex flex-col items-center justify-center text-center p-8 min-h-[60vh] relative z-10"
            >
              <div className="relative w-28 h-28 flex items-center justify-center mb-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 rounded-full border-2 border-dashed border-alaz-orange/50"
                />
                <motion.div
                  animate={{ rotate: -360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-3 rounded-full border-2 border-dotted border-cyber-yellow/60"
                />
                <motion.div
                  animate={{ scale: [1, 1.3, 1], opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  className="w-14 h-14 rounded-full bg-alaz-orange/20 border border-alaz-orange flex items-center justify-center shadow-[0_0_25px_rgba(255,77,0,0.5)]"
                >
                  <span className="text-2xl animate-pulse">⚡</span>
                </motion.div>
              </div>

              <h2 className="text-2xl md:text-3xl font-black text-white tracking-[0.2em] mb-3 uppercase font-mono">
                {gameState === "countdown" ? t("game.determiningLetter") : gameState === "ad_break" ? "REKLAM ARASI" : t("game.starting")}
              </h2>
              <p className="text-alaz-orange text-sm md:text-base font-bold tracking-widest uppercase animate-pulse mb-6">
                {gameState === "ad_break" ? "Sponsorumuzdan kısa bir mesaj, lütfen ana ekrana bakın" : t("game.watchMainScreen")}
              </p>
              <div className="bg-black/60 border border-white/10 p-4 max-w-xs text-xs text-gray-400 font-mono rounded-sm">
                {t("game.roundHint", currentRound || 1, room?.total_rounds || 3)}
              </div>
            </motion.div>
          )}

          {gameState === "playing" && (
            <PlayerPlaying
              categories={categories}
              answers={answers}
              onAnswerChange={(cat, val) =>
                setAnswers((prev) => ({ ...prev, [cat]: val }))
              }
              jokerCategory={jokerCategory}
              onJokerChange={setJokerCategory}
              isLocked={isLocked}
              activeLetter={activeLetter}
              onSubmitEarly={() => submitAnswers(true)}
              submitStatus={submitStatus}
            />
          )}

          {(gameState === "review" || gameState === "finished") && (
            <PlayerReview submitStatus={submitStatus} />
          )}

          {gameState === "standings" && (
            <PlayerStandings currentPlayer={player} />
          )}
        </AnimatePresence>
      </main>

      {(gameState === "review" || gameState === "standings" || gameState === "finished") && (
        <EmojiToolbar onEmojiClick={sendReaction} />
      )}

      <DatabaseStatus />
    </div>
  );
}

