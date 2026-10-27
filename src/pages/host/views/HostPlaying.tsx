import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { TimerRing, type TimerTone } from "../../../components/TimerRing";
import { useLocale } from "../../../hooks/useLocale";
import { SoundManager, sounds } from "../../../lib/audio";
import { DURATION, EASE, STAGGER, screen } from "../../../lib/motion";

interface HostPlayingProps {
  currentLetter: string;
  timeLeft: number;
  /** Turun toplam süresi (sn) — halka bunun oranıyla boşalır */
  maxTime?: number;
  categories: string[];
  submittedPlayerIds: string[];
  playersCount: number;
}

function toneFor(timeLeft: number): TimerTone {
  if (timeLeft <= 0) return "over";
  if (timeLeft <= 5) return "critical";
  return "calm";
}

/**
 * Hengame Arena — TV tur ekranı: harf, süre halkası (ekranın tek odak
 * animasyonu), kategoriler ve kaç kişinin cevapladığı. Süs katmanı yok.
 */
export function HostPlaying({
  currentLetter,
  timeLeft,
  maxTime = 60,
  categories,
  submittedPlayerIds,
  playersCount,
}: HostPlayingProps) {
  const { t } = useLocale();
  const tone = toneFor(timeLeft);
  const isCritical = tone === "critical";
  const isOver = tone === "over";
  const answered = submittedPlayerIds.length;

  // Son 5 saniyede acil tik sesi
  useEffect(() => {
    if (timeLeft <= 5 && timeLeft > 0) {
      SoundManager.getInstance().playSFX(sounds.TICK_URGENT, 0.45);
    }
  }, [timeLeft]);

  return (
    <motion.div
      key="playing"
      variants={screen}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="w-full h-full flex flex-col items-center justify-between relative select-none"
    >
      <div className={`flex-1 flex items-center justify-center gap-24 ${isOver ? "animate-screen-shake" : ""}`}>
        <div className="surface w-[360px] h-[360px] rounded-[48px] flex items-center justify-center">
          <motion.span
            key={currentLetter}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: DURATION.base, ease: EASE.out }}
            className="text-[240px] font-extrabold leading-none text-accent"
          >
            {currentLetter}
          </motion.span>
        </div>

        <div className="flex flex-col items-center gap-4">
          <TimerRing timeLeft={timeLeft} maxTime={maxTime} tone={tone} size={280} strokeWidth={4}>
            <span className={`text-[120px] font-extrabold leading-none tabular-nums ${isCritical || isOver ? "text-bad" : "text-ink"}`}>
              {Math.max(0, timeLeft)}
            </span>
          </TimerRing>
          <span className="text-2xl text-ink-2">{t("playing.seconds")}</span>
        </div>
      </div>

      <div className="w-full flex flex-col items-center gap-8">
        <div className={`grid gap-6 w-full ${categories.length <= 3 ? "grid-cols-3" : categories.length <= 5 ? "grid-cols-5" : "grid-cols-4"}`}>
          {categories.map((cat, idx) => (
            <motion.div
              key={cat}
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: DURATION.base, ease: EASE.out, delay: idx * STAGGER.base }}
              className="surface rounded-3xl px-6 py-6 flex items-center gap-4 min-w-0"
            >
              <span className="text-3xl font-semibold text-accent tabular-nums">{idx + 1}</span>
              <span className="text-3xl font-semibold text-ink truncate">{cat}</span>
            </motion.div>
          ))}
        </div>

        <div className="flex items-center gap-6">
          <div className="w-80 h-3 rounded-full bg-surface-2 overflow-hidden">
            <motion.div
              className="h-full bg-accent origin-left"
              initial={false}
              animate={{ scaleX: playersCount ? answered / playersCount : 0 }}
              transition={{ duration: DURATION.base, ease: EASE.out }}
            />
          </div>
          <span className="text-3xl text-ink-2 tabular-nums">
            <span className="text-ink font-semibold">{answered}</span> / {playersCount} {t("playing.answered")}
          </span>
        </div>
      </div>

      {/* Süre bitti: tek seferlik, sade */}
      <AnimatePresence>
        {isOver && (
          <motion.div
            key="timeup"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DURATION.base, ease: EASE.out }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-bg/85 pointer-events-none"
          >
            <motion.h1
              initial={{ scale: 1.15, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: DURATION.slow, ease: EASE.out }}
              className="text-[160px] font-extrabold text-bad uppercase tracking-tight"
            >
              {t("playing.timeUp")}
            </motion.h1>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
