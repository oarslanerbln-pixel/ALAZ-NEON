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
  const [timeLeft, setTimeLeft] = useState(0);
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
    let isMounted = true;
    if (gameState === "playing") {
      setTimeout(() => {
        if (isMounted) {
          setAnswers((prev) => (Object.keys(prev).length > 0 ? {} : prev));
          setIsLocked(false);
          hasSubmitted.current = false;
          setSubmitStatus("idle");
          setRoundPoints(null);
          setJokerCategory(null);
          setLocalRoundEndTime(Date.now() + (room?.timer_setting || 60) * 1000);
        }
      }, 0);
    } else if (gameState === "review" || gameState === "standings" || gameState === "finished") {
      setTimeout(() => {
        if (isMounted) setIsLocked(true);
      }, 0);
    }
    return () => {
      isMounted = false;
    };
  }, [gameState, room?.timer_setting]);

  // Timer Logic (Optimistic UI)
  useEffect(() => {
    if (gameState === "playing" && localRoundEndTime) {
      setTimeout(() => {
        const remaining = Math.max(
          0,
          Math.floor((localRoundEndTime - Date.now()) / 1000),
        );
        setTimeLeft(remaining);
      }, 0);

      const interval = setInterval(() => {
        const now = Date.now();
        const remaining = Math.max(
          0,
          Math.floor((localRoundEndTime - now) / 1000),
        );
        setTimeLeft(remaining);
        if (remaining === 0) clearInterval(interval);
      }, 500);

      return () => clearInterval(interval);
    }
  }, [gameState, localRoundEndTime]);

  const submitAnswers = useCallback(
    async (isEarly: boolean = false) => {
      if (!roomId || !playerId || (hasSubmitted.current && !isEarly)) return;
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
          data: finalData,
          created_at: Date.now()
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
    [roomId, playerId, activeLetter, answers, jokerCategory, showToast, t],
  );

  // Auto-submit when time is up or room moves to review
  useEffect(() => {
    let isMounted = true;
    if (isLocked && !hasSubmitted.current && gameState === "playing") {
      hasSubmitted.current = true;
      setTimeout(() => {
        if (isMounted) {
          submitAnswers(false).then();
          if (typeof window !== "undefined" && window.navigator.vibrate) {
            window.navigator.vibrate(200);
          }
        }
      }, 0);
    }
    return () => {
      isMounted = false;
    };
  }, [isLocked, submitAnswers, gameState]);

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
    <div className="min-h-screen bg-black flex flex-col text-white relative overflow-hidden font-inter">
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

      <main className="flex-1 overflow-y-auto p-6 pb-40 relative z-10">
        <AnimatePresence mode="wait">
          {gameState === "lobby" && <PlayerLobby />}

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
            />
          )}

          {(gameState === "review" || gameState === "finished") && (
            <PlayerReview submitStatus={submitStatus} />
          )}

          {gameState === "standings" && <PlayerStandings />}
        </AnimatePresence>
      </main>

      {gameState === "playing" && (
        <div className="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-black via-black/90 to-transparent z-20">
          <button
            onClick={() => submitAnswers(true)}
            disabled={isLocked || Object.values(answers).every((a) => !a)}
            className={`w-full py-5 rounded-sm font-black font-mono text-lg tracking-widest transition-all relative overflow-hidden group border-2 ${
              isLocked || Object.values(answers).every((a) => !a)
                ? "bg-black/50 border-gray-800 text-gray-500 cursor-not-allowed scale-95 opacity-50"
                : "bg-hacker-green/20 border-hacker-green text-hacker-green hover:bg-hacker-green hover:text-black shadow-[0_0_30px_rgba(0,255,65,0.4)] active:scale-95 animate-pulse"
            }`}
          >
            <span className="relative z-10">
              {submitStatus === "submitting"
                ? "> " + t("game.submitting")
                : "> " + t("game.submitEarly")}
            </span>
            {!isLocked && Object.values(answers).some((a) => a) && (
              <motion.div className="absolute inset-0 bg-gradient-to-r from-transparent via-hacker-green/30 to-transparent -translate-x-full group-hover:animate-shimmer" />
            )}
          </button>
          <p className="text-[10px] text-center text-gray-600 font-bold uppercase tracking-[0.3em] mt-4">
            {t("game.earlyHint")}
          </p>
        </div>
      )}

      {(gameState === "review" || gameState === "standings" || gameState === "finished") && (
        <EmojiToolbar onEmojiClick={sendReaction} />
      )}

      <DatabaseStatus />
    </div>
  );
}
