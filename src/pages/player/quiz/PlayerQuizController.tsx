import { useState, useEffect, useCallback, useRef } from "react";
import { collection, addDoc, query, where, getDocs, limit, serverTimestamp } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { retentionExpiry } from "../../../lib/retention";
import { AnimatePresence, motion } from "framer-motion";
import { SoundManager, sounds } from "../../../lib/audio";
import { haptics } from "../../../lib/haptics";
import type { Room, Player } from "../../../types/database";
import { revealedOption } from "../../../lib/quizReveal";
import { useLocale } from "../../../hooks/useLocale";
import { gameTitle } from "../../../lib/gameCatalog";
import { PlayerStageScreen } from "../components/PlayerStageScreen";
import { QuizTimerBar } from "./QuizTimerBar";
import { NumberTicker } from "../../../components/fx";
import { SPRING, STAGGER } from "../../../lib/motion";

interface PlayerQuizControllerProps {
  room: Room;
  player: Player;
}

export function PlayerQuizController({ room, player }: PlayerQuizControllerProps) {
  const { t } = useLocale();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [gameState, setGameState] = useState(room.status);
  const [urgent, setUrgent] = useState(false);
  void urgent;
  const [joinedMidQuestion] = useState(() => (room.status === "question_active" ? room.current_question_index ?? 0 : null));

  // Synchronous double-tap submission lock
  const hasSubmittedRef = useRef(false);

  // Synchronize game state during render
  if (room.status !== gameState) {
    if (
      (room.status === "question_intro" || room.status === "question_active") &&
      gameState !== "question_active" &&
      gameState !== "question_intro"
    ) {
      setSelectedOption(null);
      setHasSubmitted(false);
    }
    setGameState(room.status);
  }

  useEffect(() => {
    hasSubmittedRef.current = hasSubmitted;
  }, [hasSubmitted]);

  // Check if player already submitted for this question
  useEffect(() => {
    const checkSubmission = async () => {
      if (room.status === "question_active" && !hasSubmitted) {
        const questionIndexStr = (room.current_question_index ?? 0).toString();
        const q = query(
          collection(db, "answers"),
          where("room_id", "==", room.id),
          where("player_id", "==", player.id),
          where("round_letter", "==", questionIndexStr),
          limit(1)
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          hasSubmittedRef.current = true;
          setHasSubmitted(true);
          setSelectedOption(snapshot.docs[0].data().data?.selectedOption);
        }
      }
    };
    checkSubmission();
  }, [room.status, room.id, player.id, room.current_question_index, hasSubmitted]);

  const handleSubmit = useCallback(async (option: string) => {
    if (hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;

    haptics.tap();
    SoundManager.getInstance().playSFX(sounds.CLICK);
    setSelectedOption(option);
    setHasSubmitted(true);

    try {
      const questionIndexStr = (room.current_question_index ?? 0).toString();
      await addDoc(collection(db, "answers"), {
        room_id: room.id,
        player_id: player.id,
        round_letter: questionIndexStr,
        data: {
          selectedOption: option,
        },
        created_at: serverTimestamp(),
        expires_at: retentionExpiry(),
      });
      haptics.success();
    } catch (err) {
      console.error("Failed to submit quiz answer", err);
      hasSubmittedRef.current = false;
      setHasSubmitted(false);
      setSelectedOption(null);
    }
  }, [room.id, room.current_question_index, player.id]);

  // Auto-submit on time up
  useEffect(() => {
    if (room.status === "question_reveal" && !hasSubmitted && selectedOption) {
      const timer = setTimeout(() => handleSubmit(selectedOption), 0);
      return () => clearTimeout(timer);
    }
  }, [room.status, hasSubmitted, selectedOption, handleSubmit]);

  const currentQ = room.quiz_questions?.[room.current_question_index || 0];
  const currentRound = room.current_round || (room.current_question_index ?? 0) + 1;
  const totalRounds = room.total_rounds || 5;

  return (
    // 100dvh: mobil tarayıcının adres çubuğu açıkken 100vh ekranı taşırıp
    // kaydırma çubuğu çıkarıyordu. Üst/alt dolgu çentik ve home bar için.
    <div className="flex-1 flex flex-col items-center justify-between min-h-[100dvh] bg-[#07070d] text-white relative overflow-hidden select-none pt-[env(safe-area-inset-top)] pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      {gameState === "question_active" && (
        <QuizTimerBar
          key={room.current_question_index ?? 0}
          durationSec={room.timer_setting || 30}
          roundEndTime={room.round_end_time}
          live={joinedMidQuestion !== (room.current_question_index ?? 0)}
          onUrgentChange={setUrgent}
        />
      )}

      {/* Top Status Bar */}
      <header className="w-full max-w-md mx-auto px-4 pt-4 pb-2 flex justify-between items-center z-20">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/10 backdrop-blur-xl">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-bold text-white/90 truncate max-w-[140px]">{player.nickname}</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-alaz-orange/10 border border-alaz-orange/30 text-alaz-orange backdrop-blur-xl">
          <span className="text-xs">⚡</span>
          {/* Açılışta sıfırdan saymasın; yalnızca puan arttığında saysın. */}
          <NumberTicker value={player.total_score} initial={player.total_score} className="text-xs font-black font-mono tabular-nums" />
          <span className="text-[11px] text-white/50 uppercase">{t("quiz.pts")}</span>
        </div>
      </header>

      {/* Content Area */}
      <div className="relative z-10 w-full max-w-md px-4 flex-1 flex flex-col justify-center min-h-0">
        <AnimatePresence mode="wait">
          
          {/* LOBBY */}
          {(gameState === "lobby" || gameState === "quiz_lobby") && (
            <motion.div
              key="lobby"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <PlayerStageScreen icon="💡" tone="blue" eyebrow={gameTitle("quiz")} title={t("lobby.readyTitle")} body={t("quiz.watchMainScreen")} waiting hint={null} />
            </motion.div>
          )}

          {/* QUESTION INTRO */}
          {(gameState === "question_intro" || gameState === "quiz_intro") && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
            >
              <PlayerStageScreen
                icon="🧠"
                tone="blue"
                eyebrow={t("quiz.questionCounter", currentRound, totalRounds)}
                title={t("quiz.getReady")}
                body={t("quiz.waitingForTimer")}
                waiting
                hint={null}
              />
            </motion.div>
          )}

          {/* ACTIVE QUESTION - 4 ULTRA-CLEAN TACTILE GLASS CARDS */}
          {gameState === "question_active" && currentQ && (
            <motion.div
              key="active"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              // Soru üstte, şıklar altta: tek elle oynarken başparmak ekranın
              // alt yarısına rahat uzanıyor, üst köşelere değil.
              className="w-full flex-1 flex flex-col gap-3 py-2"
            >
              {/* Question Preview Box */}
              <div className="w-full bg-[#0d0d18]/95 border border-white/[0.09] rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-xl text-center mb-auto">
                {currentQ.category && (
                  <span className="inline-block text-[10px] font-mono uppercase text-cyan-400 font-bold tracking-[0.2em] px-2.5 py-0.5 rounded-full bg-cyan-400/10 border border-cyan-400/20 mb-2">
                    {currentQ.category}
                  </span>
                )}
                <h3 className="text-base sm:text-lg font-bold text-white leading-relaxed line-clamp-3">
                  {currentQ.text}
                </h3>
              </div>

              {/* 4 Obsidian Glass Options */}
              {(["A", "B", "C", "D"] as const).map((opt, i) => {
                const isSelected = selectedOption === opt;

                return (
                  <motion.button
                    key={opt}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: hasSubmitted && !isSelected ? 0.25 : 1, y: 0, scale: isSelected ? 1.02 : 1 }}
                    transition={{ ...SPRING.snappy, delay: hasSubmitted ? 0 : i * STAGGER.tight }}
                    whileTap={hasSubmitted ? undefined : { scale: 0.96 }}
                    onClick={() => !hasSubmitted && handleSubmit(opt)}
                    disabled={hasSubmitted}
                    className={`w-full min-h-[60px] p-4 rounded-2xl border transition-colors duration-200 flex items-center gap-3.5 text-left relative overflow-hidden select-none ${
                      isSelected
                        ? "bg-white text-black border-white shadow-[0_0_35px_rgba(255,255,255,0.35)]"
                        : "bg-[#0c0c16]/90 border-white/[0.08] text-white hover:border-white/20"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl border flex items-center justify-center text-sm font-black shrink-0 transition-colors ${
                      isSelected
                        ? "bg-black text-white border-black"
                        : "bg-white/[0.05] border-white/10 text-white/80"
                    }`}>
                      {opt}
                    </div>
                    <div className="text-base sm:text-lg font-semibold flex-1 leading-snug">
                      {currentQ.options[opt]}
                    </div>
                    {isSelected && (
                      <span className="text-base shrink-0">🔒</span>
                    )}
                  </motion.button>
                );
              })}

              {hasSubmitted && (
                <motion.div
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-2.5 px-4 bg-white/[0.04] border border-white/10 rounded-xl mt-1"
                >
                  <p className="text-white/70 font-mono text-xs tracking-wider uppercase flex items-center justify-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    {t("quiz.answerSaved", "Cevabın Kaydedildi · Gözün Ekranda Olsun")}
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* QUESTION REVEAL SCREEN */}
          {gameState === "question_reveal" && currentQ && (() => {
            const revealed = revealedOption(room, room.current_question_index ?? 0);
            if (!revealed) {
              return (
                <motion.div
                  key="reveal-pending"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center w-full py-10"
                >
                  <p className="text-white/70 font-black text-base uppercase tracking-widest animate-pulse">
                    {t("quiz.revealPending")}
                  </p>
                </motion.div>
              );
            }
            const isCorrect = selectedOption === revealed;
            return (
              <motion.div
                key="reveal"
                initial={isCorrect ? { opacity: 0, scale: 0.9 } : { opacity: 0, x: -12 }}
                animate={isCorrect ? { opacity: 1, scale: 1 } : { opacity: 1, x: [0, -8, 8, -6, 6, 0] }}
                transition={isCorrect ? SPRING.bouncy : { duration: 0.4 }}
                exit={{ opacity: 0 }}
                className="text-center w-full"
              >
                <div
                  className={`rounded-2xl border p-6 backdrop-blur-xl transition-all shadow-2xl mb-4 ${
                    isCorrect
                      ? "bg-emerald-950/70 border-emerald-400/50 text-emerald-100 shadow-[0_0_40px_rgba(16,185,129,0.2)]"
                      : "bg-rose-950/70 border-rose-500/50 text-rose-100 shadow-[0_0_40px_rgba(244,63,94,0.2)]"
                  }`}
                >
                  <div className="text-4xl mb-2">{isCorrect ? "🎯" : "💀"}</div>
                  <h2 className={`text-xl font-black uppercase tracking-wider mb-2 ${
                    isCorrect ? "text-emerald-300" : "text-rose-300"
                  }`}>
                    {isCorrect ? t("quiz.playerCorrect") : t("quiz.playerWrong")}
                  </h2>
                  <p className="text-sm text-white/80 font-medium">
                    {t("quiz.correctAnswer")}: <strong className="text-white font-bold">{revealed} — {currentQ.options[revealed]}</strong>
                  </p>
                </div>

                <p className="text-white/40 text-xs font-mono uppercase tracking-wider">
                  {t("quiz.followRankingOnScreen")}
                </p>
              </motion.div>
            );
          })()}

          {/* LEADERBOARD ON MOBILE */}
          {gameState === "quiz_leaderboard" && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
            >
              <PlayerStageScreen icon="🏆" tone="orange" eyebrow={gameTitle("quiz")} title={t("quiz.ranking")} body={t("quiz.followRankingOnScreen")} hint={null}>
                <ScoreTile label={t("quiz.yourScore")} score={player.total_score} />
              </PlayerStageScreen>
            </motion.div>
          )}

          {/* GAME OVER FINISHED */}
          {gameState === "finished" && (
            <motion.div
              key="finished"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <PlayerStageScreen icon="👑" tone="orange" eyebrow={gameTitle("quiz")} title={t("quiz.gameOver")} hint={t("common.followMainScreen")}>
                <ScoreTile label={t("quiz.finalScore")} score={player.total_score} />
              </PlayerStageScreen>
            </motion.div>
          )}

          {/* FALLBACK LOADING */}
          {!["lobby", "quiz_lobby", "question_intro", "quiz_intro", "question_active", "question_reveal", "quiz_leaderboard", "finished"].includes(gameState) && (
            <motion.div
              key="fallback"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <PlayerStageScreen icon="💡" tone="blue" eyebrow={gameTitle("quiz")} title={t("quiz.loading")} waiting hint={null} />
            </motion.div>
          )}
          
        </AnimatePresence>
      </div>

      <div className="w-full text-center py-2 text-[10px] font-mono text-white/20">
        HENGAME QUIZ
      </div>
    </div>
  );
}

function ScoreTile({ label, score }: { label: string; score: number }) {
  return (
    <div className="w-full max-w-xs rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 flex items-center justify-between backdrop-blur-md">
      <span className="text-sm font-semibold text-white/60">{label}</span>
      <NumberTicker value={score} className="text-3xl font-black text-alaz-orange tabular-nums" />
    </div>
  );
}
