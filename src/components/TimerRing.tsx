import type { ReactNode } from "react";
import { motion } from "framer-motion";

export type TimerTone = "calm" | "warning" | "critical" | "over";

interface TimerRingProps {
  timeLeft: number;
  maxTime: number;
  tone?: TimerTone;
  /** CSS px */
  size?: number;
  /** viewBox birimi (0–100) */
  strokeWidth?: number;
  className?: string;
  children?: ReactNode;
}

const TONE_COLOR: Record<TimerTone, string> = {
  calm: "var(--color-accent)",
  warning: "var(--color-accent)",
  critical: "var(--color-bad)",
  over: "color-mix(in oklab, var(--color-bad) 40%, transparent)",
};

/**
 * Azalan dairesel zamanlayıcı (Apple Watch / Kahoot standardı).
 *
 * `pathLength` framer tarafından `stroke-dasharray` olarak sürülür; her tam
 * saniye tik'inde 1sn'lik doğrusal tween ile bir sonraki değere akar — ekran
 * saniyede iki kez tamsayı alsa da halka KESİNTİSİZ boşalıyor görünür.
 * Tek ray + tek çizgi; parlama katmanı yok.
 */
export function TimerRing({
  timeLeft,
  maxTime,
  tone = "calm",
  size = 280,
  strokeWidth = 3,
  className = "",
  children,
}: TimerRingProps) {
  const fraction = maxTime > 0 ? Math.min(1, Math.max(0, timeLeft / maxTime)) : 0;
  const color = TONE_COLOR[tone];

  return (
    <div style={{ width: size, height: size }} className={`relative ${className}`}>
      <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full -rotate-90" aria-hidden="true">
        {/* Ray */}
        <circle cx="50" cy="50" r="46" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth={strokeWidth} />
        {/* Ana çizgi */}
        <motion.circle
          cx="50"
          cy="50"
          r="46"
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          // var() sunum özniteliğinde çözülmez; renk stil olarak verilir.
          style={{ stroke: color, transition: "stroke 0.25s ease" }}
          initial={false}
          animate={{ pathLength: fraction }}
          transition={{ duration: 1, ease: "linear" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}
