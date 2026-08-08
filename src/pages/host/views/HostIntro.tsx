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

// Hacker Terminal Component
function HackerTerminal() {
  const [lines, setLines] = useState<string[]>([]);
  const allLines = [
    "[root@alaz-core] ~$ init_override -f",
    "BYPASSING KERNEL FIREWALL... [SUCCESS]",
    "DECRYPTING ADMIN CREDENTIALS... 0x8F9A2B",
    "ACCESS GRANTED. ESCALATING PRIVILEGES.",
    "WARN: UNAUTHORIZED ACCESS DETECTED",
    "DISABLING ALARMS... [OK]",
    "INJECTING PAYLOAD AT MEMORY 0x00F83C",
    "DOWNLOADING PLAYER NEURAL DATA...",
    "[||||||              ] 30% [WARN: PACKET LOSS]",
    "[||||||||||||        ] 60%",
    "[||||||||||||||||||||] 100% [DATA SECURED]",
    "OVERRIDING MAIN PROTOCOL...",
    "SYSTEM COMPROMISED.",
    "CONNECTING TO ALAZ NEON MAINFRAME...",
    "ESTABLISHED. WAKING UP THE MATRIX.",
  ];

  useEffect(() => {
    let curr = 0;
    const interval = setInterval(() => {
      if (curr < allLines.length) {
        setLines(prev => [...prev, allLines[curr]]);
        curr++;
      } else {
        setLines(prev => [...prev, `[root@alaz-core] ~$ ${Math.random().toString(36).substring(2)}`]);
      }
    }, 120);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 p-8 flex flex-col justify-end text-left pointer-events-none z-10 opacity-90">
      <div className="absolute top-10 left-10 text-red-500 font-mono text-5xl font-black animate-pulse flex items-center gap-4 border-2 border-red-500 bg-red-500/20 p-4">
        <span>⚠️</span> CRITICAL SYSTEM FAILURE
      </div>
      <div className="absolute top-10 right-10 text-red-500 font-mono text-xl text-right animate-pulse">
        REMOTE IP: 192.168.1.{Math.floor(Math.random() * 255)}<br/>
        PORT: 8080<br/>
        STATUS: BREACHED
      </div>
      {lines.slice(-15).map((line, i) => {
        const isWarn = line.includes("WARN") || line.includes("FAILURE") || line.includes("COMPROMISED");
        return (
          <div key={i} className={`text-2xl md:text-4xl font-mono tracking-widest drop-shadow-[0_0_5px_currentColor] mb-1 ${
            isWarn ? "text-red-500 font-black animate-pulse" : "text-[#00ff00]"
          }`}>
            {line}
          </div>
        );
      })}
    </div>
  );
}

export function HostIntro({ players, onComplete }: HostIntroProps) {
  const [phase, setPhase] = useState<"boot" | "matrix" | "players" | "countdown" | "wow">("boot");
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0);
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    // 1. Boot Phase
    SoundManager.getInstance().playSFX(sounds.CYBER_GLITCH, 0.8); // Glitch/Error sound
    const t1 = setTimeout(() => {
      setPhase("matrix");
    }, 2000);
    return () => clearTimeout(t1);
  }, []);

  useEffect(() => {
    // 2. Matrix Phase
    if (phase === "matrix") {
      SoundManager.getInstance().playSFX(sounds.CYBER_GLITCH, 1.0); // Intense transition
      const t2 = setTimeout(() => {
        setPhase("players");
      }, 3500); // Wait 3.5s for the hacker terminal to play out
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
        setPhase("wow");
      }
    }
  }, [phase, countdown]);

  useEffect(() => {
    // 5. WOW Cinematic Phase
    if (phase === "wow") {
      SoundManager.getInstance().playSFX(sounds.CINEMATIC_BOOM, 1.0); // Massive explosion sound
      SoundManager.getInstance().playSFX(sounds.SIREN, 0.5); // Add siren for urgency
      
      const t5 = setTimeout(() => {
        onComplete();
      }, 4500); // 4.5 seconds of pure WOW factor
      return () => clearTimeout(t5);
    }
  }, [phase, onComplete]);

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
            className="flex flex-col items-center justify-center z-20 w-full h-full"
          >
            <HackerTerminal />
            <motion.div
              animate={{ opacity: [1, 0, 1, 0.5, 1], scale: [1, 1.05, 1] }}
              transition={{ duration: 0.2, repeat: Infinity }}
              className="text-center bg-red-600/20 border-4 border-red-500 p-10 z-20 backdrop-blur-sm"
            >
              <div className="text-red-500 font-mono text-4xl mb-4 animate-pulse uppercase">
                SECURITY BREACH
              </div>
              <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-red-500 uppercase tracking-tighter drop-shadow-[0_0_50px_rgba(255,0,0,1)]">
                SİSTEM HACKLENDİ
              </h1>
            </motion.div>
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

        {phase === "wow" && (
          <motion.div
            key="wow"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5, filter: "blur(20px)" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="relative flex flex-col items-center justify-center z-50 w-full h-full"
          >
            {/* Blinding Flash */}
            <motion.div
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="absolute inset-0 bg-white z-50 pointer-events-none"
            />
            
            {/* Cinematic Screen Shake via Container */}
            <motion.div
              animate={{ 
                x: [0, -20, 20, -10, 10, 0], 
                y: [0, 20, -20, 10, -10, 0] 
              }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="relative flex flex-col items-center justify-center"
            >
              {/* Rotating glowing rings */}
              <motion.div
                animate={{ rotate: 360, scale: [1, 1.2, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                className="absolute w-[800px] h-[800px] border-[2px] border-alaz-orange/40 rounded-full border-dashed"
              />
              <motion.div
                animate={{ rotate: -360, scale: [1, 1.5, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute w-[600px] h-[600px] border-[6px] border-red-600/50 rounded-full border-dotted"
              />

              {/* Shockwave effect */}
              <motion.div
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 8, opacity: 0 }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="absolute w-40 h-40 bg-alaz-orange rounded-full pointer-events-none mix-blend-screen"
              />

              {/* Main Title ALAZ NEON */}
              <motion.h1 
                initial={{ y: 50, opacity: 0, scale: 0.8 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, type: "spring", bounce: 0.7 }}
                className="text-[120px] md:text-[180px] font-black text-white tracking-tighter uppercase mb-4 text-center leading-none"
                style={{ textShadow: "0 0 100px rgba(255,77,0,1), 0 0 40px rgba(255,255,255,0.8)" }}
              >
                ALAZ NEON
              </motion.h1>

              <motion.h2
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, type: "spring", bounce: 0.5 }}
                className="text-4xl md:text-6xl font-black text-[#00ff00] tracking-[0.5em] uppercase text-center"
                style={{ textShadow: "0 0 50px rgba(0,255,0,0.8)" }}
              >
                ATEŞ SERBEST
              </motion.h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
