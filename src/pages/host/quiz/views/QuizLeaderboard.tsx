import { motion } from "framer-motion";

import { useLocale } from "../../../../hooks/useLocale";
import type { Player } from "../../../../types/database";

interface Props {
  currentRoundNum: number;
  totalRounds: number;
  players: Player[];
  playerStreaks: Record<string, number>;
  onNext: () => void;
}

/** Sorular arası sıralama ve seri göstergeleri. HostQuizDisplay'den ayrıştırıldı (docs/roadmap.md, 2.7). */
export function QuizLeaderboard({ currentRoundNum, totalRounds, players, playerStreaks, onNext }: Props) {
  const { t } = useLocale();
  return (
    <motion.div
      key="leaderboard"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center w-full max-w-4xl"
    >
      <div className="text-center mb-8">
        <h2 className="text-5xl font-black text-white tracking-[0.2em] uppercase drop-shadow-[0_0_30px_rgba(255,77,0,0.8)]">
          {t("quiz.currentRanking")}
        </h2>
        {currentRoundNum + 1 === totalRounds && (
          <p className="text-alaz-orange font-bold uppercase tracking-widest mt-2 animate-pulse text-lg">
            {t("quiz.finalRoundDouble")}
          </p>
        )}
      </div>

      <div className="w-full space-y-3 mb-10 max-h-[50vh] overflow-y-auto pr-2">
        {[...players].sort((a,b) => b.total_score - a.total_score).map((p, idx) => {
          const streak = playerStreaks[p.id] || 0;
          return (
            <motion.div 
              key={p.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              className={`flex items-center p-5 rounded-xl border-2 transition-all ${
                idx === 0 
                  ? "bg-amber-500/20 border-amber-400 shadow-[0_0_30px_rgba(251,191,36,0.4)]" 
                  : idx === 1
                  ? "bg-slate-300/15 border-slate-300"
                  : idx === 2
                  ? "bg-amber-700/15 border-amber-700"
                  : "bg-black/60 border-white/10"
              }`}
            >
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center text-2xl font-black mr-5 ${
                idx === 0 ? "bg-amber-400 text-black" : idx === 1 ? "bg-slate-300 text-black" : idx === 2 ? "bg-amber-700 text-white" : "bg-white/10 text-gray-400"
              }`}>
                #{idx + 1}
              </div>

              <div className="flex-1 flex items-center gap-3">
                <span className="text-2xl md:text-3xl font-black text-white">{p.nickname}</span>
                {streak >= 2 && (
                  <span className="px-3 py-1 rounded-full bg-red-600/30 border border-red-500 text-red-400 text-xs font-black uppercase tracking-wider flex items-center gap-1 animate-pulse">
                    🔥 x{streak} {streak >= 3 ? "ALEV" : ""}
                  </span>
                )}
              </div>

              <div className="text-3xl md:text-4xl font-black text-alaz-orange tabular-nums">
                {p.total_score} <span className="text-sm font-normal text-gray-400">{t("quiz.pts")}</span>
              </div>
            </motion.div>
          );
        })}
      </div>

      <button
        onClick={onNext}
        className="px-14 py-5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-black text-2xl uppercase tracking-widest rounded-xl shadow-[0_0_40px_rgba(59,130,246,0.7)] transition-all transform hover:scale-105 active:scale-95"
      >
        {currentRoundNum >= totalRounds ? t("quiz.finishGame") : t("quiz.nextQuestion")}
      </button>
    </motion.div>
  );
}
