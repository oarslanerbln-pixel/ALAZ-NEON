import { useState, useEffect, useCallback, useRef } from "react";
import { collection, addDoc, query, where, getDocs, limit, serverTimestamp } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { retentionExpiry } from "../../../lib/retention";
import { isAlreadyExists } from "../../../lib/errors";
import { AnimatePresence, motion } from "framer-motion";
import { SoundManager, sounds } from "../../../lib/audio";
import { haptics } from "../../../lib/haptics";
import type { Room, Player } from "../../../types/database";
import { revealedOption } from "../../../lib/quizReveal";
import { useLocale } from "../../../hooks/useLocale";
import { gameTitle } from "../../../lib/gameCatalog";
import { PlayerStageScreen } from "../components/PlayerStageScreen";
import { PlayerIntroVideo } from "../components/PlayerIntroVideo";
import { QuizTimerBar } from "./QuizTimerBar";
import { NumberTicker } from "../../../components/fx";
import { SPRING, STAGGER } from "../../../lib/motion";

const OPTION_THEMES = {
  A: {
    border: "border-cyan-400/50",
    glow: "shadow-[0_0_25px_rgba(0,243,255,0.25)]",
    badge: "bg-cyan-500/20 text-cyan-300 border-cyan-400/40",
    activeGlow: "shadow-[0_0_35px_rgba(0,243,255,0.5)]",
    accent: "text-cyan-400",
    corner: "border-cyan-400",
  },
  B: {
    border: "border-purple-400/50",
    glow: "shadow-[0_0_25px_rgba(192,132,252,0.25)]",
    badge: "bg-purple-500/20 text-purple-300 border-purple-400/40",
    activeGlow: "shadow-[0_0_35px_rgba(192,132,252,0.5)]",
    accent: "text-purple-400",
    corner: "border-purple-400",
  },
  C: {
    border: "border-alaz-orange/50",
    glow: "shadow-[0_0_25px_rgba(255,85,0,0.25)]",
    badge: "bg-alaz-orange/20 text-orange-300 border-alaz-orange/40",
    activeGlow: "shadow-[0_0_35px_rgba(255,85,0,0.5)]",
    accent: "text-alaz-orange",
    corner: "border-alaz-orange",
  },
  D: {
    border: "border-pink-400/50",
    glow: "shadow-[0_0_25px_rgba(244,114,182,0.25)]",
    badge: "bg-pink-500/20 text-pink-300 border-pink-400/40",
    activeGlow: "shadow-[0_0_35px_rgba(244,114,182,0.5)]",
    accent: "text-pink-400",
    corner: "border-pink-400",
  },
} as const;

interface PlayerQuizControllerProps {
  room: Room;
  player: Player;
}

