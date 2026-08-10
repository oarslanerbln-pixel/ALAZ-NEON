import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

// Minimal Matrix Rain Component
export function MatrixRain() {
  const [columns, setColumns] = useState<number>(0);

  useEffect(() => {
    setColumns(Math.floor(window.innerWidth / 30));
    const handleResize = () => setColumns(Math.floor(window.innerWidth / 30));
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Randomize each column's timing/glyphs once per column count, not on every render
  const drops = useMemo(
    () =>
      Array.from({ length: columns }).map(() => ({
        duration: Math.random() * 2 + 2,
        delay: Math.random() * 2,
        glyphs: Array.from({ length: 20 })
          .map(() => String.fromCharCode(0x30a0 + Math.random() * 96))
          .join(""),
      })),
    [columns],
  );

  return (
    <div className="absolute inset-0 overflow-hidden flex justify-between opacity-30 pointer-events-none z-0 mix-blend-screen">
      {drops.map((drop, i) => (
        <motion.div
          key={i}
          initial={{ y: "-100%" }}
          animate={{ y: "100vh" }}
          transition={{
            duration: drop.duration,
            repeat: Infinity,
            ease: "linear",
            delay: drop.delay,
          }}
          className="text-[#00ff00] text-xl font-mono whitespace-nowrap [writing-mode:vertical-rl]"
        >
          {drop.glyphs}
        </motion.div>
      ))}
    </div>
  );
}

interface HackerTerminalProps {
  downloadingLabel: string;
  mainframeLabel: string;
}

// Hacker Terminal Component
export function HackerTerminal({ downloadingLabel, mainframeLabel }: HackerTerminalProps) {
  const [lines, setLines] = useState<string[]>([]);
  const [allLines] = useState(() => [
    "[root@alaz-core] ~$ init_override -f",
    "BYPASSING KERNEL FIREWALL... [SUCCESS]",
    "DECRYPTING ADMIN CREDENTIALS... 0x8F9A2B",
    "ACCESS GRANTED. ESCALATING PRIVILEGES.",
    "WARN: UNAUTHORIZED ACCESS DETECTED",
    "DISABLING ALARMS... [OK]",
    "INJECTING PAYLOAD AT MEMORY 0x00F83C",
    downloadingLabel,
    "[||||||              ] 30% [WARN: PACKET LOSS]",
    "[||||||||||||        ] 60%",
    "[||||||||||||||||||||] 100% [DATA SECURED]",
    "OVERRIDING MAIN PROTOCOL...",
    "SYSTEM COMPROMISED.",
    mainframeLabel,
    "ESTABLISHED. WAKING UP THE MATRIX.",
  ]);

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
  }, [allLines]);

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
