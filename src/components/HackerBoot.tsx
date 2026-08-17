import { useEffect, useState, useSyncExternalStore } from "react";
import { motion } from "framer-motion";

/**
 * Yağmur sütunlarının zamanlaması ve glyph'leri modül seviyesinde BİR KEZ
 * üretiliyor. Render sırasında Math.random() çağırmak saf değil, effect içinde
 * setState yapmak da zincirleme render doğuruyordu; havuz ikisini de çözüyor.
 */
const RAIN_POOL = Array.from({ length: 64 }).map(() => ({
  duration: Math.random() * 2 + 2,
  delay: Math.random() * 2,
  glyphs: Array.from({ length: 20 })
    .map(() => String.fromCharCode(0x30a0 + Math.random() * 96))
    .join(""),
}));

function subscribeToResize(onChange: () => void) {
  window.addEventListener("resize", onChange);
  return () => window.removeEventListener("resize", onChange);
}
const getColumnCount = () => Math.floor(window.innerWidth / 30);
const getColumnCountServer = () => 0;

// Minimal Matrix Rain Component
export function MatrixRain() {
  const columns = useSyncExternalStore(
    subscribeToResize,
    getColumnCount,
    getColumnCountServer,
  );

  return (
    <div className="absolute inset-0 overflow-hidden flex justify-between opacity-30 pointer-events-none z-0 mix-blend-screen">
      {Array.from({ length: columns }).map((_, i) => {
        const drop = RAIN_POOL[i % RAIN_POOL.length];
        return (
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
        );
      })}
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
  // Render sırasında Math.random() çağırmak saf değil — bir kez üretip sakla
  const [ipSuffix] = useState(() => Math.floor(Math.random() * 255));
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
        // Değeri updater'a KAPATMADAN önce sabitle. setLines'ın updater'ı
        // render sırasında çalıştığı için `curr` o an bir adım ilerideydi;
        // son turda allLines[15] okunup diziye undefined giriyordu.
        const nextLine = allLines[curr];
        setLines(prev => [...prev, nextLine]);
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
        REMOTE IP: 192.168.1.{ipSuffix}<br/>
        PORT: 8080<br/>
        STATUS: BREACHED
      </div>
      {lines.slice(-15).map((line, i) => {
        if (typeof line !== "string") return null;
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
