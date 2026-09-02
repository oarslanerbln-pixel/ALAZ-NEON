import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useAnimate } from "framer-motion";
import { ExperienceBar } from "../../../components/ExperienceBar";
import { AnimatedNumber } from "../../../components/AnimatedNumber";
import { SoundManager, sounds } from "../../../lib/audio";
import { useLocale } from "../../../hooks/useLocale";
import { Volume2, VolumeX } from "lucide-react";
import { haptics } from "../../../lib/haptics";
import { DURATION, EASE, SPRING } from "../../../lib/motion";

interface PlayerHeaderProps {
  playerName: string;
  totalScore: number;
  timeLeft: number;
  maxTime: number;
  isSubmitting: boolean;
  activeLetter: string;
  currentRound: number;
  gameState: string;
  roundPoints: number | null;
}

export function PlayerHeader({
  playerName,
  totalScore,
  timeLeft,
  maxTime,
  isSubmitting,
  activeLetter,
  currentRound,
  gameState,
  roundPoints,
}: PlayerHeaderProps) {
  const { t } = useLocale();
  const timeProgress = (timeLeft / (maxTime || 60)) * 100;
  const isPlaying = gameState === "playing";
  const isCritical = isPlaying && timeLeft <= 10 && timeLeft > 0;
  const lastTimeRef = useRef(timeLeft);
  const [isMuted, setIsMuted] = useState(() => SoundManager.getInstance().getIsMuted());

  // Skor değişince sayaç "sayar" (AnimatedNumber) ve kapsayıcı tek bir
  // ölçek/renk darbesi atar. Elemanı yeniden mount etmiyoruz (key yok);
  // aksi hâlde sayaç sıfırdan başlardı.
  const [scoreScope, animateScore] = useAnimate();
  const prevScoreRef = useRef(totalScore);
  useEffect(() => {
    if (prevScoreRef.current === totalScore) return;
    prevScoreRef.current = totalScore;
    if (!scoreScope.current) return;
    animateScore(
      scoreScope.current,
      { scale: [1.35, 1], color: ["#ff4d00", "#ffffff"] },
      { duration: DURATION.slow, ease: EASE.out },
    );
  }, [totalScore, animateScore, scoreScope]);

  const handleToggleMute = () => {
    setIsMuted(SoundManager.getInstance().toggleMute());
  };

  useEffect(() => {
    if (isPlaying && timeLeft <= 10 && timeLeft > 0 && lastTimeRef.current !== timeLeft) {
      if (timeLeft <= 5) {
        // Acil son 5 saniye kalp atışı & tik-tak
        SoundManager.getInstance().playSFX("synth:tick_urgent", 1.0);
        haptics.impact();
      } else {
        // Normal geri sayım
        SoundManager.getInstance().playSFX(sounds.CLICK, 0.8);
        haptics.warning();
      }
    }
    lastTimeRef.current = timeLeft;
  }, [timeLeft, isPlaying]);

  return (
    <div
      className={`border-b shadow-2xl relative overflow-hidden z-20 transition-colors duration-500 ${
        isCritical
          ? "bg-red-950/90 border-red-500/30"
          : "glass-2 border-white/10"
      }`}
    >
      {/* Ambient glow */}
      <div
        className={`absolute top-0 right-0 w-32 h-32 blur-[50px] -mr-16 -mt-16 transition-colors duration-500 ${
          isCritical ? "bg-red-500/20" : "bg-alaz-orange/10"
        }`}
      />

      <div className="px-4 py-3 flex items-center gap-3">
        {/* Active Letter Badge — compact */}
        <div
          className={`shrink-0 w-11 h-11 rounded-sm border-2 flex items-center justify-center text-xl font-black text-white shadow-lg transition-[border-color,box-shadow] duration-300 ${
            isCritical
              ? "border-red-500 shadow-[0_0_15px_rgba(255,0,0,0.4)] animate-heartbeat"
              : "border-alaz-orange shadow-[0_0_12px_rgba(255,77,0,0.25)]"
          }`}
        >
          {activeLetter}
        </div>

        {/* Player info — center */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="bg-white/10 font-black text-[11px] px-1.5 py-0.5 text-gray-400 uppercase tracking-tight shrink-0 tabular-nums">
              T{currentRound}
            </span>
            <span className="text-sm font-black text-white font-premium tracking-tight truncate">
              {playerName}
            </span>
            {isPlaying && (
              <span className={`shrink-0 text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 ${isCritical ? "text-red-400 bg-red-500/10" : "text-alaz-orange bg-alaz-orange/10"}`}>
                {isCritical ? t("playerHeader.critical") : t("playerHeader.active")}
              </span>
            )}
          </div>

          {/* Timer bar — slim; geri sayımda doğrusal akış (kesintisiz) */}
          <ExperienceBar
            progress={timeProgress}
            label=""
            mode={isPlaying ? "linear" : "spring"}
            color={isCritical ? "var(--color-alaz-red)" : "var(--color-alaz-orange)"}
          />
        </div>

        {/* Score — right */}
        <div className="shrink-0 flex flex-col items-end">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-0.5">
            {t("playerHeader.points")}
          </span>
          <div className="flex items-baseline gap-1">
            <motion.span
              ref={scoreScope}
              className="text-2xl font-black font-premium leading-none inline-block origin-right text-white"
            >
              <AnimatedNumber value={totalScore} duration={0.8} />
            </motion.span>
            <AnimatePresence>
              {roundPoints !== null && (
                <motion.span
                  key={roundPoints}
                  initial={{ opacity: 0, y: 8, scale: 0.6 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={SPRING.bouncy}
                  className="text-xs font-black text-green-400 leading-none tabular-nums"
                >
                  +{roundPoints}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Mute Button */}
        <button
          onClick={handleToggleMute}
          className="shrink-0 text-white/50 hover:text-white transition-colors ml-2"
          title={isMuted ? "Unmute" : "Mute"}
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
        </button>
      </div>

      {/* Submitting indicator */}
      <AnimatePresence>
        {isSubmitting && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: DURATION.fast, ease: EASE.out }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-2 flex items-center justify-center gap-2 text-alaz-orange">
              <div className="w-1 h-1 rounded-full bg-current animate-ping" />
              <span className="text-xs font-black uppercase tracking-[0.2em]">
                {t("playerHeader.submittingAnswers")}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
