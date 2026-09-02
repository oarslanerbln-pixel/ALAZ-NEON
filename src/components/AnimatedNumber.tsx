import { useEffect, useRef } from "react";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import { DURATION, EASE } from "../lib/motion";

interface AnimatedNumberProps {
  value: number;
  /** İlk render'da sayacın başlayacağı değer (varsayılan: value → animasyon yok) */
  from?: number;
  /** İlk animasyon için gecikme (sn) */
  delay?: number;
  duration?: number;
  className?: string;
  format?: (n: number) => string;
}

const defaultFormat = (n: number) => n.toLocaleString("tr-TR");

/**
 * Skor sayacı. Değer değişince eski değerden yenisine "sayar"; React'i her
 * karede yeniden render etmez (motion value → DOM'a doğrudan yazılır).
 * `tabular-nums`: rakamlar eşit genişlikte — sayarken metin titremez.
 * Hareketi azalt tercihinde doğrudan son değeri gösterir.
 */
export function AnimatedNumber({
  value,
  from,
  delay = 0,
  duration = DURATION.cinematic,
  className = "",
  format = defaultFormat,
}: AnimatedNumberProps) {
  const reduced = useReducedMotion();
  const mv = useMotionValue(from ?? value);
  const text = useTransform(mv, (v) => format(Math.round(v)));
  const isFirstRun = useRef(true);

  useEffect(() => {
    if (reduced) {
      mv.set(value);
      return;
    }
    const controls = animate(mv, value, {
      duration,
      delay: isFirstRun.current ? delay : 0,
      ease: EASE.out,
    });
    isFirstRun.current = false;
    return () => controls.stop();
  }, [value, delay, duration, mv, reduced]);

  return <motion.span className={`tabular-nums ${className}`}>{text}</motion.span>;
}
