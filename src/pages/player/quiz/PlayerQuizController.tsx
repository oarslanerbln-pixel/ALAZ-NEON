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

  // Senkron çift-gönderim kilidi. React state (hasSubmitted) asenkron
  // güncellendiği için aynı olay döngüsü tiki içinde gelen iki dokunuş
  // (mobil "ghost click" çift tetiklemesi gibi) ikisi de hasSubmitted'i
  // henüz false görüp iki cevap dokümanı yazabiliyordu. Host tarafı artık
  // oyuncu başına tekilleştirip çift puanlamayı engelliyor, ama gereksiz
  // ikinci bir Firestore yazmasını burada engellemek daha temiz.
  const hasSubmittedRef = useRef(false);

  // Oda durumunu RENDER sırasında senkronla (React'in "prop değişince state'i
  // ayarla" deseni). Effect içinde yapmak fazladan bir render turu doğuruyordu.
  if (room.status !== gameState) {
    // Reset selections on new question
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

  // Refs must not be mutated during render, so mirror hasSubmitted into the
  // ref here instead (handleSubmit still sets the ref synchronously and
  // ahead of setHasSubmitted for the actual double-tap guard — this just
  // keeps the ref in sync for the "new question" reset above).
  useEffect(() => {
    hasSubmittedRef.current = hasSubmitted;
  }, [hasSubmitted]);

  // Check if player already submitted for this question
  useEffect(() => {
    const checkSubmission = async () => {
      if (room.status === "question_active" && !hasSubmitted) {
        const questionIndexStr = room.current_question_index?.toString() || "0";
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
          setSelectedOption(snapshot.docs[0].data().data.selectedOption);
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
      const questionIndexStr = room.current_question_index?.toString() || "0";
      await addDoc(collection(db, "answers"), {
        room_id: room.id,
        player_id: player.id,
        round_letter: questionIndexStr, // using round_letter for question index in quiz mode
        data: {
          selectedOption: option
        },
        created_at: serverTimestamp() // For accurate speed bonus calculation on the host
      });
      haptics.success();
    } catch (err) {
      console.error("Failed to submit quiz answer", err);
      hasSubmittedRef.current = false;
      setHasSubmitted(false);
      setSelectedOption(null);
    }
  }, [room.id, room.current_question_index, player.id]);

  // Auto-submit on time up. Gönderimi bir tik sonraya alıyoruz: effect içinde
  // senkron setState zincirleme render doğuruyor (PlayerGame'deki otomatik
  // gönderim de aynı deseni kullanıyor).
  useEffect(() => {
    if (room.status === "question_reveal" && !hasSubmitted && selectedOption) {
      const t = setTimeout(() => handleSubmit(selectedOption), 0);
      return () => clearTimeout(t);
    }
  }, [room.status, hasSubmitted, selectedOption, handleSubmit]);

  const currentQ = room.quiz_questions?.[room.current_question_index || 0];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 h-screen overflow-hidden bg-black relative">
      <ParticleBackground speedMultiplier={gameState === "question_active" && (room.time_left || 0) <= 5 ? 5 : 1} />
      
      {gameState === "question_active" && (room.time_left || 0) <= 5 && (
        <div className="absolute inset-0 bg-red-500/10 animate-pulse pointer-events-none z-0" />
      )}

      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-20">
        <div className="bg-black/60 border border-white/10 px-4 py-2 text-white font-bold">
          {player.nickname}
        </div>
        <div className="bg-black/60 border border-alaz-orange/30 px-4 py-2 text-alaz-orange font-bold">
          {player.total_score} {t("quiz.pts")}
        </div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <AnimatePresence mode="wait">
          
          {(gameState === "lobby" || gameState === "quiz_lobby") && (
            <motion.div
              key="lobby"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <div className="bg-black/80 border border-blue-500/50 p-8 rounded-xl shadow-[0_0_30px_rgba(59,130,246,0.3)]">
                <h2 className="text-2xl font-black text-blue-400 uppercase tracking-widest mb-4">
                  {t("quiz.title")}
                </h2>
                <p className="text-gray-400 font-medium">
                  {t("quiz.watchMainScreen")}
                </p>
              </div>
            </motion.div>
          )}

          {(gameState === "question_intro" || gameState === "quiz_intro") && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <h2 className="text-3xl font-black text-white uppercase tracking-widest mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">
                {t("quiz.getReady")}
              </h2>
              <p className="text-blue-400 font-bold">
                {t("quiz.questionOf", room.current_round, room.total_rounds)}
              </p>
            </motion.div>
          )}

          {gameState === "question_active" && !currentQ && (
            <motion.div
              key="loading-q"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <div className="text-white/50 text-2xl animate-pulse">{t("quiz.loading")}</div>
            </motion.div>
          )}

          {gameState === "question_active" && currentQ && (
            <motion.div
              key="active"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="w-full flex flex-col gap-4 mt-12"
            >
              {(["A", "B", "C", "D"] as const).map(opt => {
                const isSelected = selectedOption === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => !hasSubmitted && handleSubmit(opt)}
                    disabled={hasSubmitted}
                    className={`w-full p-6 text-left border-2 transition-all duration-300 flex items-center gap-4 touch-ripple-effect ${
                      isSelected 
                        ? "bg-blue-600/30 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.5)]" 
                        : "bg-black/60 border-white/20 hover:border-white/50 active:scale-[0.98]"
                    } ${hasSubmitted && !isSelected ? "opacity-50" : ""}`}
                  >
                    <div className={`w-12 h-12 flex items-center justify-center text-xl font-black ${
                      isSelected ? "bg-blue-500 text-white" : "border border-white/20 text-gray-400"
                    }`}>
                      {opt}
                    </div>
                    <div className={`text-xl font-bold flex-1 ${isSelected ? "text-white" : "text-gray-300"}`}>
                      {currentQ.options[opt]}
                    </div>
                  </button>
                );
              })}
              {hasSubmitted && (
                <p className="text-center text-blue-400 font-bold mt-4 animate-pulse">
                  {t("quiz.answerSaved")}
                </p>
              )}
            </motion.div>
          )}

          {gameState === "question_reveal" && currentQ && (
            <motion.div
              key="reveal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center w-full"
            >
              <h2 className="text-2xl font-black text-white uppercase tracking-widest mb-8">
                {t("quiz.result")}
              </h2>
              <div className="flex flex-col gap-4">
                {(["A", "B", "C", "D"] as const).map(opt => {
                  const isCorrect = currentQ.correctOption === opt;
                  const isSelected = selectedOption === opt;
                  
                  let bgColor = "bg-black/40 border-white/10 opacity-40";
                  let textColor = "text-gray-500";
                  
                  if (isCorrect) {
                    bgColor = "bg-green-500/20 border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.4)]";
                    textColor = "text-green-400";
                  } else if (isSelected) {
                    bgColor = "bg-red-500/20 border-red-500";
                    textColor = "text-red-400";
                  }
                  
                  return (
                    <div key={opt} className={`p-4 border-2 flex items-center gap-4 ${bgColor}`}>
                      <div className={`w-10 h-10 flex items-center justify-center font-black ${
                        isCorrect ? "bg-green-500 text-black" : (isSelected ? "bg-red-500 text-white" : "border border-white/20")
                      }`}>
                        {opt}
                      </div>
                      <div className={`text-lg font-bold flex-1 text-left ${textColor}`}>
                        {currentQ.options[opt]}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {gameState === "quiz_leaderboard" && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <div className="bg-black/80 border border-alaz-orange/50 p-8 rounded-xl shadow-[0_0_30px_rgba(255,77,0,0.3)]">
                <h2 className="text-2xl font-black text-alaz-orange uppercase tracking-widest mb-4">
                  {t("quiz.ranking")}
                </h2>
                <p className="text-white font-medium text-lg">
                  {t("quiz.followRankingOnScreen")}
                </p>
                <div className="mt-6 pt-6 border-t border-white/10">
                  <p className="text-gray-400 text-sm">{t("quiz.yourScore")}</p>
                  <p className="text-3xl font-black text-alaz-orange">{player.total_score}</p>
                </div>
              </div>
            </motion.div>
          )}

          {gameState === "finished" && (
            <motion.div
              key="finished"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <h2 className="text-4xl font-black text-white uppercase tracking-widest mb-6">
                {t("quiz.gameOver")}
              </h2>
              <div className="bg-gradient-to-b from-alaz-orange/20 to-black/60 border border-alaz-orange p-8">
                <p className="text-gray-400 mb-2">{t("quiz.finalScore")}</p>
                <div className="text-5xl font-black text-alaz-orange">{player.total_score}</div>
              </div>
            </motion.div>
          )}

          {!["lobby", "quiz_lobby", "question_intro", "quiz_intro", "question_active", "question_reveal", "quiz_leaderboard", "finished"].includes(gameState) && (
            <motion.div
              key="fallback"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center text-center"
            >
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-gray-400 uppercase tracking-widest">{t("game.loading" as never) || "YÜKLENİYOR..."}</p>
            </motion.div>
          )}
          
        </AnimatePresence>
      </div>
    </div>
  );
}