export function PlayerQuizController({ room, player }: PlayerQuizControllerProps) {
  const { t } = useLocale();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [gameState, setGameState] = useState(room.status);
  const [responseSec, setResponseSec] = useState<string | null>(null);
  const questionStartTimeRef = useRef(Date.now());
  const [urgent, setUrgent] = useState(false);
  void urgent;
  const [joinedMidQuestion] = useState(() => (room.status === "question_active" ? room.current_question_index ?? 0 : null));

  // Synchronous double-tap submission lock
  const hasSubmittedRef = useRef(false);

  // Soru değişince seçim sıfırlanır.
  const questionIndex = room.current_question_index ?? 0;
  const [seenQuestionIndex, setSeenQuestionIndex] = useState(questionIndex);
  if (questionIndex !== seenQuestionIndex) {
    setSeenQuestionIndex(questionIndex);
    setSelectedOption(null);
    setHasSubmitted(false);
    setResponseSec(null);
  }

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
        questionStartTimeRef.current = Date.now();
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

  // Reset timer on question_active
  useEffect(() => {
    if (gameState === "question_active") {
      questionStartTimeRef.current = Date.now();
      setResponseSec(null);
    }
  }, [gameState, questionIndex]);

  const handleSubmit = useCallback(async (option: string) => {
    if (hasSubmittedRef.current) return;
    hasSubmittedRef.current = true;

    const elapsed = Math.max(0.2, (Date.now() - questionStartTimeRef.current) / 1000).toFixed(1);
    setResponseSec(elapsed);

    haptics.impact();
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
          responseTimeSec: Number(elapsed),
        },
        created_at: serverTimestamp(),
        expires_at: retentionExpiry(),
      });
      haptics.success();
    } catch (err) {
      if (isAlreadyExists(err)) {
        haptics.success();
        return;
      }
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
          <NumberTicker value={player.total_score} initial={player.total_score} className="text-xs font-black font-mono tabular-nums" />
          <span className="text-[11px] text-white/50 uppercase">{t("quiz.pts")}</span>
        </div>
      </header>

      {/* Content Area */}
      <div className="relative z-10 w-full max-w-md px-4 flex-1 flex flex-col justify-center min-h-0">
        <AnimatePresence mode="wait" key={questionIndex}>
          
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

          {/* INTRO VIDEO / GET READY */}
          {(gameState === "quiz_intro" || (gameState === "question_intro" && questionIndex === 0)) ? (
            <PlayerIntroVideo
              gameTitle="HENGAME QUIZ"
              currentRound={currentRound}
              totalRounds={totalRounds}
            />
          ) : gameState === "question_intro" ? (
            <motion.div
              key={`intro-${questionIndex}`}
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
          ) : null}

          {/* ACTIVE QUESTION - 4 TACTILE CYBER POWER BLOCKS */}
          {gameState === "question_active" && currentQ && (
            <motion.div
              key="active"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="w-full flex-1 flex flex-col gap-3 py-2"
            >
              {/* Question Preview Box */}
              <div className="w-full bg-[#0d0d18]/95 border border-white/[0.12] rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-xl text-center mb-auto relative overflow-hidden">
                <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-cyan-400 via-purple-400 to-alaz-orange" />
                {currentQ.category && (
                  <span className="inline-block text-[10px] font-mono uppercase text-cyan-300 font-black tracking-[0.25em] px-3 py-0.5 rounded-full bg-cyan-400/10 border border-cyan-400/30 mb-2">
                    {currentQ.category}
                  </span>
                )}
                <h3 className="text-base sm:text-lg font-bold text-white leading-relaxed line-clamp-3">
                  {currentQ.text}
                </h3>
              </div>

              {/* 4 Tactile Cyber Power Blocks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
                {(["A", "B", "C", "D"] as const).map((opt, i) => {
                  const isSelected = selectedOption === opt;
                  const theme = OPTION_THEMES[opt];

                  return (
                    <motion.button
                      key={opt}
                      data-testid={`quiz-option-${opt}`}
                      initial={{ opacity: 0, y: 14 }}
                      animate={{
                        opacity: hasSubmitted && !isSelected ? 0.25 : 1,
                        y: 0,
                        scale: isSelected ? 1.02 : 1,
                      }}
                      transition={{ ...SPRING.snappy, delay: hasSubmitted ? 0 : i * STAGGER.tight }}
                      whileTap={hasSubmitted ? undefined : { scale: 0.94 }}
                      onClick={() => !hasSubmitted && handleSubmit(opt)}
                      disabled={hasSubmitted}
                      className={`w-full min-h-[72px] sm:min-h-[80px] p-3.5 sm:p-4 rounded-2xl border-2 transition-all duration-200 flex items-center gap-3.5 text-left relative overflow-hidden select-none touch-manipulation ${
                        isSelected
                          ? "bg-white text-black border-white shadow-[0_0_40px_rgba(255,255,255,0.8)]"
                          : `bg-[#0c0c16]/90 backdrop-blur-xl ${theme.border} ${theme.glow} text-white hover:border-white/40 active:scale-[0.98]`
                      }`}
                    >
                      {/* Lazer Köşebentler */}
                      <div className={`absolute top-1 left-1 w-2.5 h-2.5 border-t-2 border-l-2 ${isSelected ? "border-black" : theme.corner}`} />
                      <div className={`absolute bottom-1 right-1 w-2.5 h-2.5 border-b-2 border-r-2 ${isSelected ? "border-black" : theme.corner}`} />

                      <div className={`w-11 h-11 rounded-xl border flex items-center justify-center text-base font-black shrink-0 transition-colors ${
                        isSelected
                          ? "bg-black text-white border-black shadow-[0_0_15px_rgba(0,0,0,0.5)]"
                          : theme.badge
                      }`}>
                        {opt}
                      </div>
                      <div className={`text-sm sm:text-base font-bold flex-1 leading-snug line-clamp-2 ${isSelected ? "text-black font-black" : "text-white"}`}>
                        {currentQ.options[opt]}
                      </div>
                      {isSelected && (
                        <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center text-xs font-black shadow-md shrink-0">
                          🔒
                        </div>
                      )}
                    </motion.button>
                  );
                })}
              </div>

              {hasSubmitted && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={SPRING.bouncy}
                  className="w-full py-2.5 px-4 bg-black/80 border border-cyan-400/40 rounded-2xl flex items-center justify-between shadow-[0_0_30px_rgba(0,243,255,0.2)] backdrop-blur-xl mt-1"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    <span className="text-white font-mono text-[11px] tracking-widest font-black uppercase">
                      {t("quiz.answerSaved")}
                    </span>
                  </div>
                  {responseSec && (
                    <span className="text-[11px] font-mono font-black text-amber-300 px-2.5 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30">
                      ⚡ {responseSec}s
                    </span>
                  )}
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
                initial={isCorrect ? { opacity: 0, scale: 0.88 } : { opacity: 0, x: -12 }}
                animate={isCorrect ? { opacity: 1, scale: 1 } : { opacity: 1, x: [0, -8, 8, -6, 6, 0] }}
                transition={isCorrect ? SPRING.bouncy : { duration: 0.4 }}
                exit={{ opacity: 0 }}
                className="text-center w-full"
              >
                <div
                  className={`rounded-3xl border-2 p-7 backdrop-blur-2xl transition-all shadow-2xl mb-4 relative overflow-hidden ${
                    isCorrect
                      ? "bg-gradient-to-b from-emerald-950/90 to-black/95 border-emerald-400 text-emerald-100 shadow-[0_0_60px_rgba(52,211,153,0.35)]"
                      : "bg-gradient-to-b from-rose-950/90 to-black/95 border-rose-500/60 text-rose-100 shadow-[0_0_60px_rgba(244,63,94,0.3)]"
                  }`}
                >
                  {/* Aura */}
                  <div className={`absolute -inset-10 ${isCorrect ? "bg-emerald-500/15" : "bg-rose-500/10"} blur-3xl pointer-events-none -z-10`} />

                  <div className="text-5xl mb-3">{isCorrect ? "🎯" : "💀"}</div>
                  <h2 className={`text-2xl font-black uppercase tracking-wider mb-2 ${
                    isCorrect ? "text-emerald-300 drop-shadow-[0_0_15px_rgba(52,211,153,0.8)]" : "text-rose-300"
                  }`}>
                    {isCorrect ? t("quiz.playerCorrect") : t("quiz.playerWrong")}
                  </h2>

                  {isCorrect && (
                    <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 font-mono font-black text-xs mb-3">
                      <span>⚡ +100 {t("quiz.pts")}</span>
                    </div>
                  )}

                  <p className="text-sm text-white/90 font-medium">
                    {t("quiz.correctAnswer")}: <strong className="text-white font-bold ml-1">{revealed} — {currentQ.options[revealed]}</strong>
                  </p>
                </div>

                <p className="text-white/50 text-xs font-mono uppercase tracking-widest">
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
