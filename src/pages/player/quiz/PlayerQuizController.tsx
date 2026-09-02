import { useState, useEffect, useCallback, useRef } from "react";
import { collection, addDoc, query, where, getDocs, limit, serverTimestamp } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { AnimatePresence, motion } from "framer-motion";
import { ParticleBackground } from "../../../components/ParticleBackground";
import { SoundManager, sounds } from "../../../lib/audio";
import { haptics } from "../../../lib/haptics";
import type { Room, Player } from "../../../types/database";
import { useLocale } from "../../../hooks/useLocale";

interface PlayerQuizControllerProps {
  room: Room;
  player: Player;
}

export function PlayerQuizController({ room, player }: PlayerQuizControllerProps) {
  const { t } = useLocale();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [gameState, setGameState] = useState(room.status);

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

  const optionColorConfig = {
    A: {
      border: "border-cyan-500",
      bg: "bg-cyan-500/15",
      activeBg: "bg-cyan-500",
      glow: "shadow-[0_0_25px_rgba(6,182,212,0.6)]",
      badge: "bg-cyan-500/20 text-cyan-400 border-cyan-500",
    },
    B: {
      border: "border-pink-500",
      bg: "bg-pink-500/15",
      activeBg: "bg-pink-500",
      glow: "shadow-[0_0_25px_rgba(236,72,153,0.6)]",
      badge: "bg-pink-500/20 text-pink-400 border-pink-500",
    },
    C: {
      border: "border-amber-400",
      bg: "bg-amber-500/15",
      activeBg: "bg-amber-400",
      glow: "shadow-[0_0_25px_rgba(251,191,36,0.6)]",
      badge: "bg-amber-500/20 text-amber-400 border-amber-400",
    },
    D: {
      border: "border-emerald-500",
      bg: "bg-emerald-500/15",
      activeBg: "bg-emerald-500",
      glow: "shadow-[0_0_25px_rgba(16,185,129,0.6)]",
      badge: "bg-emerald-500/20 text-emerald-400 border-emerald-500",
    },
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-4 min-h-screen bg-black text-white relative overflow-hidden select-none">
      <ParticleBackground speedMultiplier={gameState === "question_active" && (room.time_left || 0) <= 5 ? 5 : 1} />
      
      {gameState === "question_active" && (room.time_left || 0) <= 5 && (
        <div className="absolute inset-0 bg-red-600/15 animate-pulse pointer-events-none z-0" />
      )}

      {/* Top Status Header */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20">
        <div className="bg-black/70 border border-white/20 px-4 py-2 rounded-lg font-bold text-white flex items-center gap-2 backdrop-blur-md shadow-[0_0_15px_rgba(0,0,0,0.5)]">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>{player.nickname}</span>
        </div>
        <div className="bg-black/70 border border-alaz-orange/50 px-4 py-2 rounded-lg font-black text-alaz-orange flex items-center gap-1.5 backdrop-blur-md shadow-[0_0_15px_rgba(255,77,0,0.3)]">
          <span>⚡</span>
          <span>{player.total_score}</span>
          <span className="text-xs text-gray-400 font-normal">{t("quiz.pts")}</span>
        </div>
      </div>

      <div className="relative z-10 w-full max-w-md pt-12 pb-6">
        <AnimatePresence mode="wait">
          
          {/* LOBBY */}
          {(gameState === "lobby" || gameState === "quiz_lobby") && (
            <motion.div
              key="lobby"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <div className="bg-black/80 border-2 border-blue-500/50 p-8 rounded-2xl shadow-[0_0_40px_rgba(59,130,246,0.3)] backdrop-blur-md">
                <div className="text-5xl mb-4 animate-bounce">⚡</div>
                <h2 className="text-2xl font-black text-blue-400 uppercase tracking-widest mb-3">
                  {t("quiz.title")}
                </h2>
                <p className="text-gray-300 font-medium text-base leading-relaxed">
                  {t("quiz.watchMainScreen")}
                </p>
              </div>
            </motion.div>
          )}

          {/* QUESTION INTRO */}
          {(gameState === "question_intro" || gameState === "quiz_intro") && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="text-center"
            >
              <div className="bg-gradient-to-b from-blue-950/40 to-black/80 border border-blue-500/40 p-8 rounded-2xl shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                <span className="px-4 py-1.5 rounded-full bg-blue-500/20 border border-blue-500 text-blue-400 font-mono text-sm uppercase tracking-widest font-bold inline-block mb-4">
                  {t("quiz.questionCounter", currentRound, totalRounds)}
                </span>
                <h2 className="text-3xl font-black text-white uppercase tracking-widest mb-3 drop-shadow-[0_0_20px_rgba(255,255,255,0.6)]">
                  {t("quiz.getReady")}
                </h2>
                <p className="text-cyan-400 font-medium text-sm">
                  {t("quiz.waitingForTimer")}
                </p>
              </div>
            </motion.div>
          )}

          {/* ACTIVE QUESTION - 4 NEON TACTILE CARDS */}
          {gameState === "question_active" && currentQ && (
            <motion.div
              key="active"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="w-full flex flex-col gap-3.5"
            >
              {/* Question preview & Category on player device */}
              <div className="bg-black/70 border border-white/15 p-4 rounded-xl text-center mb-1 backdrop-blur-sm">
                {currentQ.category && (
                  <span className="text-xs font-mono uppercase text-alaz-orange font-bold tracking-widest block mb-1">
                    {currentQ.category}
                  </span>
                )}
                <h3 className="text-base font-bold text-white leading-snug line-clamp-3">
                  {currentQ.text}
                </h3>
              </div>

              {(["A", "B", "C", "D"] as const).map(opt => {
                const isSelected = selectedOption === opt;
                const config = optionColorConfig[opt];

                return (
                  <motion.button
                    key={opt}
                    whileTap={{ scale: hasSubmitted ? 1 : 0.96 }}
                    onClick={() => !hasSubmitted && handleSubmit(opt)}
                    disabled={hasSubmitted}
                    className={`w-full p-4 rounded-xl border-2 transition-all duration-200 flex items-center gap-4 text-left relative overflow-hidden ${
                      isSelected 
                        ? `${config.activeBg} border-white text-black ${config.glow} scale-[1.02]` 
                        : `${config.bg} ${config.border} text-white hover:border-white/60 active:scale-95`
                    } ${hasSubmitted && !isSelected ? "opacity-35 grayscale" : ""}`}
                  >
                    <div className={`w-11 h-11 rounded-lg border flex items-center justify-center text-xl font-black shrink-0 ${
                      isSelected ? "bg-black text-white border-black" : config.badge
                    }`}>
                      {opt}
                    </div>
                    <div className="text-lg font-bold flex-1 leading-snug">
                      {currentQ.options[opt]}
                    </div>
                    {isSelected && (
                      <span className="text-xl font-black">🔒</span>
                    )}
                  </motion.button>
                );
              })}

              {hasSubmitted && (
                <motion.div 
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center py-2 bg-blue-500/20 border border-blue-500/50 rounded-xl"
                >
                  <p className="text-cyan-300 font-black text-sm tracking-wider uppercase flex items-center justify-center gap-2">
                    <span className="animate-spin">⚡</span>
                    {t("quiz.answerSaved")}
                  </p>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* QUESTION REVEAL SCREEN */}
          {gameState === "question_reveal" && currentQ && (() => {
            const isCorrect = selectedOption === currentQ.correctOption;
            return (
              <motion.div
                key="reveal"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="text-center w-full"
              >
                <div className={`p-8 rounded-2xl border-2 mb-6 backdrop-blur-md ${
                  isCorrect 
                    ? "bg-green-500/20 border-green-400 shadow-[0_0_50px_rgba(34,197,94,0.5)]" 
                    : "bg-red-500/20 border-red-500 shadow-[0_0_40px_rgba(239,68,68,0.4)]"
                }`}>
                  <div className="text-5xl mb-3">
                    {isCorrect ? "🎯" : "💀"}
                  </div>
                  <h2 className={`text-2xl font-black uppercase tracking-wider mb-2 ${
                    isCorrect ? "text-green-400" : "text-red-400"
                  }`}>
                    {isCorrect ? t("quiz.playerCorrect") : t("quiz.playerWrong")}
                  </h2>
                  <p className="text-sm text-gray-300 font-medium">
                    {t("quiz.correctAnswer")}: <strong className="text-white font-bold">{currentQ.correctOption} — {currentQ.options[currentQ.correctOption]}</strong>
                  </p>
                </div>

                <p className="text-gray-400 text-sm animate-pulse">
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
              className="text-center"
            >
              <div className="bg-black/80 border-2 border-alaz-orange/50 p-8 rounded-2xl shadow-[0_0_30px_rgba(255,77,0,0.3)] backdrop-blur-md">
                <div className="text-4xl mb-3">🏆</div>
                <h2 className="text-2xl font-black text-alaz-orange uppercase tracking-widest mb-2">
                  {t("quiz.ranking")}
                </h2>
                <p className="text-gray-300 text-sm mb-6">
                  {t("quiz.followRankingOnScreen")}
                </p>
                <div className="pt-4 border-t border-white/10 flex justify-between items-center px-4">
                  <span className="text-gray-400 text-sm">{t("quiz.yourScore")}</span>
                  <span className="text-3xl font-black text-alaz-orange">{player.total_score}</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* GAME OVER FINISHED */}
          {gameState === "finished" && (
            <motion.div
              key="finished"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <div className="bg-gradient-to-b from-alaz-orange/25 to-black/90 border-2 border-alaz-orange p-8 rounded-2xl shadow-[0_0_50px_rgba(255,77,0,0.4)]">
                <div className="text-5xl mb-3 animate-bounce">👑</div>
                <h2 className="text-3xl font-black text-white uppercase tracking-widest mb-4">
                  {t("quiz.gameOver")}
                </h2>
                <p className="text-gray-300 text-sm mb-2">{t("quiz.finalScore")}</p>
                <div className="text-5xl font-black text-alaz-orange mb-4">{player.total_score}</div>
                <p className="text-xs text-gray-400 uppercase tracking-widest">{t("quiz.watchMainScreen")}</p>
              </div>
            </motion.div>
          )}

          {/* FALLBACK LOADING */}
          {!["lobby", "quiz_lobby", "question_intro", "quiz_intro", "question_active", "question_reveal", "quiz_leaderboard", "finished"].includes(gameState) && (
            <motion.div
              key="fallback"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center text-center"
            >
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-gray-400 uppercase tracking-widest font-mono text-sm">{t("quiz.loading")}</p>
            </motion.div>
          )}
          
        </AnimatePresence>
      </div>
    </div>
  );
}
