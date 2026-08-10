import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Badge } from "../../../components/Badge";
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
  const lastTimeRef = useRef(timeLeft);

  useEffect(() => {
    if (isPlaying && timeLeft <= 10 && timeLeft > 0 && lastTimeRef.current !== timeLeft) {
      SoundManager.getInstance().playSFX(sounds.CLICK, 0.8);
      if (typeof navigator !== "undefined" && "vibrate" in navigator) {
        try {
          navigator.vibrate(100);
        } catch {
          // Vibration not supported/permitted on this device — ignore
        }
      }
    }
    lastTimeRef.current = timeLeft;
  }, [timeLeft, isPlaying]);

  return (
    <div className="glass-2 p-6 border-b border-white/10 shadow-2xl relative overflow-hidden z-20">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-alaz-orange/10 blur-[50px] -mr-16 -mt-16" />

      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-sm glass-panel-alaz border-2 border-alaz-orange flex items-center justify-center text-3xl font-black text-white shadow-[0_0_20px_rgba(255,77,0,0.3)]">
            {activeLetter}
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-white/10 font-black text-[9px] px-2 py-0.5 rounded text-gray-400 uppercase tracking-tighter">
                TUR {currentRound}
              </span>
              <span className="text-xl font-black text-white font-premium tracking-tight">
                {playerName}
              </span>
            </div>
            <div className="flex gap-2">
              <Badge
                type={isPlaying ? "speed" : "clean"}
                label={isPlaying ? "ATEŞTE!" : "BEKLEMEDE"}
                size="sm"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end">
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
            TOPLAM
          </span>
          <div className="flex items-center gap-2">
            <motion.span
              key={totalScore}
              initial={{ scale: 1.2, color: "#ff4d00" }}
              animate={{ scale: 1, color: "#ffffff" }}
              className="text-3xl font-black font-premium"
            >
              {totalScore}
            </motion.span>
            {roundPoints !== null && (
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm font-black text-green-400"
              >
                +{roundPoints}
              </motion.span>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <ExperienceBar
          progress={timeProgress}
          label="KALAN SÜRE"
          color={
            timeLeft < 10 ? "var(--color-alaz-red)" : "var(--color-alaz-orange)"
          }
        />
      </div>

      {isSubmitting && (
        <div className="mt-4 flex items-center justify-center gap-2 text-alaz-orange animate-pulse">
          <div className="w-1.5 h-1.5 rounded-full bg-current" />
          <span className="text-[9px] font-black uppercase tracking-[0.2em]">
            Cevaplar Gönderiliyor...
          </span>
        </div>
      )}
    </div>
  );
}
