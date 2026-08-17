import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ExperienceBar } from "../../../components/ExperienceBar";
import { SoundManager, sounds } from "../../../lib/audio";

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
  const timeProgress = (timeLeft / (maxTime || 60)) * 100;
  const isPlaying = gameState === "playing";
  const isCritical = isPlaying && timeLeft <= 10 && timeLeft > 0;
  const lastTimeRef = useRef(timeLeft);

  useEffect(() => {
    if (isPlaying && timeLeft <= 10 && timeLeft > 0 && lastTimeRef.current !== timeLeft) {
      SoundManager.getInstance().playSFX(sounds.CLICK, 0.8);
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        try { navigator.vibrate(100); } catch { /* titreşim desteklenmiyor */ }
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
          className={`shrink-0 w-11 h-11 rounded-sm border-2 flex items-center justify-center text-xl font-black text-white shadow-lg transition-all duration-300 ${
            isCritical
              ? "border-red-500 shadow-[0_0_15px_rgba(255,0,0,0.4)] animate-pulse"
              : "border-alaz-orange shadow-[0_0_12px_rgba(255,77,0,0.25)]"
          }`}
        >
          {activeLetter}
        </div>

        {/* Player info — center */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="bg-white/10 font-black text-[11px] px-1.5 py-0.5 text-gray-400 uppercase tracking-tight shrink-0">
              T{currentRound}
            </span>
            <span className="text-sm font-black text-white font-premium tracking-tight truncate">
              {playerName}
            </span>
            {isPlaying && (
              <span className={`shrink-0 text-[10px] font-black uppercase tracking-widest px-1.5 py-0.5 ${isCritical ? "text-red-400 bg-red-500/10" : "text-alaz-orange bg-alaz-orange/10"}`}>
                {isCritical ? "⚡ KRİTİK" : "◉ AKTİF"}
              </span>
            )}
          </div>

          {/* Timer bar — slim */}
          <ExperienceBar
            progress={timeProgress}
            label=""
            color={isCritical ? "var(--color-alaz-red)" : "var(--color-alaz-orange)"}
          />
        </div>

        {/* Score — right */}
        <div className="shrink-0 flex flex-col items-end">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest leading-none mb-0.5">
            PUAN
          </span>
          <div className="flex items-baseline gap-1">
            <motion.span
              key={totalScore}
              initial={{ scale: 1.3, color: "#ff4d00" }}
              animate={{ scale: 1, color: "#ffffff" }}
              transition={{ duration: 0.3 }}
              className="text-2xl font-black font-premium leading-none"
            >
              {totalScore}
            </motion.span>
            <AnimatePresence>
              {roundPoints !== null && (
                <motion.span
                  key={roundPoints}
                  initial={{ opacity: 0, y: 8, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.4 }}
                  className="text-xs font-black text-green-400 leading-none"
                >
                  +{roundPoints}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Submitting indicator */}
      <AnimatePresence>
        {isSubmitting && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-2 flex items-center justify-center gap-2 text-alaz-orange">
              <div className="w-1 h-1 rounded-full bg-current animate-ping" />
              <span className="text-xs font-black uppercase tracking-[0.2em]">
                Cevaplar Gönderiliyor...
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
