import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { DURATION, EASE, prefersReducedMotion } from "../../lib/motion";

/** Zar yüzündeki noktalar: 3×3 ızgarada dolu hücreler. */
const PIPS: Record<number, readonly number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

/** Yuvarlanırken gösterilen ara yüz sayısı ve aralığı (toplam ~0,35 sn, tek sefer). */
const TUMBLE_FACES = 5;
const TUMBLE_MS = 70;

/** Sonuçtan farklı, sırayla değişen ara yüz. */
function tumbleFace(value: number, step: number): number {
  return 1 + ((value + 1 + step * 2) % 6);
}

interface RaceDieProps {
  value: number | undefined;
  /** Kenar uzunluğu (px). */
  size: number;
  active?: boolean;
  label?: string;
}

/**
 * Düz SVG zar. Ekrana geldiğinde bir kez yuvarlanır: kısa bir dönüş ve birkaç
 * ara yüz, sonra sonuçta durur. Yeni atışta çağıran `key` değiştirir.
 */
export function RaceDie({ value, size, active = false, label }: RaceDieProps) {
  const [step, setStep] = useState(() => (value && !prefersReducedMotion() ? 0 : TUMBLE_FACES));

  useEffect(() => {
    if (step >= TUMBLE_FACES) return;
    const id = setTimeout(() => setStep((s) => s + 1), TUMBLE_MS);
    return () => clearTimeout(id);
  }, [step]);

  const settled = step >= TUMBLE_FACES;
  const face = value ? (settled ? value : tumbleFace(value, step)) : 0;
  const pips = PIPS[face] ?? [];

  return (
    <motion.svg
      width={size}
      height={size}
      viewBox="0 0 60 60"
      role="img"
      aria-label={label ?? (value ? String(value) : undefined)}
      data-testid="race-die"
      data-value={value ?? ""}
      initial={{ rotate: -180, scale: 0.55, opacity: 0 }}
      animate={{ rotate: 0, scale: 1, opacity: 1 }}
      transition={{ duration: DURATION.slow * 1.6, ease: EASE.out }}
      className="shrink-0"
    >
      {/* Alt kenar: zara düz bir kalınlık verir. */}
      <rect x="2" y="6" width="56" height="52" rx="12" className={active ? "fill-accent" : "fill-ink-2"} opacity={0.55} />
      <rect x="2" y="2" width="56" height="52" rx="12" className={active ? "fill-accent" : "fill-ink"} />
      {pips.map((cell) => (
        <circle key={cell} cx={15 + (cell % 3) * 15} cy={13 + Math.floor(cell / 3) * 15} r="5.2" className="fill-bg" />
      ))}
    </motion.svg>
  );
}
