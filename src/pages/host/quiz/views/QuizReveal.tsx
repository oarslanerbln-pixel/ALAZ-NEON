import { motion } from "framer-motion";

import { useLocale } from "../../../../hooks/useLocale";
import type { QuizQuestion } from "../../../../types/database";
import type { FastestWinner, VoteStats } from "../../../../lib/quizScoring";

interface Props {
  currentQuestion: QuizQuestion | null;
  voteStats: VoteStats;
  fastestWinner: FastestWinner | null;
  onShowLeaderboard: () => void;
}

/** Doğru cevap, oy dağılımı ve en hızlı doğru. HostQuizDisplay'den ayrıştırıldı (docs/roadmap.md, 2.7). */
export function QuizReveal({ currentQuestion, voteStats, fastestWinner, onShowLeaderboard }: Props) {
  const { t } = useLocale();
  return (
    <motion.div
      key="reveal"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center w-full max-w-6xl"
    >
      {!currentQuestion ? (
        <div className="text-white/50 text-2xl animate-pulse">{t("quiz.loading")}</div>
      ) : (
        <>
          <div className="flex items-center justify-between w-full mb-6">
            <span className="text-2xl font-black text-green-400 uppercase tracking-widest flex items-center gap-2">
              <span>🎯</span> {t("quiz.correctAnswer")}
            </span>

            {/* Speed Demon Spotlight */}
            {fastestWinner && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-yellow-500/20 border border-yellow-400 px-6 py-2 rounded-full flex items-center gap-3 shadow-[0_0_20px_rgba(250,204,21,0.5)]"
              >
                <span className="text-xl">⚡</span>
                <span className="text-yellow-400 font-black uppercase text-sm tracking-wider">
                  {t("quiz.fastestPlayer")}: <strong className="text-white font-bold">{fastestWinner.nickname}</strong> ({fastestWinner.timeTakenSec}s)
                </span>
              </motion.div>
            )}
          </div>

          {/* Options with Vote Breakdown Bars */}
          <div className="grid grid-cols-2 gap-6 w-full mb-8">
            {(["A", "B", "C", "D"] as const).map(opt => {
              const isCorrect = currentQuestion.correctOption === opt;
              const count = voteStats[opt] || 0;
              const percentage = voteStats.total > 0 ? Math.round((count / voteStats.total) * 100) : 0;

              return (
                <div 
                  key={opt} 
                  className={`p-6 rounded-xl border-2 relative overflow-hidden flex flex-col justify-between transition-all duration-700 ${
                    isCorrect 
                      ? "bg-green-500/25 border-green-500 shadow-[0_0_50px_rgba(34,197,94,0.7)] scale-[1.02]" 
                      : "bg-black/50 border-white/10 opacity-40"
                  }`}
                >
                  {/* Vote Percentage Fill Bar */}
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`absolute inset-y-0 left-0 ${isCorrect ? "bg-green-500/20" : "bg-white/5"} pointer-events-none`}
                  />

                  <div className="flex items-center gap-4 relative z-10">
                    <div className={`w-14 h-14 rounded-lg flex items-center justify-center text-3xl font-black ${
                      isCorrect ? "bg-green-500 text-black shadow-[0_0_20px_rgba(34,197,94,0.8)]" : "border border-white/20 text-gray-400"
                    }`}>
                      {opt}
                    </div>
                    <div className={`text-2xl font-bold flex-1 text-left ${isCorrect ? "text-green-300 font-black" : "text-gray-400"}`}>
                      {currentQuestion.options[opt]}
                    </div>
                  </div>

                  {/* Vote stats footer */}
                  <div className="flex justify-between items-center mt-4 pt-3 border-t border-white/10 relative z-10 text-sm font-mono">
                    <span className={isCorrect ? "text-green-400 font-bold" : "text-gray-500"}>
                      {count} Oyuncu
                    </span>
                    <span className={`font-black ${isCorrect ? "text-green-400 text-lg" : "text-gray-500"}`}>
                      %{percentage}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Fun Fact Card */}
          {currentQuestion.funFact && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full bg-gradient-to-r from-blue-950/40 via-purple-950/30 to-blue-950/40 border border-blue-500/40 p-6 rounded-xl mb-8 flex items-start gap-4 shadow-[0_0_30px_rgba(59,130,246,0.2)]"
            >
              <span className="text-3xl">💡</span>
              <div className="text-left">
                <h4 className="text-cyan-400 font-black uppercase text-sm tracking-widest mb-1">
                  {t("quiz.funFactTitle")}
                </h4>
                <p className="text-gray-200 text-lg font-medium leading-relaxed">
                  {currentQuestion.funFact}
                </p>
              </div>
            </motion.div>
          )}

          <button
            onClick={onShowLeaderboard}
            className="px-14 py-5 bg-white hover:bg-gray-100 text-black font-black text-2xl uppercase tracking-widest rounded-xl shadow-[0_0_40px_rgba(255,255,255,0.7)] transition-all transform hover:scale-105 active:scale-95 flex items-center gap-4"
          >
            {t("quiz.seeRanking")} <span>→</span>
          </button>
        </>
      )}
    </motion.div>
  );
}
