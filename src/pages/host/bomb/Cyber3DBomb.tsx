import { motion, AnimatePresence } from "framer-motion";
import { SPRING } from "../../../lib/motion";

interface Cyber3DBombProps {
  timeLeft: number;
  maxTime?: number;
  className?: string;
}

/**
 * Bomba göstergesi: düz gövde, tükenen fitil ve büyük geri sayım rakamı.
 * Süre azaldıkça yalnızca renk değişir (accent -> kırmızı); sürekli animasyon yok.
 */
export function Cyber3DBomb({
  timeLeft,
  maxTime = 15,
  className = "",
}: Cyber3DBombProps) {
  const isCritical = timeLeft <= 5;
  const isWarning = timeLeft <= 8 && !isCritical;
  const fraction = Math.min(1, Math.max(0, timeLeft / maxTime));

  // Fitilin uzunluğu (0 = bitmiş, 1 = tam)
  const fuseProgress = fraction;

  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>
      {/* Fitil */}
      <div className="relative w-40 h-28 -mb-4 z-20 pointer-events-none">
        <svg
          viewBox="0 0 160 140"
          className="absolute inset-0 w-full h-full overflow-visible"
        >
          {/* Yanmamış soğuk iz */}
          <path
            d="M 30,15 C 65,-5 105,25 90,75 C 85,95 80,105 80,120"
            fill="none"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="5"
            strokeLinecap="round"
          />

          {/* Yanan kısım */}
          <motion.path
            d="M 30,15 C 65,-5 105,25 90,75 C 85,95 80,105 80,120"
            fill="none"
            stroke={isCritical ? "var(--color-bad)" : "var(--color-accent)"}
            strokeWidth="5.5"
            strokeLinecap="round"
            style={{
              pathLength: fuseProgress,
            }}
            transition={{ duration: 0.35, ease: "linear" }}
          />
        </svg>
      </div>

      {/* Detonatör başlığı */}
      <div className="relative z-15 w-24 h-9 surface-2 rounded-t-xl rounded-b-none flex items-center justify-around px-2">
        <div className="w-1.5 h-4 bg-white/15 rounded-full" />
        <div className="w-1.5 h-4 bg-white/15 rounded-full" />
        <div
          className={`w-3 h-3 rounded-full ${
            isCritical ? "bg-bad" : "bg-accent"
          }`}
        />
        <div className="w-1.5 h-4 bg-white/15 rounded-full" />
        <div className="w-1.5 h-4 bg-white/15 rounded-full" />
      </div>

      {/* Bomba gövdesi */}
      <div className="relative w-80 h-80 md:w-92 md:h-92 flex items-center justify-center">
        <div
          className={`relative w-full h-full rounded-full border-2 transition-colors duration-300 flex items-center justify-center overflow-hidden bg-[#0b0c10] ${
            isCritical
              ? "border-bad"
              : isWarning
              ? "border-accent"
              : "border-white/20"
          }`}
        >
          {/* Süre çekirdeği */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            <span
              className={`text-xs tabular-nums tracking-[0.3em] uppercase font-bold mb-1 transition-colors ${
                isCritical ? "text-bad" : "text-white/40"
              }`}
            >
              CRITICAL FUSE
            </span>

            {/* Rakam */}
            <div className="relative h-[1.1em] overflow-hidden text-7xl md:text-9xl font-black tabular-nums tracking-tighter leading-none">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={timeLeft}
                  initial={{ y: "0.5em", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "-0.5em", opacity: 0 }}
                  transition={SPRING.snappy}
                  className={`block transition-colors duration-300 ${
                    isCritical ? "text-bad" : isWarning ? "text-accent" : "text-white"
                  }`}
                >
                  {timeLeft}
                </motion.span>
              </AnimatePresence>
            </div>

            {/* Alt ilerleme çubuğu */}
            <div className="w-24 h-1 bg-white/10 rounded-full mt-2 overflow-hidden border border-white/10">
              <div
                className={`h-full transition-all duration-300 ${
                  isCritical ? "bg-bad" : "bg-accent"
                }`}
                style={{ width: `${fraction * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
