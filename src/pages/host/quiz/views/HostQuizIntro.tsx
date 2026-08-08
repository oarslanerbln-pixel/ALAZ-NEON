import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SoundManager, sounds } from "../../../../lib/audio";

interface HostQuizIntroProps {
  onComplete: () => void;
}

export function HostQuizIntro({ onComplete }: HostQuizIntroProps) {
  const [phase, setPhase] = useState<"countdown" | "wow">("countdown");
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (phase === "countdown") {
      if (countdown > 0) {
        SoundManager.getInstance().playSFX(sounds.VOTE_TICK);
        const t = setTimeout(() => {
          setCountdown((c) => c - 1);
        }, 1000);
        return () => clearTimeout(t);
      } else {
        setPhase("wow");
      }
    }
  }, [phase, countdown]);

  useEffect(() => {
    if (phase === "wow") {
      SoundManager.getInstance().playSFX(sounds.CINEMATIC_BOOM, 1.0); // Massive explosion sound
      SoundManager.getInstance().playSFX(sounds.SIREN, 0.5); // Add siren for urgency
      
      const t = setTimeout(() => {
        onComplete();
      }, 4000); // 4 seconds of WOW factor
      return () => clearTimeout(t);
    }
  }, [phase, onComplete]);

  return (
    <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden">
      {/* Background Particles/Noise */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,100,255,0.1)_0%,transparent_100%)] pointer-events-none" />
      
      <AnimatePresence mode="wait">
        {phase === "countdown" && countdown > 0 && (
          <motion.div
            key={`cd-${countdown}`}
            initial={{ opacity: 0, scale: 3, rotate: -15 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.5, filter: "blur(10px)" }}
            transition={{ duration: 0.5, type: "spring", bounce: 0.5 }}
            className="text-[250px] md:text-[350px] font-black text-transparent bg-clip-text bg-gradient-to-b from-blue-400 to-blue-800 drop-shadow-[0_0_50px_rgba(59,130,246,0.8)]"
            style={{ WebkitTextStroke: "4px white" }}
          >
            {countdown}
          </motion.div>
        )}

        {phase === "wow" && (
          <motion.div
            key="wow"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5, filter: "blur(20px)" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative flex flex-col items-center justify-center"
          >
            {/* Massive flash */}
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 bg-white fixed z-50 pointer-events-none mix-blend-overlay"
            />
            
            {/* Rotating rings */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute w-[800px] h-[800px] border-[2px] border-blue-500/30 rounded-full border-dashed"
            />
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              className="absolute w-[600px] h-[600px] border-[4px] border-alaz-orange/40 rounded-full border-dotted"
            />

            {/* Glowing Text */}
            <motion.h1 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, type: "spring", bounce: 0.6 }}
              className="text-7xl md:text-[120px] font-black text-white tracking-tighter uppercase mb-4 text-center leading-none"
              style={{ textShadow: "0 0 80px rgba(59,130,246,1), 0 0 20px rgba(255,255,255,0.8)" }}
            >
              ALAZ QUIZ
            </motion.h1>

            <motion.h2
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, type: "spring", bounce: 0.6 }}
              className="text-4xl md:text-5xl font-black text-alaz-orange tracking-[0.5em] uppercase text-center"
              style={{ textShadow: "0 0 40px rgba(255,77,0,0.8)" }}
            >
              ZİHİNLER ÇARPIŞIYOR
            </motion.h2>
            
            {/* Shockwave effect */}
            <motion.div
              initial={{ scale: 0, opacity: 1 }}
              animate={{ scale: 4, opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute w-32 h-32 bg-blue-500 rounded-full pointer-events-none mix-blend-screen"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
