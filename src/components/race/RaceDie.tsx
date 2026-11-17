import { motion } from "framer-motion";

import { DURATION, EASE } from "../../lib/motion";

/** Zar yüzündeki noktalar: 3×3 ızgarada dolu hücreler. */
const PIPS: Record<number, readonly number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

interface RaceDieProps {
  value: number | undefined;
  /** Kenar uzunluğu (px). */
  size: number;
  active?: boolean;
  /** Değişince zar yeniden "düşer" (tur numarası gibi). */
  rollKey?: string | number;
  label?: string;
}

/** Düz SVG zar; atıldığında tek seferlik kısa bir dönüşle yerine oturur. */
export function RaceDie({ value, size, active = false, rollKey, label }: RaceDieProps) {
  const pips = value ? (PIPS[value] ?? []) : [];
  return (
    <motion.svg
      key={rollKey}
      width={size}
      height={size}
      viewBox="0 0 60 60"
      role="img"
      aria-label={label ?? (value ? String(value) : undefined)}
      data-testid="race-die"
      data-value={value ?? ""}
      initial={{ rotate: -90, scale: 0.6, opacity: 0 }}
      animate={{ rotate: 0, scale: 1, opacity: 1 }}
      transition={{ duration: DURATION.slow, ease: EASE.out }}
      className="shrink-0"
    >
      <rect x="2" y="2" width="56" height="56" rx="12" className={active ? "fill-accent" : "fill-ink"} />
      {pips.map((cell) => (
        <circle key={cell} cx={15 + (cell % 3) * 15} cy={15 + Math.floor(cell / 3) * 15} r="5.5" className="fill-bg" />
      ))}
    </motion.svg>
  );
}
