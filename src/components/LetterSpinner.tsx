import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SoundManager, sounds } from "../lib/audio";

interface LetterSpinnerProps {
  targetLetter: string;
  onComplete: () => void;
}

const letters = "ABCDEFGHIJKLMNOPRSTUVYZ".split("");

const generateExplosionParticles = () => {
  return Array.from({ length: 80 }).map(() => ({
    x: (Math.random() - 0.5) * (typeof window !== "undefined" ? window.innerWidth : 1000) * 2,
    y: (Math.random() - 0.5) * (typeof window !== "undefined" ? window.innerHeight : 800) * 2,
    rotation: (Math.random() - 0.5) * 1080,
    scale: Math.random() * 4 + 0.5,
    delay: Math.random() * 0.15,
    color: Math.random() > 0.5 ? "#fcee0a" : "#ff4d00",
    duration: 1.5 + Math.random() * 0.8,
  }));
};

const getRandomLetter = () => letters[Math.floor(Math.random() * letters.length)];

export function LetterSpinner({
  targetLetter,
  onComplete,
}: LetterSpinnerProps) {
  const [displayIndex, setDisplayIndex] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);
  const [explosionActive, setExplosionActive] = useState(false);
  const onCompleteRef = useRef(onComplete);

  const [fallbackLetter] = useState(getRandomLetter);

  const effectiveLetter = useMemo(() => {
    return targetLetter && targetLetter.trim().length > 0
      ? targetLetter
      : fallbackLetter;
  }, [targetLetter, fallbackLetter]);

  // Generate random particles for explosion
  const [explosionParticles] = useState(generateExplosionParticles);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 2800; // 2.8 seconds spin for dramatic effect
    let animationFrameId: number;
    let timeoutId: ReturnType<typeof setTimeout>;

    const tick = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = elapsed / duration;

      if (progress < 1) {
        // Easing out
        const easeOut = 1 - Math.pow(1 - progress, 4);
        const nextIndex =
          Math.floor(easeOut * letters.length * 8) % letters.length;
        setDisplayIndex(nextIndex);

        // Play tick sound on every letter change (throttle)
        if (Math.random() > 0.8) {
          SoundManager.getInstance().playSFX(sounds.VOTE_TICK, 0.3);
        }

        animationFrameId = requestAnimationFrame(tick);
      } else {
        setIsFinishing(true);
        // Play success build up sound if available
        timeoutId = setTimeout(() => {
          setExplosionActive(true);
          SoundManager.getInstance().playSFX(sounds.BURN); // Dramatic effect
          timeoutId = setTimeout(() => onCompleteRef.current(), 1800); // Wait for explosion to finish
        }, 1000);
      }
    };

    animationFrameId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(animationFrameId);
      clearTimeout(timeoutId);
    };
  }, []);

  return (
    <div className="flex flex-col items-center justify-center relative w-full h-[500px]">
      {/* Astrolabe / Spinning Rings Background */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none perspective-[1000px]">
        {/* Ring 1 (Outer) */}
        <motion.div
          animate={{ rotateX: 360, rotateY: 180, rotateZ: 360 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute w-96 h-96 rounded-full border-[2px] border-hacker-green/20 border-dashed"
          style={{ transformStyle: "preserve-3d" }}
        />
        {/* Ring 2 (Middle) */}
        <motion.div
          animate={{ rotateX: -360, rotateY: 360, rotateZ: -180 }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          className="absolute w-72 h-72 rounded-full border-[4px] border-cyber-yellow/30 border-dotted"
          style={{ transformStyle: "preserve-3d" }}
        />
        {/* Ring 3 (Inner) */}
        <motion.div
          animate={{ rotateX: 180, rotateY: -360, rotateZ: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          className="absolute w-56 h-56 rounded-full border-[1px] border-alaz-orange/40"
          style={{ transformStyle: "preserve-3d" }}
        />
        {/* Center Glow */}
        <div className="absolute w-40 h-40 bg-hacker-green/10 rounded-full blur-3xl animate-pulse" />
      </div>

      <div className="relative z-10 h-64 overflow-hidden mask-fade-v px-20 flex items-center justify-center w-full">
        <AnimatePresence mode="popLayout">
          {!isFinishing ? (
            <motion.div
              key={displayIndex}
              initial={{ opacity: 0, scale: 0.8, rotateX: 90 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0 }}
              exit={{ opacity: 0, scale: 1.2, rotateX: -90 }}
              transition={{ duration: 0.15 }}
              className="text-8xl md:text-[9rem] lg:text-[12rem] font-black font-inter text-white h-full flex items-center justify-center w-full"
              style={{ textShadow: '0 0 30px rgba(0, 255, 65, 0.5)' }}
            >
              {letters[displayIndex]}
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0, opacity: 0, rotate: -180 }}
              animate={{
                scale: [1, 1.4, 1.2, 1],
                opacity: 1,
                rotate: 0,
                filter: ["blur(20px)", "blur(0px)"],
              }}
              transition={{ duration: 0.8, type: "spring", bounce: 0.5 }}
              className="text-9xl md:text-[12rem] lg:text-[16rem] font-black font-inter text-transparent bg-clip-text bg-gradient-to-br from-cyber-yellow via-white to-alaz-orange h-full flex items-center justify-center w-full"
              data-text={effectiveLetter}
              style={{ filter: 'drop-shadow(0 0 40px rgba(252,238,10,0.8))' }}
            >
              {effectiveLetter}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-16 text-alaz-orange font-mono tracking-[0.5em] uppercase text-sm md:text-xl animate-pulse relative z-10 border border-alaz-orange/30 px-6 py-2 rounded-full bg-black/50 backdrop-blur-md"
      >
        &gt; HEDEF_HARF_ÇÖZÜLÜYOR...
      </motion.div>

      {/* EXPLOSION ANIMATION */}
      {explosionActive && (
        <div className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center overflow-hidden mix-blend-screen">
          {/* Flying letters */}
          {explosionParticles.map((particle, i) => (
            <motion.div
              key={i}
              initial={{ x: 0, y: 0, scale: 0, opacity: 1, rotate: 0 }}
              animate={{ 
                x: particle.x, 
                y: particle.y, 
                scale: particle.scale, 
                opacity: [1, 1, 0],
                rotate: particle.rotation
              }}
              transition={{ 
                duration: particle.duration, 
                ease: "easeOut",
                delay: particle.delay
              }}
              className="absolute font-black text-6xl md:text-8xl opacity-90"
              style={{ color: particle.color, textShadow: `0 0 30px ${particle.color}` }}
            >
              {targetLetter}
            </motion.div>
          ))}
          
          {/* Giant center blast wave */}
          <motion.div
            initial={{ scale: 1, opacity: 1 }}
            animate={{ scale: 40, opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute text-white font-black text-9xl drop-shadow-[0_0_100px_rgba(255,255,255,1)]"
          >
            {targetLetter}
          </motion.div>
          
          {/* Shockwave ring */}
          <motion.div
             initial={{ scale: 0, opacity: 1, borderWidth: "50px" }}
             animate={{ scale: 5, opacity: 0, borderWidth: "1px" }}
             transition={{ duration: 1, ease: "easeOut" }}
             className="absolute w-96 h-96 rounded-full border-white"
          />

          {/* Screen flash */}
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="absolute inset-0 bg-white mix-blend-overlay"
          />
        </div>
      )}

      <style>{`
        .mask-fade-v {
            mask-image: linear-gradient(to bottom, transparent, black 20%, black 80%, transparent);
        }
        .perspective-[1000px] {
            perspective: 1000px;
        }
      `}</style>
    </div>
  );
}

