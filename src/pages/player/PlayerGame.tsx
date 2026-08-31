import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useNavigate } from "react-router-dom";
import { collection, addDoc, doc } from "firebase/firestore";
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
import { BackgroundSlider } from "../../components/BackgroundSlider";
import { PlayerTutorial } from "./components/PlayerTutorial";

import { Suspense, lazy } from "react";
const PlayerQuizController = lazy(() => import("./quiz/PlayerQuizController").then(m => ({ default: m.PlayerQuizController })));
const PlayerBombController = lazy(() => import("./bomb/PlayerBombController").then(m => ({ default: m.PlayerBombController })));
const PlayerSensorController = lazy(() => import("./sensor/PlayerSensorController").then(m => ({ default: m.PlayerSensorController })));
const PlayerWheelController = lazy(() => import("./wheel/PlayerWheelController").then(m => ({ default: m.PlayerWheelController })));
const PlayerOverloadGame = lazy(() => import("./overload/PlayerOverloadGame").then(m => ({ default: m.PlayerOverloadGame })));
const PlayerEchoController = lazy(() => import("./echo/PlayerEchoController").then(m => ({ default: m.PlayerEchoController })));
const PlayerPulseController = lazy(() => import("./pulse/PlayerPulseController").then(m => ({ default: m.PlayerPulseController })));
const PlayerSpectrumController = lazy(() => import("./spectrum/PlayerSpectrumController").then(m => ({ default: m.PlayerSpectrumController })));
const PlayerColorsController = lazy(() => import("./colors/PlayerColorsController").then(m => ({ default: m.PlayerColorsController })));
const PlayerVaultController = lazy(() => import("./vault/PlayerVaultController").then(m => ({ default: m.PlayerVaultController })));
const PlayerUnityController = lazy(() => import("./unity/PlayerUnityController").then(m => ({ default: m.PlayerUnityController })));
const PlayerBarController = lazy(() => import("./bar/PlayerBarController").then(m => ({ default: m.PlayerBarController })));
const PlayerKabloController = lazy(() => import("./kablo/PlayerKabloController").then(m => ({ default: m.PlayerKabloController })));


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
  const isScattegories = !room?.active_game || room?.active_game === "scattegories" || room?.active_game === "none";

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

  // Liveness Ping (Heartbeat) - prevents ghost players from receiving bomb
  useEffect(() => {
    if (!playerId) return;
    const playerRef = doc(db, "players", playerId);
    const ping = () => {
      import("firebase/firestore").then(({ updateDoc }) => {
        updateDoc(playerRef, { last_active: Date.now() }).catch(() => {});
      });
    };
    
    ping(); // Immediate ping on mount
    const interval = setInterval(ping, 15000); // Every 15 seconds
    
    return () => clearInterval(interval);
  }, [playerId]);

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
  }, [gameState, room?.round_end_time, room?.timer_setting, isScattegories]);

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
  }, [gameState, localRoundEndTime, isScattegories]);

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
  }, [isLocked, gameState, submitAnswers, isScattegories]);

  const renderGame = () => {
    if (!room || !player) return null;
    const isGame = (name: string) => (room.active_game === name || room.game_type === name) && room.status !== "tutorial" && room.status !== "ad_break";
    if (isGame("quiz")) return <PlayerQuizController room={room} player={player} />;
    if (isGame("bomb")) return <PlayerBombController room={room} player={player} />;
    if (isGame("sensor")) return <PlayerSensorController room={room} player={player} />;
    if (isGame("wheel")) return <PlayerWheelController room={room} player={player} />;
    if (isGame("overload")) return <PlayerOverloadGame room={room} player={player} />;
    if (isGame("echo")) return <PlayerEchoController room={room} player={player} />;
    if (isGame("pulse")) return <PlayerPulseController room={room} player={player} />;
    if (isGame("spectrum")) return <PlayerSpectrumController room={room} player={player} />;
    if (isGame("colors")) return <PlayerColorsController room={room} player={player} />;
    if (isGame("vault")) return <PlayerVaultController room={room} player={player} />;
    if (isGame("unity")) return <PlayerUnityController room={room} player={player} />;
    if (isGame("bar")) return <PlayerBarController room={room} player={player} />;
    if (isGame("kablo")) return <PlayerKabloController room={room} player={player} />;
    return null;
  };
  const activeGameComponent = renderGame();
  if (activeGameComponent) {
    return (
      <Suspense fallback={<div className="flex-1 flex items-center justify-center bg-black"><span className="text-white animate-pulse">Yükleniyor...</span></div>}>
        {activeGameComponent}
      </Suspense>
    );
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
        <div className={`danger-overlay absolute inset-0 pointer-events-none z-30 ${timeLeft <= 5 ? 'tension-heartbeat-glow bg-red-950/40' : ''}`} />
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

      <main className={`flex-1 overflow-y-auto touch-auto p-4 md:p-6 relative z-10 ${(gameState === "review" || gameState === "standings" || gameState === "finished") ? "pb-[calc(9rem+env(safe-area-inset-bottom))]" : "pb-safe"}`}>
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
                {gameState === "countdown" ? t("game.determiningLetter") : gameState === "ad_break" ? t("game.adBreakTitle") : t("game.starting")}
              </h2>
              <p className="text-alaz-orange text-sm md:text-base font-bold tracking-widest uppercase animate-pulse mb-6">
                {gameState === "ad_break" ? t("game.adBreakDesc") : t("game.watchMainScreen")}
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

