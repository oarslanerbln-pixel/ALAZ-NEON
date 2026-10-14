import { motion } from "framer-motion";

import { KineticSpark } from "../../../../components/KineticSpark";
import { useLocale } from "../../../../hooks/useLocale";
import type { Player } from "../../../../types/database";

interface Props {
  players: Player[];
  onReset: () => void;
}

/** Quiz sonu podyumu. HostQuizDisplay'den ayrıştırıldı (docs/roadmap.md, 2.7). */
export function QuizFinished({ players, onReset }: Props) {
  const { t } = useLocale();
  return (
    <motion.div
      key="finished"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center w-full max-w-5xl text-center"
    >
      <KineticSpark />

      <h1 className="text-6xl md:text-7xl font-black text-alaz-orange mb-4 uppercase drop-shadow-[0_0_40px_rgba(255,77,0,0.9)] tracking-widest">
        {t("quiz.champion")}
      </h1>

      {players.length > 0 && (() => {
        const sorted = [...players].sort((a,b) => b.total_score - a.total_score);
        const first = sorted[0];
        const second = sorted[1];
        const third = sorted[2];

        return (
          <div className="w-full flex items-end justify-center gap-6 my-10 min-h-[300px]">
            {/* 2nd Place */}
            {second && (
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex-1 max-w-xs bg-gradient-to-b from-slate-400/20 to-black/80 border-2 border-slate-300 p-6 rounded-2xl flex flex-col items-center shadow-[0_0_30px_rgba(203,213,225,0.3)]"
              >
                <div className="text-4xl mb-2">🥈</div>
                <span className="text-xs font-mono uppercase text-slate-300 font-bold tracking-widest mb-1">
                  {t("quiz.podium2nd")}
                </span>
                <h3 className="text-2xl font-black text-white mb-2 truncate w-full">{second.nickname}</h3>
                <div className="text-2xl font-black text-slate-300">{second.total_score} {t("quiz.pts")}</div>
              </motion.div>
            )}

            {/* 1st Place (Champion) */}
            {first && (
              <motion.div 
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1.08 }}
                transition={{ delay: 0.5, type: "spring", bounce: 0.4 }}
                className="flex-1 max-w-sm bg-gradient-to-b from-amber-500/30 to-black/90 border-4 border-amber-400 p-8 rounded-2xl flex flex-col items-center shadow-[0_0_60px_rgba(251,191,36,0.6)] z-20"
              >
                <div className="text-6xl mb-2 animate-bounce">👑</div>
                <span className="text-sm font-mono uppercase text-amber-400 font-black tracking-widest mb-1">
                  {t("quiz.podium1st")}
                </span>
                <h2 className="text-4xl font-black text-white mb-3 truncate w-full">{first.nickname}</h2>
                <div className="text-4xl font-black text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.8)]">
                  {first.total_score} {t("quiz.pts")}
                </div>
              </motion.div>
            )}

            {/* 3rd Place */}
            {third && (
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex-1 max-w-xs bg-gradient-to-b from-amber-900/20 to-black/80 border-2 border-amber-700 p-6 rounded-2xl flex flex-col items-center shadow-[0_0_30px_rgba(180,83,9,0.3)]"
              >
                <div className="text-4xl mb-2">🥉</div>
                <span className="text-xs font-mono uppercase text-amber-600 font-bold tracking-widest mb-1">
                  {t("quiz.podium3rd")}
                </span>
                <h3 className="text-2xl font-black text-white mb-2 truncate w-full">{third.nickname}</h3>
                <div className="text-2xl font-black text-amber-600">{third.total_score} {t("quiz.pts")}</div>
              </motion.div>
            )}
          </div>
        );
      })()}

      <button
        onClick={onReset}
        className="px-14 py-5 border-2 border-white/40 text-white hover:bg-white hover:text-black font-black text-2xl uppercase tracking-widest rounded-xl transition-all shadow-[0_0_30px_rgba(255,255,255,0.3)]"
      >
        {t("quiz.newGame")}
      </button>
    </motion.div>
  );
}
