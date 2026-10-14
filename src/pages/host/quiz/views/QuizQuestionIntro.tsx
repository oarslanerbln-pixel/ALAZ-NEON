import { motion } from "framer-motion";

import { useLocale } from "../../../../hooks/useLocale";
import type { QuizQuestion } from "../../../../types/database";

interface Props {
  currentQuestion: QuizQuestion | null;
  currentRoundNum: number;
  totalRounds: number;
  isFinalRound: boolean;
  onStartTimer: () => void;
}

/** Soru öncesi "hazır ol" ekranı: soru metni ve süreyi başlatma düğmesi. HostQuizDisplay'den ayrıştırıldı (docs/roadmap.md, 2.7). */
export function QuizQuestionIntro({ currentQuestion, currentRoundNum, totalRounds, isFinalRound, onStartTimer }: Props) {
  const { t } = useLocale();
  return (
    <motion.div
      key="intro"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 1.05 }}
      className="flex flex-col items-center justify-center w-full max-w-5xl text-center"
    >
      {/* Round Badge */}
      <div className="flex items-center gap-4 mb-6">
        <span className="px-6 py-2 rounded-full bg-blue-600/30 border border-blue-500 text-blue-400 font-mono font-bold tracking-widest uppercase text-xl">
          {t("quiz.questionCounter", currentRoundNum, totalRounds)}
        </span>
        {currentQuestion?.category && (
          <span className="px-6 py-2 rounded-full bg-alaz-orange/20 border border-alaz-orange text-alaz-orange font-mono font-bold tracking-widest uppercase text-xl">
            {currentQuestion.category}
          </span>
        )}
        {isFinalRound && (
          <span className="px-6 py-2 rounded-full bg-red-600/30 border border-red-500 text-red-400 font-black tracking-widest uppercase text-xl animate-pulse">
            💥 2X FİNAL
          </span>
        )}
      </div>

      {!currentQuestion ? (
        <div className="text-white/50 text-2xl animate-pulse">{t("quiz.loading")}</div>
      ) : (
        <>
          <div className="bg-black/80 border-2 border-blue-500/40 p-16 w-full rounded-2xl shadow-[0_0_60px_rgba(59,130,246,0.25)] relative overflow-hidden backdrop-blur-md">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-500" />
            <h1 className="text-4xl md:text-6xl font-black text-white leading-tight">
              {currentQuestion.text}
            </h1>
          </div>

          <button
            onClick={onStartTimer}
            className="mt-12 px-16 py-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-black text-3xl uppercase tracking-widest rounded-xl shadow-[0_0_40px_rgba(59,130,246,0.7)] transition-all duration-300 transform hover:scale-105 active:scale-95 flex items-center gap-4"
          >
            <span>⚡</span> {t("quiz.startTimer")}
          </button>
        </>
      )}
    </motion.div>
  );
}
