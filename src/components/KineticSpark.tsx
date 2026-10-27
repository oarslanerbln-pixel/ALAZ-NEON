import { useEffect } from "react";
import { motion } from "framer-motion";
import { playCinematicWhoosh } from "../lib/soundSynth";
import { SoundManager, sounds } from "../lib/audio";
import { titleFontSize } from "../lib/titleFontSize";

interface KineticSparkProps {
  className?: string;
  delay?: number;
  showTagline?: boolean;
  tagline?: string;
  playAudio?: boolean;
  /** Büyük başlık metni. Mekan markasına göre değişebilir, varsayılan HENGAME. */
  text?: string;
}

export function KineticSpark({
  className = "",
  delay = 0,
  showTagline = false,
  tagline = "HENGAME ARENA",
  playAudio = false,
  text = "HENGAME",
}: KineticSparkProps) {
  const fontSize = titleFontSize(text);

  useEffect(() => {
    if (!playAudio) return;

    const audioTimer = setTimeout(() => {
      SoundManager.getInstance().playSFX(sounds.START_JAZZ, 0.4);
    }, Math.max(0, delay) * 1000);

    const timer = setTimeout(() => playCinematicWhoosh(), Math.max(0, delay + 0.6) * 1000);
    const secondTimer = setTimeout(() => playCinematicWhoosh(), Math.max(0, delay + 1.2) * 1000);

    return () => {
      clearTimeout(audioTimer);
      clearTimeout(timer);
      clearTimeout(secondTimer);
    };
  }, [delay, playAudio]);

  return (
    <div
      className={`relative w-full h-full overflow-visible flex flex-col items-center justify-center ${className}`}
    >
      {/* Giriş animasyonu: yazı tek seferlik yerine oturur */}
      <motion.div
        initial={delay >= 0 ? { scale: 0.92, opacity: 0, y: 12 } : false}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{
          duration: 0.25,
          delay: Math.max(0, delay),
          ease: "easeOut",
        }}
        className="relative w-full flex items-center justify-center"
      >
        <div
          className="font-black uppercase tracking-tighter select-none text-white"
          style={{ fontSize }}
        >
          {text}
        </div>
      </motion.div>

      {showTagline && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: Math.max(0, delay) + 0.3, duration: 0.25, ease: "easeOut" }}
          className="mt-6 sm:mt-8 flex flex-col items-center gap-2.5 relative z-20"
        >
          <div className="h-px w-44 sm:w-60 bg-accent/60" />
          <p className="text-xs sm:text-xs md:text-sm tabular-nums font-black tracking-[0.35em] sm:tracking-[0.45em] uppercase text-accent max-w-full pl-[0.35em] sm:pl-[0.45em]">
            {tagline}
          </p>
        </motion.div>
      )}
    </div>
  );
}
