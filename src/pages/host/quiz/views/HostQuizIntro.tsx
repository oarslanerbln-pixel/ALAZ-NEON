import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SoundManager, sounds } from "../../../../lib/audio";

interface HostQuizIntroProps {
  onComplete: () => void;
}

// Minimal Matrix Rain Component
function MatrixRain() {
  const [particles, setParticles] = useState<{ id: number; duration: number; delay: number; chars: string }[]>([]);

  useEffect(() => {
    const handleResize = () => {
      const cols = Math.floor(window.innerWidth / 30);
      setParticles(
        Array.from({ length: cols }).map((_, i) => ({
          id: i,
          duration: Math.random() * 2 + 2,
          delay: Math.random() * 2,
          chars: Array.from({ length: 20 })
            .map(() => String.fromCharCode(0x30a0 + Math.random() * 96))
            .join(""),
        }))
      );
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden flex justify-between opacity-30 pointer-events-none z-0 mix-blend-screen">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          initial={{ y: "-100%" }}
          animate={{ y: "100vh" }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            ease: "linear",
            delay: p.delay,
          }}
          className="text-[#00ff00] text-xl font-mono whitespace-nowrap [writing-mode:vertical-rl]"
        >
          {p.chars}
        </motion.div>
      ))}
    </div>
  );
}

// Hacker Terminal Component
function HackerTerminal() {
  const [lines, setLines] = useState<string[]>([]);
  const [ipStr] = useState(() => Math.floor(Math.random() * 255));

  useEffect(() => {
    const allLines = [
      "[root@alaz-core] ~$ init_override -f",
      "BYPASSING KERNEL FIREWALL... [SUCCESS]",
      "DECRYPTING ADMIN CREDENTIALS... 0x8F9A2B",
      "ACCESS GRANTED. ESCALATING PRIVILEGES.",
      "WARN: UNAUTHORIZED ACCESS DETECTED",
      "DISABLING ALARMS... [OK]",
      "INJECTING PAYLOAD AT MEMORY 0x00F83C",
      "DOWNLOADING TRIVIA DATA...",
      "[||||||              ] 30% [WARN: PACKET LOSS]",
      "[||||||||||||        ] 60%",
      "[||||||||||||||||||||] 100% [DATA SECURED]",
      "OVERRIDING MAIN PROTOCOL...",
      "SYSTEM COMPROMISED.",
      "CONNECTING TO ALAZ QUIZ MAINFRAME...",
      "ESTABLISHED. WAKING UP THE MATRIX.",
    ];
    let curr = 0;
    const interval = setInterval(() => {
      if (curr < allLines.length) {
        const nextLine = allLines[curr];
        setLines(prev => [...prev, nextLine]);
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
        REMOTE IP: 192.168.1.{ipStr}<br/>
        PORT: 8080<br/>
        STATUS: BREACHED
      </div>
      {lines.slice(-15).map((line, i) => {
        const safeLine = line ?? "";
        const isWarn = safeLine.includes("WARN") || safeLine.includes("FAILURE") || safeLine.includes("COMPROMISED");
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

export function HostQuizIntro({ onComplete }: HostQuizIntroProps) {
  const [phase, setPhase] = useState<"boot" | "matrix" | "countdown" | "wow">("boot");
  const [countdown, setCountdown] = useState(3);

  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    // 1. Boot Phase
    SoundManager.getInstance().playSFX(sounds.CYBER_GLITCH, 0.8);
    const t1 = setTimeout(() => {
      setPhase("matrix");
    }, 2000);
    return () => clearTimeout(t1);
  }, []);

  useEffect(() => {
    // 2. Matrix Phase
    if (phase === "matrix") {
      SoundManager.getInstance().playSFX(sounds.CYBER_GLITCH, 1.0);
      const t2 = setTimeout(() => {
        setPhase("countdown");
      }, 3500);
      return () => clearTimeout(t2);
    }
  }, [phase]);

  useEffect(() => {
    // 3. Countdown Phase
    if (phase === "countdown") {
      if (countdown > 0) {
        SoundManager.getInstance().playSFX(sounds.VOTE_TICK);
        const t4 = setTimeout(() => {
          setCountdown(c => c - 1);
        }, 1000);
        return () => clearTimeout(t4);
      } else {
        setTimeout(() => setPhase("wow"), 0);
      }
    }
  }, [phase, countdown]);

  useEffect(() => {
    // 4. WOW Cinematic Phase
    if (phase === "wow") {
      SoundManager.getInstance().playSFX(sounds.CINEMATIC_BOOM, 1.0);
      SoundManager.getInstance().playSFX(sounds.SIREN, 0.5);
      
      const t5 = setTimeout(() => {
        onCompleteRef.current();
      }, 4500);
      return () => clearTimeout(t5);
    }
  }, [phase]);

  return (
    <div className="w-full h-full flex items-center justify-center bg-black fixed inset-0 z-[100] overflow-hidden noise-suppression font-mono">
      {/* Skip Button */}
      <button
        onClick={() => onCompleteRef.current()}
        className="absolute top-6 right-6 z-50 px-4 py-2 bg-black/60 hover:bg-white/10 border border-white/20 hover:border-blue-500 text-gray-400 hover:text-white text-xs tracking-widest uppercase rounded-sm transition-all flex items-center gap-2 cursor-pointer backdrop-blur-md"
      >
        <span>GEÇ</span>
        <span>&gt;&gt;</span>
      </button>
      
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
                className="absolute w-[800px] h-[800px] border-[2px] border-blue-500/50 rounded-full border-dashed"
              />
              <motion.div
                animate={{ rotate: -360, scale: [1, 1.5, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="absolute w-[600px] h-[600px] border-[6px] border-alaz-orange/60 rounded-full border-dotted"
              />

              {/* Shockwave effect */}
              <motion.div
                initial={{ scale: 0, opacity: 1 }}
                animate={{ scale: 8, opacity: 0 }}
                transition={{ duration: 2, ease: "easeOut" }}
                className="absolute w-40 h-40 bg-blue-500 rounded-full pointer-events-none mix-blend-screen"
              />

              {/* Main Title */}
              <motion.h1 
                initial={{ y: 50, opacity: 0, scale: 0.8 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, type: "spring", bounce: 0.7 }}
                className="text-[100px] md:text-[150px] font-black text-white tracking-tighter uppercase mb-4 text-center leading-none z-10"
                style={{ textShadow: "0 0 100px rgba(59,130,246,1), 0 0 40px rgba(255,255,255,0.8)" }}
              >
                ALAZ QUIZ
              </motion.h1>

              <motion.h2
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5, type: "spring", bounce: 0.5 }}
                className="text-4xl md:text-5xl font-black text-alaz-orange tracking-[0.5em] uppercase text-center z-10"
                style={{ textShadow: "0 0 50px rgba(255,77,0,1)" }}
              >
                ZİHİNLER ÇARPIŞIYOR
              </motion.h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
