import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ExperienceBar } from "../../../components/ExperienceBar";
import { SoundManager, sounds } from "../../../lib/audio";
import { useLocale } from "../../../hooks/useLocale";
import { Volume2, VolumeX, LogOut } from "lucide-react";
import { useState } from "react";
import { haptics } from "../../../lib/haptics";

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
  const navigate = useNavigate();
  const timeProgress = (timeLeft / (maxTime || 60)) * 100;
  const isPlaying = gameState === "playing";
  const isCritical = isPlaying && timeLeft <= 10 && timeLeft > 0;
  const lastTimeRef = useRef(timeLeft);
  const [isMuted, setIsMuted] = useState(() => SoundManager.getInstance().getIsMuted());

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
      className={`border-b shadow-2xl relative overflow-hidden z-20 transition-all duration-500 backdrop-blur-2xl ${
        isCritical
          ? "bg-red-950/95 border-red-500/40 shadow-[0_0_30px_rgba(255,0,0,0.3)]"
          : "bg-[#0a0a14]/90 border-white/10"
      }`}
    >
      {/* Ambient Glow */}
      <div
        className={`absolute top-0 right-0 w-36 h-36 blur-[60px] -mr-16 -mt-16 transition-colors duration-500 pointer-events-none ${
          isCritical ? "bg-red-500/30" : "bg-alaz-orange/20"
        }`}
      />

      <div className="px-4 py-3 flex items-center gap-3">
        {/* Active Letter Badge — Tesla OLED Style */}
        <div
          className={`shrink-0 w-12 h-12 rounded-2xl border-2 flex items-center justify-center text-2xl font-black text-white shadow-xl transition-all duration-300 font-mono ${
            isCritical
              ? "border-red-500 bg-red-950/80 shadow-[0_0_20px_rgba(255,0,0,0.6)] animate-pulse"
              : "border-alaz-orange bg-black/60 shadow-[0_0_15px_rgba(255,85,0,0.35)]"
          }`}
        >
          {activeLetter}
        </div>

        {/* Player info — center */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="bg-white/10 border border-white/10 font-mono font-black text-[10px] px-2 py-0.5 rounded-md text-gray-300 uppercase tracking-tight shrink-0">
              T{currentRound}
            </span>
            <span className="text-sm font-black text-white tracking-tight truncate font-sans">
              {playerName}
            </span>
            {isPlaying && (
              <span 
                className={`shrink-0 text-[9px] font-mono font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                  isCritical 
                    ? "text-red-300 bg-red-500/20 border-red-500/40 animate-pulse" 
                    : "text-alaz-orange bg-alaz-orange/10 border-alaz-orange/30"
                }`}
              >
                {isCritical ? t("playerHeader.critical") : t("playerHeader.active")}
              </span>
            )}
          </div>

          {/* Timer bar — slim luxury */}
          <ExperienceBar
            progress={timeProgress}
            label=""
            color={isCritical ? "var(--color-alaz-red)" : "var(--color-alaz-orange)"}
          />
        </div>

        {/* Score — right */}
        <div className="shrink-0 flex flex-col items-end pl-2">
          <span className="text-[9px] font-mono font-bold text-gray-400 uppercase tracking-widest leading-none mb-1">
            {t("playerHeader.points")}
          </span>
          <div className="flex items-baseline gap-1">
            <motion.span
              key={totalScore}
              initial={{ scale: 1.25, color: "#ff5500" }}
              animate={{ scale: 1, color: "#ffffff" }}
              transition={{ duration: 0.3 }}
              className="text-2xl font-black font-mono leading-none tracking-tight text-white drop-shadow-md"
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
                  className="text-xs font-black text-emerald-400 leading-none font-mono"
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
          className="shrink-0 w-8 h-8 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all active:scale-95 ml-1"
          title={isMuted ? "Sesi Aç" : "Sesi Kapat"}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>

        {/* Leave Game Button */}
        <button
          onClick={() => {
            SoundManager.getInstance().playSFX(sounds.CLICK);
            if (window.confirm(t("common.confirmLeaveGame", "Oyundan ayrılmak istediğinizden emin misiniz?"))) {
              navigate("/");
            }
          }}
          className="shrink-0 w-8 h-8 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 flex items-center justify-center text-red-400 hover:text-red-200 transition-all active:scale-95 ml-0.5"
          title={t("common.leaveGame", "AYRIL")}
        >
          <LogOut className="w-3.5 h-3.5" />
        </button>
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
            <div className="px-4 pb-2.5 flex items-center justify-center gap-2 text-alaz-orange">
              <div className="w-1.5 h-1.5 rounded-full bg-alaz-orange animate-ping" />
              <span className="text-xs font-black uppercase tracking-[0.2em] font-mono">
                {t("playerHeader.submittingAnswers")}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
