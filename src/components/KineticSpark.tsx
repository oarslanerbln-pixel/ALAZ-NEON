import { useEffect } from "react";
import { motion } from "framer-motion";
import { playCinematicWhoosh } from "../lib/soundSynth";
import { SoundManager, sounds } from "../lib/audio";

interface KineticSparkProps {
  className?: string;
  delay?: number;
  showTagline?: boolean;
  tagline?: string;
  playAudio?: boolean;
}

export function KineticSpark({
  className = "",
  delay = 0,
  showTagline = false,
  tagline = "ALAZ NEON",
  playAudio = false,
}: KineticSparkProps) {
  useEffect(() => {
    if (!playAudio) return;

    // Premium Start Jazz Sound (Subtle buildup)
    const audioTimer = setTimeout(() => {
      SoundManager.getInstance().playSFX(sounds.START_JAZZ, 0.4);
    }, delay * 1000);

    // Impact 1: ALAZ Flash (The Big Bang)
    const timer = setTimeout(
      () => {
        playCinematicWhoosh();
      },
      (delay + 0.6) * 1000,
    );

    // Impact 2: NEON Flash (The Energy Pulse)
    const secondTimer = setTimeout(
      () => {
        playCinematicWhoosh();
      },
      (delay + 1.2) * 1000,
    );

    return () => {
      clearTimeout(audioTimer);
      clearTimeout(timer);
      clearTimeout(secondTimer);
    };
  }, [delay, playAudio]);

  return (
    <div
      className={`relative w-full h-full noise-suppression overflow-visible flex items-center justify-center ${className}`}
    >

      {/* Screen Shake Container */}
      <motion.div
        animate={{
          x: [0, -10, 10, -5, 5, -2, 2, 0],
          y: [0, 5, -5, 2, -2, 1, -1, 0],
          scale: [1, 1.02, 1],
        }}
        transition={{
          delay: delay + 0.6,
          duration: 0.8,
          ease: "easeOut",
        }}
        className="relative w-full h-full flex items-center justify-center overflow-visible"
      >
        <svg
          viewBox="0 0 1000 600"
          className="w-[90vw] max-w-[1200px] h-auto overflow-visible"
        >
          <defs>
            <radialGradient id="coreFlare" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="15%" stopColor="#FFD700" stopOpacity="0.9" />
              <stop offset="40%" stopColor="#ff4d00" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#ff4d00" stopOpacity="0" />
            </radialGradient>

            <radialGradient id="neonFlare" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="1" />
              <stop offset="20%" stopColor="#FFD700" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#FFD700" stopOpacity="0" />
            </radialGradient>

            <filter id="hyperGlow" x="-50%" y="-50%" width="200%" height="200%" colorInterpolationFilters="sRGB">
              <feGaussianBlur stdDeviation="30" result="blur" />
              <feComponentTransfer in="blur" result="glow">
                <feFuncA type="linear" slope="2.5" />
              </feComponentTransfer>
              <feMerge>
                <feMergeNode in="glow" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="whiteNeonGlow" x="-50%" y="-50%" width="200%" height="200%" colorInterpolationFilters="sRGB">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            
            <filter id="goldGlow" x="-50%" y="-50%" width="200%" height="200%" colorInterpolationFilters="sRGB">
              <feGaussianBlur stdDeviation="12" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Lava Cracks Effect — animated fractal noise creating molten fissure veins */}
            <filter id="lavaCracks" x="-20%" y="-20%" width="140%" height="140%" colorInterpolationFilters="sRGB">
              {/* Fractal noise base — creates organic crack-like veins */}
              <feTurbulence
                type="fractalNoise"
                baseFrequency="0.04 0.06"
                numOctaves="5"
                seed="8"
                result="noise"
              >
                {/* Animate the seed shift to make cracks pulse and shift */}
                <animate attributeName="baseFrequency" values="0.04 0.06;0.05 0.07;0.035 0.055;0.04 0.06" dur="4s" repeatCount="indefinite" />
              </feTurbulence>

              {/* Sharpen the noise into distinct crack lines */}
              <feComponentTransfer in="noise" result="sharpCracks">
                <feFuncR type="discrete" tableValues="0 0 0 0.2 0.6 1 1" />
                <feFuncG type="discrete" tableValues="0 0 0 0.1 0.3 0.5 0.6" />
                <feFuncB type="discrete" tableValues="0 0 0 0 0 0.1 0.15" />
                <feFuncA type="linear" slope="1.8" intercept="-0.3" />
              </feComponentTransfer>

              {/* Add a pulsing glow via blur */}
              <feGaussianBlur in="sharpCracks" stdDeviation="1.5" result="glowCracks">
                <animate attributeName="stdDeviation" values="1;2.5;1" dur="2s" repeatCount="indefinite" />
              </feGaussianBlur>

              {/* Combine: sharp cracks + soft glow aura */}
              <feMerge result="lavaMerged">
                <feMergeNode in="glowCracks" />
                <feMergeNode in="sharpCracks" />
              </feMerge>

              {/* Composite onto the source text shape only */}
              <feComposite in="lavaMerged" in2="SourceGraphic" operator="in" />
            </filter>
          </defs>

          {/* Rotating Rings (Multiple for Depth) */}
          <motion.circle
            cx={500}
            cy={300}
            r={280}
            stroke="rgba(255,215,0,0.8)"
            strokeWidth="2"
            fill="none"
            strokeDasharray="50 150 200 100"
            strokeLinecap="round"
            initial={{ opacity: 0, rotate: -45, scale: 0.5 }}
            animate={{
              opacity: [0, 1, 1, 0],
              rotate: 315,
              scale: [0.5, 1.2, 1.3],
            }}
            transition={{ delay: delay + 0.2, duration: 4, ease: "easeInOut" }}
            style={{ filter: "url(#goldGlow)", transformOrigin: "center" }}
          />
          <motion.circle
            cx={500}
            cy={300}
            r={300}
            stroke="rgba(255,77,0,0.6)"
            strokeWidth="1.5"
            fill="none"
            strokeDasharray="100 300"
            strokeLinecap="round"
            initial={{ opacity: 0, rotate: 180, scale: 0.8 }}
            animate={{
              opacity: [0, 0.9, 0],
              rotate: -180,
              scale: [0.8, 1.3],
            }}
            transition={{ delay: delay + 0.5, duration: 4.5, ease: "easeInOut" }}
            style={{ filter: "url(#whiteNeonGlow)", transformOrigin: "center" }}
          />

          {/* Cinematic Explosion Waves */}
          <motion.circle
            cx={500}
            cy={300}
            stroke="url(#coreFlare)"
            strokeWidth="12"
            fill="none"
            initial={{ r: 1, opacity: 0 }}
            animate={{ r: [1, 900], opacity: [0, 1, 0], strokeWidth: [30, 4] }}
            transition={{ delay: delay + 0.6, duration: 1.8, ease: "easeOut" }}
          />
          <motion.circle
            cx={500}
            cy={300}
            stroke="url(#neonFlare)"
            strokeWidth="8"
            fill="none"
            initial={{ r: 1, opacity: 0 }}
            animate={{ r: [1, 800], opacity: [0, 0.9, 0], strokeWidth: [20, 2] }}
            transition={{ delay: delay + 1.0, duration: 1.8, ease: "easeOut" }}
          />

          {/* Central Supernova Core */}
          <motion.circle
            cx={500}
            cy={300}
            fill="url(#coreFlare)"
            initial={{ r: 1, opacity: 0 }}
            animate={{
              r: [1, 700],
              opacity: [0, 1, 0],
            }}
            transition={{ delay: delay + 0.5, duration: 1.5, ease: "circOut" }}
          />
          <motion.ellipse
            cx={500}
            cy={300}
            fill="#ffffff"
            initial={{ rx: 1, ry: 1, opacity: 0 }}
            animate={{ rx: [1, 1000], ry: [1, 15], opacity: [0, 1, 0] }}
            transition={{ delay: delay + 0.6, duration: 1, ease: "easeOut" }}
            style={{ filter: "blur(6px)", transformOrigin: "center" }}
          />

          {/* MAIN TEXT - BASE (Animated Colors) */}
          <motion.text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-8xl md:text-[14rem] lg:text-[18rem] font-sans font-black tracking-tighter italic uppercase"
            initial={{ scale: 5, opacity: 0, y: -50, letterSpacing: "-0.1em" }}
            animate={{
              scale: [5, 0.8, 1.1, 0.95, 1.02, 1],
              opacity: [0, 1, 1, 1, 1, 1],
              y: [-50, 0, 0, 0, 0, 0],
              letterSpacing: ["-0.1em", "0.02em", "0.02em", "0.02em", "0.02em", "0.02em"],
              fill: ["#ffffff", "#FFD700", "#ff4d00", "#ff0000", "#ff4d00", "#FFD700"],
            }}
            transition={{
              scale: { delay: delay + 0.6, duration: 0.6, ease: "circOut" },
              opacity: { delay: delay + 0.6, duration: 0.6, ease: "circOut" },
              y: { delay: delay + 0.6, duration: 0.6, ease: "circOut" },
              letterSpacing: { delay: delay + 0.6, duration: 0.6, ease: "circOut" },
              fill: { delay: delay + 0.6, duration: 3, repeat: Infinity, ease: "linear" },
            }}
            style={{
              filter: "drop-shadow(0 0 20px rgba(255,215,0,0.8)) drop-shadow(0 0 40px rgba(255,77,0,0.6))",
            }}
          >
            ALAZ
          </motion.text>

          {/* MAIN TEXT - LAVA CRACKS OVERLAY */}
          <motion.text
            x="50%"
            y="50%"
            textAnchor="middle"
            dominantBaseline="middle"
            className="text-8xl md:text-[14rem] lg:text-[18rem] font-sans font-black tracking-tighter italic uppercase pointer-events-none"
            initial={{ scale: 5, opacity: 0, y: -50, letterSpacing: "-0.1em" }}
            animate={{
              scale: [5, 0.8, 1.1, 0.95, 1.02, 1],
              opacity: [0, 0.85, 0.85, 0.85, 0.85, 0.85],
              y: [-50, 0, 0, 0, 0, 0],
              letterSpacing: ["-0.1em", "0.02em", "0.02em", "0.02em", "0.02em", "0.02em"],
            }}
            transition={{
              scale: { delay: delay + 0.6, duration: 0.6, ease: "circOut" },
              opacity: { delay: delay + 0.6, duration: 0.6, ease: "circOut" },
              y: { delay: delay + 0.6, duration: 0.6, ease: "circOut" },
              letterSpacing: { delay: delay + 0.6, duration: 0.6, ease: "circOut" },
            }}
            fill="#ff4d00"
            style={{ filter: "url(#lavaCracks)", mixBlendMode: "screen" }}
          >
            ALAZ
          </motion.text>
        </svg>
      </motion.div>

      {showTagline && (
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: delay + 2.5, duration: 1.2, ease: "easeOut" }}
          className="absolute bottom-16 flex flex-col items-center gap-3 z-20"
        >
          <motion.div
            animate={{ width: ["0%", "100%", "0%"], opacity: [0, 1, 0] }}
            transition={{
              delay: delay + 2.5,
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="h-[1px] w-[180px] bg-gradient-to-r from-transparent via-[#FFD700]/80 to-transparent mb-3"
          />
          <p
            className="text-[#FFD700]/80 text-sm md:text-base tracking-[1.5em] uppercase font-premium text-center px-4 [text-shadow:0_0_20px_rgba(255,215,0,0.5)]"
          >
            {tagline}
          </p>
        </motion.div>
      )}
    </div>
  );
}
