import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SoundManager, sounds } from "../lib/audio";

interface LetterSpinnerProps {
  targetLetter: string;
  onComplete: () => void;
}

const letters = "ABCDEFGHIJKLMNOPRSTUVYZ".split("");

export function LetterSpinner({
  targetLetter,
  onComplete,
}: LetterSpinnerProps) {
  const [displayIndex, setDisplayIndex] = useState(0);
  const [isFinishing, setIsFinishing] = useState(false);
  const [explosionActive, setExplosionActive] = useState(false);
  const onCompleteRef = useRef(onComplete);

  // Generate random particles for explosion
  const explosionParticles = useMemo(() => {
    return Array.from({ length: 50 }).map(() => ({
      x: (Math.random() - 0.5) * (typeof window !== "undefined" ? window.innerWidth : 1000) * 1.5,
      y: (Math.random() - 0.5) * (typeof window !== "undefined" ? window.innerHeight : 800) * 1.5,
      rotation: (Math.random() - 0.5) * 720,
      scale: Math.random() * 3 + 0.5,
      delay: Math.random() * 0.2
    }));
  }, []);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 2500; // 2.5 seconds spin
    let animationFrameId: number;
    let timeoutId: ReturnType<typeof setTimeout>;

    const tick = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = elapsed / duration;

      if (progress < 1) {
        // Easing out
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const nextIndex =
          Math.floor(easeOut * letters.length * 5) % letters.length;
        setDisplayIndex(nextIndex);

        // Play tick sound on every letter change (throttle)
        if (Math.random() > 0.8) {
          SoundManager.getInstance().playSFX(sounds.VOTE_TICK, 0.2);
        }

        animationFrameId = requestAnimationFrame(tick);
      } else {
        setIsFinishing(true);
        timeoutId = setTimeout(() => {
          setExplosionActive(true);
          SoundManager.getInstance().playSFX(sounds.BURN); // Dramatic effect
          timeoutId = setTimeout(() => onCompleteRef.current(), 1500); // Wait for explosion to finish
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
    <div className="flex flex-col items-center justify-center">
      <div className="relative h-64 overflow-hidden mask-fade-v px-20">
        <AnimatePresence mode="popLayout">
          {!isFinishing ? (
            <motion.div
              key={displayIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-8xl md:text-[9rem] lg:text-[12rem] font-black font-inter text-hacker-green h-full flex items-center animate-flicker"
              style={{ textShadow: '0 0 20px #00ff41' }}
            >
              {letters[displayIndex]}
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: 1,
                filter: ["blur(10px)", "blur(0px)"],
              }}
              className="text-9xl md:text-[12rem] lg:text-[16rem] font-black font-inter text-cyber-yellow h-full flex items-center"
              data-text={targetLetter}
              style={{ textShadow: '0 0 30px #fcee0a' }}
            >
              {targetLetter}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mt-8 text-hacker-green font-mono tracking-[0.5em] uppercase text-xl animate-pulse relative z-10"
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
                duration: 1.2 + Math.random() * 0.5, 
                ease: "easeOut",
                delay: particle.delay
              }}
              className="absolute text-cyber-yellow font-black text-6xl md:text-8xl drop-shadow-[0_0_20px_rgba(252,238,10,0.8)] opacity-80"
            >
              {targetLetter}
            </motion.div>
          ))}
          
          {/* Giant center blast wave */}
          <motion.div
            initial={{ scale: 1, opacity: 1 }}
            animate={{ scale: 30, opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="absolute text-cyber-yellow font-black text-9xl drop-shadow-[0_0_80px_rgba(252,238,10,1)]"
          >
            {targetLetter}
          </motion.div>
          
          {/* Screen flash */}
          <motion.div
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute inset-0 bg-cyber-yellow mix-blend-overlay"
          />
        </div>
      )}

      <style>{`
                .mask-fade-v {
                    mask-image: linear-gradient(to bottom, transparent, black 20%, black 80%, transparent);
                }
            `}</style>
    </div>
  );
}
