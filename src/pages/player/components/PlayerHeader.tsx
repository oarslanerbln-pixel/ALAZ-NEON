import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useAnimate } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { AnimatedNumber } from "../../../components/AnimatedNumber";
import { SoundManager, sounds } from "../../../lib/audio";
import { useLocale } from "../../../hooks/useLocale";
import { Volume2, VolumeX, LogOut } from "lucide-react";
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
  const navigate = useNavigate();
  const timeProgress = Math.max(0, Math.min(100, (timeLeft / (maxTime || 60)) * 100));
  const isPlaying = gameState === "playing";
  const isCritical = isPlaying && timeLeft <= 10 && timeLeft > 0;
  const lastTimeRef = useRef(timeLeft);
  const [isMuted, setIsMuted] = useState(() => SoundManager.getInstance().getIsMuted());

  const [scoreScope, animateScore] = useAnimate();
  const prevScoreRef = useRef(totalScore);
  useEffect(() => {
    if (prevScoreRef.current === totalScore) return;
    prevScoreRef.current = totalScore;
    if (!scoreScope.current) return;
    animateScore(
      scoreScope.current,
      { scale: [1.25, 1], color: ["#ff5500", "#ffffff"] },
      { duration: DURATION.slow, ease: EASE.out },
    );
  }, [totalScore, animateScore, scoreScope]);

  const handleToggleMute = () => {
    setIsMuted(SoundManager.getInstance().toggleMute());
  };

  useEffect(() => {
    if (isPlaying && timeLeft <= 10 && timeLeft > 0 && lastTimeRef.current !== timeLeft) {
      if (timeLeft <= 5) {
        SoundManager.getInstance().playSFX("synth:tick_urgent", 1.0);
        haptics.impact();
      } else {
        SoundManager.getInstance().playSFX(sounds.CLICK, 0.8);
        haptics.warning();
      }
    }
    lastTimeRef.current = timeLeft;
  }, [timeLeft, isPlaying]);

  return (
    <header className="sticky top-0 z-30 w-full bg-[#090912]/92 border-b border-white/[0.07] shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
      <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between gap-2.5">
        {/* Left: Player Profile Pill */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-alaz-orange/25 via-white/10 to-transparent border border-white/15 flex items-center justify-center text-xs font-black text-white shrink-0 shadow-inner">
            {playerName ? playerName.charAt(0).toUpperCase() : "P"}
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold text-white truncate leading-tight">
              {playerName}
            </span>
            <span className="text-xs tabular-nums font-medium text-white/45 uppercase tracking-wider">
              {t("playerHeader.round", "RUNDE")} {currentRound}
            </span>
          </div>
        </div>

        {/* Center: Sleek Active Letter (Only when playing Arena) */}
        {isPlaying && activeLetter && activeLetter !== "?" && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`flex items-center gap-2 px-3 py-1 rounded-xl bg-white/[0.05] border transition-colors ${
              isCritical
                ? "border-red-500 "
                : "border-alaz-orange/40 "
            }`}
          >
            <span className="text-xs tabular-nums text-white/40 uppercase tracking-widest">{t("playerHeader.letter", "BUCHSTABE")}</span>
            <span className={`text-lg font-black tabular-nums leading-none ${isCritical ? "text-red-400" : "text-alaz-orange"}`}>
              {activeLetter}
            </span>
          </motion.div>
        )}

        {/* Right: Score & Quick Action */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex flex-col items-end">
            <div className="flex items-baseline gap-1">
              <motion.span
                ref={scoreScope}
                className="text-lg font-black tabular-nums text-white leading-none tracking-tight"
              >
                <AnimatedNumber value={totalScore} duration={0.8} />
              </motion.span>
              <span className="text-xs tabular-nums text-white/40 uppercase">{t("playerHeader.points", "PTS")}</span>
              <AnimatePresence>
                {roundPoints !== null && (
                  <motion.span
                    key={roundPoints}
                    initial={{ opacity: 0, y: 6, scale: 0.6 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={SPRING.bouncy}
                    className="text-xs font-black text-emerald-400 tabular-nums ml-0.5"
                  >
                    +{roundPoints}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Quick Mute */}
          <button
            onClick={handleToggleMute}
            className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 flex items-center justify-center text-white/50 hover:text-white transition-all active:scale-90"
            aria-label={isMuted ? t("common.soundOn") : t("common.soundOff")}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-red-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
          </button>

          {/* Leave Button */}
          <button
            onClick={() => {
              SoundManager.getInstance().playSFX(sounds.CLICK);
              if (window.confirm(t("common.confirmLeaveGame", "Oyundan ayrılmak istediğinizden emin misiniz?"))) {
                navigate("/");
              }
            }}
            className="w-7 h-7 rounded-lg bg-white/[0.04] hover:bg-red-500/20 border border-white/10 hover:border-red-500/40 flex items-center justify-center text-white/40 hover:text-red-400 transition-all active:scale-90"
            aria-label={t("common.leaveGame")}
          >
            <LogOut className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Ultra-Sleek Razor Hairline Timer Indicator */}
      {isPlaying && (
        <div className="w-full h-[2.5px] bg-white/[0.05] relative overflow-hidden">
          <motion.div
            className={`h-full transition-all duration-300 ${
              isCritical
                ? "bg-gradient-to-r from-red-500 to-rose-400 "
                : "bg-gradient-to-r from-alaz-orange to-amber-400 "
            }`}
            style={{ width: `${timeProgress}%` }}
          />
        </div>
      )}

      {/* Submitting indicator */}
      <AnimatePresence>
        {isSubmitting && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: DURATION.fast, ease: EASE.out }}
            className="overflow-hidden bg-alaz-orange/10 border-t border-alaz-orange/20"
          >
            <div className="px-4 py-1.5 flex items-center justify-center gap-2 text-alaz-orange">
              <div className="w-1.5 h-1.5 rounded-full bg-alaz-orange" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] tabular-nums">
                {t("playerHeader.submittingAnswers")}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
