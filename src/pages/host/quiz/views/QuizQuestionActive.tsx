import { motion } from "framer-motion";

import { useLocale } from "../../../../hooks/useLocale";
import { TimerRing } from "../../../../components/TimerRing";
import { BeamBorder } from "../../../../components/fx/BeamBorder";
import type { QuizQuestion, Player } from "../../../../types/database";
import type { OptionStyles } from "./quizStyles";

interface Props {
  currentQuestion: QuizQuestion | null;
  currentRoundNum: number;
  totalRounds: number;
  players: Player[];
  timeLeft: number;
  /** Soru süresi (ayardan); süre halkası buna göre boşalır. */
  maxTime: number;
  answeredCount: number;
  optionStyles: OptionStyles;
  onEndQuestion: () => void;
}

/** Soru açıkken: geri sayım, şıklar ve cevaplayan sayısı. HostQuizDisplay'den ayrıştırıldı (docs/roadmap.md, 2.7). */
export function QuizQuestionActive({ currentQuestion, currentRoundNum, totalRounds, players, timeLeft, maxTime, answeredCount, optionStyles, onEndQuestion }: Props) {
  const { t } = useLocale();
  return (
    <motion.div
      key="active"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center w-full max-w-7xl"
    >
      {!currentQuestion ? (
        <div className="text-white/50 text-2xl animate-pulse">{t("quiz.loading")}</div>
      ) : (
        <>
          {/* Top Bar: Category & Live Answered Counter */}
          <div className="flex justify-between items-center w-full mb-6 px-4">
            <div className="flex items-center gap-3">
              <span className="px-4 py-1.5 rounded-md bg-white/10 border border-white/20 text-gray-300 font-mono text-lg uppercase font-bold">
                {t("quiz.questionCounter", currentRoundNum, totalRounds)}
              </span>
              {currentQuestion.category && (
                <span className="px-4 py-1.5 rounded-md bg-alaz-orange/20 border border-alaz-orange text-alaz-orange font-mono text-lg uppercase font-bold">
                  {currentQuestion.category}
                </span>
              )}
            </div>

            {/* Live Answered Tracker */}
            <div className="flex items-center gap-3 bg-black/60 border border-cyan-500/40 px-6 py-2 rounded-full shadow-[0_0_20px_rgba(6,182,212,0.3)]">
              <span className="w-3 h-3 rounded-full bg-cyan-400 animate-ping" />
              <span className="font-mono font-bold text-cyan-400 text-lg">
                {t("quiz.liveAnswered", answeredCount, players.length)}
              </span>
            </div>
          </div>

          {/* Soru kartı: kenarında süzülen ışık, süre azaldıkça kırmızıya döner. */}
          <BeamBorder
            rgb={timeLeft <= 5 ? "239,68,68" : "56,189,248"}
            duration={timeLeft <= 5 ? 2 : 6}
            radius="1.75rem"
            className="w-full mb-8 shadow-[0_0_60px_rgba(59,130,246,0.25)]"
            innerClassName="bg-[#05070d]/95"
          >
            <div className="p-10 text-center">
              <h1 className="text-3xl md:text-5xl font-black text-white leading-snug text-balance">{currentQuestion.text}</h1>
            </div>
          </BeamBorder>

          {/* Boşalan süre halkası (HostPlaying ile aynı dil). */}
          <div className="flex items-center justify-center mb-8">
            <TimerRing
              timeLeft={timeLeft}
              maxTime={maxTime}
              tone={timeLeft <= 5 ? "critical" : timeLeft <= 10 ? "warning" : "calm"}
              size={150}
            >
              <span className={`text-6xl font-black tabular-nums tracking-tighter ${timeLeft <= 5 ? "text-red-500" : "text-white"}`}>
                {timeLeft}
              </span>
            </TimerRing>
          </div>

          {/* 4 Options Grid */}
          <div className="grid grid-cols-2 gap-6 w-full mb-6">
            {(["A", "B", "C", "D"] as const).map(opt => {
              const style = optionStyles[opt];
              return (
                <div 
                  key={opt} 
                  className={`bg-black/70 border-2 ${style.border} p-6 rounded-xl flex items-center gap-5 ${style.glow} backdrop-blur-sm`}
                >
                  <div className={`w-14 h-14 ${style.bg} border-2 ${style.border} rounded-lg flex items-center justify-center text-3xl font-black ${style.text}`}>
                    {opt}
                  </div>
                  <div className="text-2xl md:text-3xl font-bold text-white text-left flex-1 leading-tight">
                    {currentQuestion.options[opt]}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Manual End Early Button */}
          <div className="mt-4">
            <button
              onClick={onEndQuestion}
              className="px-8 py-2.5 bg-red-950/60 hover:bg-red-900 border border-red-500/50 hover:border-red-500 text-red-400 font-bold uppercase tracking-widest text-sm transition-all rounded-full flex items-center gap-3"
            >
              <span className="w-2 h-2 rounded-full bg-red-500" />
              {t("quiz.endTimer")}
            </button>
          </div>
        </>
      )}
    </motion.div>
  );
}
