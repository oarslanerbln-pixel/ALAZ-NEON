import { useEffect, useRef } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { DURATION, EASE } from "../../lib/motion";

interface NumberTickerProps {
  value: number;
  /** Sayaç başlama değeri (varsayılan: 0). */
  initial?: number;
  /** Animasyon süresi (saniye, varsayılan: DURATION.slow = 0.6). */
  duration?: number;
  /** Başlangıç gecikmesi (saniye). */
  delay?: number;
  /** Ondalık basamak sayısı (varsayılan: 0). */
  decimalPlaces?: number;
  prefix?: string;
  suffix?: string;
  className?: string;
}

/**
 * Sayıları akıcı bir şekilde yukarı doğru sayan veya yuvarlayan sayaç
 * (Magic UI "Number Ticker" deseni).
 *
 * `tabular-nums` ile rakam genişlikleri sabit tutulur, sayarken metin
 * titremez (horizontal jitter engellenir). React'i her karede uyandırmaz;
 * doğrudan Framer Motion MotionValue aracılığıyla DOM'a yazar.
 */
export function NumberTicker({
  value,
  initial = 0,
  duration = DURATION.slow,
  delay = 0,
  decimalPlaces = 0,
  prefix = "",
  suffix = "",
  className = "",
}: NumberTickerProps) {
  const reduced = useReducedMotion();
  const motionVal = useMotionValue(initial);
  const isFirstRun = useRef(true);

  const display = useTransform(motionVal, (latest) => {
    const formatted = latest.toLocaleString("tr-TR", {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    });
    return `${prefix}${formatted}${suffix}`;
  });

  useEffect(() => {
    if (reduced) {
      motionVal.set(value);
      return;
    }

    const controls = animate(motionVal, value, {
      duration,
      delay: isFirstRun.current ? delay : 0,
      ease: EASE.out,
    });
    isFirstRun.current = false;

    return () => controls.stop();
  }, [value, duration, delay, motionVal, reduced]);

  return (
    <motion.span className={`inline-block tabular-nums font-mono ${className}`}>
      {display}
    </motion.span>
  );
}
