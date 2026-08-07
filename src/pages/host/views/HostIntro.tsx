import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SoundManager, sounds } from "../../../lib/audio";
import type { Player } from "../../../types/database";

interface HostIntroProps {
  players: Player[];
  onComplete: () => void;
}

// Minimal Matrix Rain Component
function MatrixRain() {
  const [columns, setColumns] = useState<number>(0);

  useEffect(() => {
    setColumns(Math.floor(window.innerWidth / 30));
    const handleResize = () => setColumns(Math.floor(window.innerWidth / 30));
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden flex justify-between opacity-30 pointer-events-none z-0 mix-blend-screen">
      {Array.from({ length: columns }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: "-100%" }}
          animate={{ y: "100vh" }}
          transition={{
            duration: Math.random() * 2 + 2,
            repeat: Infinity,
            ease: "linear",
            delay: Math.random() * 2,
          }}
          className="text-[#00ff00] text-xl font-mono whitespace-nowrap [writing-mode:vertical-rl]"
        >
          {Array.from({ length: 20 })
            .map(() => String.fromCharCode(0x30a0 + Math.random() * 96))
            .join("")}
        </motion.div>
      ))}
    </div>
  );
}

export function HostIntro({ players, onComplete }: HostIntroProps) {
  const [phase, setPhase] = useState<"boot" | "matrix" | "players" | "countdown">("boot");
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    // 1. Boot Phase
    SoundManager.getInstance().playSFX(sounds.FAILURE); // Glitch/Error sound
    const t1 = setTimeout(() => {
      setPhase("matrix");
    }, 2000);
    return () => clearTimeout(t1);
  }, []);

  useEffect(() => {
    // 2. Matrix Phase
    if (phase === "matrix") {
      SoundManager.getInstance().playSFX(sounds.BURN); // Intense transition
      const t2 = setTimeout(() => {
        setPhase("players");
      }, 1500);
      return () => clearTimeout(t2);
    }
  }, [phase]);

  useEffect(() => {
    // 3. Players Phase
    if (phase === "players") {
      if (currentPlayerIdx < players.length) {
        SoundManager.getInstance().playSFX(sounds.CLICK);
        const t3 = setTimeout(() => {
          setCurrentPlayerIdx(prev => prev + 1);
        }, 400); // Glitch each player for 400ms
        return () => clearTimeout(t3);
      } else {
        setPhase("countdown");
      }
    }
  }, [phase, currentPlayerIdx, players.length]);

  useEffect(() => {
    // 4. Countdown Phase
    if (phase === "countdown") {
      if (countdown > 0) {
        SoundManager.getInstance().playSFX(sounds.VOTE_TICK);
        const t4 = setTimeout(() => {
          setCountdown(c => c - 1);
        }, 1000);
        return () => clearTimeout(t4);
      } else {
        SoundManager.getInstance().playSFX(sounds.SUCCESS); // Access Granted
        const t5 = setTimeout(() => {
          onComplete();
        }, 1500);
        return () => clearTimeout(t5);
      }
    }
  }, [phase, countdown, onComplete]);

  return (
    <div className="w-full h-full flex items-center justify-center bg-black fixed inset-0 z-[100] overflow-hidden noise-suppression font-mono">
      
      {/* Glitch Overlay for all phases after boot */}
      {(phase !== "boot") && (
        <>
          <MatrixRain />
          <div className="absolute inset-0 bg-[#00ff00]/5 pointer-events-none mix-blend-overlay z-10 animate-pulse" />
        </>
      )}

      <AnimatePresence mode="wait">
        {phase === "boot" && (
          <motion.div
            key="boot"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.5, filter: "blur(10px)" }}
            className="flex flex-col items-center gap-4 text-[#00ff00]"
          >
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black uppercase tracking-widest flex items-center gap-2">
              <span className="text-red-500 animate-ping">!</span> 
              SİSTEM ÇÖKÜŞÜ 
              <span className="text-red-500 animate-ping">!</span>
            </h2>
            <div className="text-xl opacity-80 uppercase tracking-widest animate-pulse">
              GÜVENLİK PROTOKOLÜ İHLAL EDİLDİ...
            </div>
          </motion.div>
        )}

        {phase === "matrix" && (
          <motion.div
            key="matrix"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.2 }}
            className="text-center z-20"
          >
            <h1 className="text-4xl md:text-6xl lg:text-8xl font-black text-[#00ff00] uppercase tracking-tighter drop-shadow-[0_0_30px_rgba(0,255,0,0.8)]">
              SİSTEM HACKLENDİ.
            </h1>
          </motion.div>
        )}

        {phase === "players" && currentPlayerIdx < players.length && (
          <motion.div
            key={`player-${currentPlayerIdx}`}
            initial={{ opacity: 0, x: -100, skewX: -20 }}
            animate={{ opacity: 1, x: 0, skewX: 0, textShadow: "4px 4px 0px rgba(0,255,0,0.5), -4px -4px 0px rgba(255,0,255,0.5)" }}
            exit={{ opacity: 0, x: 100, skewX: 20 }}
            transition={{ duration: 0.2 }}
            className="text-center z-20"
          >
            <div className="text-xl text-[#00ff00] mb-4 opacity-50 uppercase tracking-widest">
              ZİHİN AĞA BAĞLANIYOR...
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-[130px] font-black text-white uppercase tracking-tighter leading-none truncate max-w-[90vw]">
              {players[currentPlayerIdx].nickname}
            </h1>
          </motion.div>
        )}

        {phase === "countdown" && countdown > 0 && (
          <motion.div
            key={`cd-${countdown}`}
            initial={{ opacity: 0, scale: 2 }}
            animate={{ opacity: 1, scale: 1, textShadow: "0 0 50px rgba(0,255,0,1)" }}
            exit={{ opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.3 }}
            className="text-[250px] font-black text-[#00ff00] leading-none z-20"
          >
            {countdown}
          </motion.div>
        )}

        {phase === "countdown" && countdown === 0 && (
          <motion.div
            key="start"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0, textShadow: "0 0 100px rgba(0,255,0,1)" }}
            className="flex flex-col items-center justify-center z-20"
          >
            <div className="text-[120px] font-black text-white uppercase tracking-tighter leading-none mb-4">
              ERİŞİM ONAYLANDI
            </div>
            <div className="text-3xl text-[#00ff00] uppercase tracking-[1em] animate-pulse">
              ATEŞ SERBEST
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
