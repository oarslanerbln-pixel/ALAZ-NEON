import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSearchParams, useNavigate, Navigate } from "react-router-dom";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { retentionExpiry } from "../../lib/retention";
import { isAlreadyExists } from "../../lib/errors";
import { HostOfflineBanner } from "../../components/HostOfflineBanner";
import { DatabaseStatus } from "../../components/DatabaseStatus";
import { RoomStatusScreen } from "../../components/RoomStatusScreen";
import { isRetiredGame, resolvePlayerGameRoute } from "../../lib/gameRouting";
import { useToast } from "../../contexts/ToastContextCore";
import { sounds, SoundManager } from "../../lib/audio";
import { useLocale } from "../../hooks/useLocale";

// Hooks
import { useRoom } from "../../hooks/useRoom";
import { usePlayer } from "../../hooks/usePlayer";
import { usePlayerPresence } from "../../hooks/useHeartbeat";
import { PLAYER_HEARTBEAT_MS } from "../../lib/liveness";

// Extracted Components
import { PlayerHeader } from "./components/PlayerHeader";
import { PlayerLobby } from "./views/PlayerLobby";
import { PlayerPlaying } from "./views/PlayerPlaying";
import { PlayerReview } from "./views/PlayerReview";
import { PlayerStandings } from "./views/PlayerStandings";
import { PlayerBackground } from "../../components/PlayerBackground";
import { PlayerTutorial } from "./components/PlayerTutorial";
import { PlayerStageScreen } from "./components/PlayerStageScreen";
import { PlayerIntroVideo } from "./components/PlayerIntroVideo";
import { LetterSpinner } from "../../components/LetterSpinner";

import { Suspense } from "react";
import { PLAYER_GAME_CONTROLLERS } from "./gameControllers";
import { PlayerGameShell } from "./components/PlayerGameShell";

export function PlayerGame() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const roomId = searchParams.get("roomId") || localStorage.getItem("cafe_game_roomId");
  const playerId = searchParams.get("playerId") || localStorage.getItem("cafe_game_playerId");

  // Centralized State Management via Hooks
  const { room, loading: roomLoading, error: roomError } = useRoom(roomId);
  const { player, loading: playerLoading, error: playerError } = usePlayer(playerId);
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

  // Canlılık sinyali — hayalet oyuncuya bomba/voltaj geçmesini önlüyor.
  // Oyuncu belgesine değil presence/{uid} belgesine: bkz. usePlayerPresence.
  usePlayerPresence(roomId, player?.uid, PLAYER_HEARTBEAT_MS);

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
          created_at: new Date().toISOString(),
          expires_at: retentionExpiry(),
        });
      } catch (err) {
        // Onay yolda kaybolup SDK yeniden gönderince "zaten var": cevap
        // kayıtlı; hata gösterip ikinci kez göndertmemek gerek.
        if (!isAlreadyExists(err)) submitError = err;
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

  // Durum kapıları — tüm hook'lardan SONRA. Eskiden oda/oyuncu yokken
  // (silinmiş oda, eski bağlantı, başka odanın oyuncu kaydı) misafir sessizce
  // sonsuz bir lobide bekliyordu; artık ne olduğunu ve ne yapacağını görüyor.
  if (!roomId || !playerId) return <Navigate to="/join" replace />;
  const listenError = roomError ?? playerError;
  if (listenError) return <RoomStatusScreen kind="error" audience="player" />;
  if (roomLoading || playerLoading) return <RoomStatusScreen kind="loading" audience="player" />;
  if (!room) return <RoomStatusScreen kind="notfound" audience="player" />;
  if (!player || player.room_id !== room.id) {
    return <RoomStatusScreen kind="playerMissing" audience="player" roomCode={room.code} />;
  }

  if (gameState === "closed") {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-8 text-center">
        <h1 className="text-4xl font-extrabold text-ink mb-4">
          {t("game.roomClosed")}
        </h1>
        <p className="text-ink-2 mb-8">{t("game.roomClosedDesc")}</p>
        <button
          onClick={() => navigate("/")}
          className="btn-primary px-8 h-14 text-lg"
        >
          {t("game.backHome")}
        </button>
      </div>
    );
  }

  const routedGame = resolvePlayerGameRoute(room);
  if (routedGame) {
    const GameController = PLAYER_GAME_CONTROLLERS[routedGame];
    return (
      <>
        <HostOfflineBanner room={room} />
        <PlayerGameShell>
          <Suspense fallback={<RoomStatusScreen kind="loading" audience="player" />}>
            <GameController room={room} player={player} />
          </Suspense>
        </PlayerGameShell>
      </>
    );
  }

  // Render tutorial for all game modes if status is tutorial
  if (room?.status === "tutorial") {
    return <PlayerTutorial room={room} />;
  }

  return (
    <>
    <HostOfflineBanner room={room} />
    <div 
      className="min-h-[100dvh] flex flex-col text-ink relative overflow-hidden"
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
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="absolute inset-0 bg-accent/10 pointer-events-none z-50 flex items-center justify-center"
          >
            <div className="absolute inset-0 border-4 border-accent/50" />
          </motion.div>
        )}
        {submitStatus === "error" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-bad/20 pointer-events-none z-50"
          />
        )}
      </AnimatePresence>
      <PlayerBackground />
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
          {(gameState === "lobby" || gameState === "night_lobby" || isRetiredGame(room.active_game)) && <PlayerLobby room={room} roomId={roomId} playerId={playerId} />}

          {(gameState === "intro" || gameState === "gameIntro") && (
            <PlayerIntroVideo
              currentRound={currentRound || 1}
              totalRounds={room?.total_rounds || 3}
              gameTitle="HENGAME ARENA"
            />
          )}

          {gameState === "countdown" && (
            <motion.div
              key="countdown"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex-1 flex flex-col items-center justify-center min-h-[60vh] w-full"
            >
              <LetterSpinner
                targetLetter={room?.next_letter || room?.active_letter || activeLetter}
              />
            </motion.div>
          )}

          {gameState === "ad_break" && (
            <motion.div
              key="ad_break"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex-1 flex flex-col justify-center min-h-[60vh]"
            >
              <PlayerStageScreen
                icon="⚡"
                tone="orange"
                eyebrow={t("game.roundHint", currentRound || 1, room?.total_rounds || 3)}
                title={t("game.adBreakTitle")}
                body={t("game.adBreakDesc")}
                waiting
              />
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

      <DatabaseStatus />
    </div>
  </>
  );
}

