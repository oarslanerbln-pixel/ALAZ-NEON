import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import { DURATION, EASE, prefersReducedMotion } from "../../lib/motion";
import { dieAsset } from "./raceAssets";

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
  /** Oynayan takımın zarı: hafifçe büyür (vurgu rengi kartın kenarında). */
  active?: boolean;
  label?: string;
}

/**
 * Önceden render edilmiş zar (Blender, `scripts/blender/nova_assets.py`).
 * Ekrana geldiğinde bir kez yuvarlanır: kısa bir dönüş ve birkaç ara yüz,
 * sonra sonuçta durur. Yeni atışta çağıran `key` değiştirir.
 */
export function RaceDie({ value, size, active = false, label }: RaceDieProps) {
  const [step, setStep] = useState(() => (value && !prefersReducedMotion() ? 0 : TUMBLE_FACES));

  useEffect(() => {
    if (step >= TUMBLE_FACES) return;
    const id = setTimeout(() => setStep((s) => s + 1), TUMBLE_MS);
    return () => clearTimeout(id);
  }, [step]);

  const face = value ? (step >= TUMBLE_FACES ? value : tumbleFace(value, step)) : 0;

  return (
    <motion.span
      role="img"
      aria-label={label ?? (value ? String(value) : undefined)}
      data-testid="race-die"
      data-value={value ?? ""}
      initial={{ rotate: -160, scale: 0.55, opacity: 0 }}
      animate={{ rotate: 0, scale: active ? 1.12 : 1, opacity: 1 }}
      transition={{ duration: DURATION.slow * 1.6, ease: EASE.out }}
      className="inline-block shrink-0"
      style={{ width: size, height: size }}
    >
      {face > 0 && <img src={dieAsset(face)} alt="" width={size} height={size} decoding="async" draggable={false} className="block h-full w-full" />}
    </motion.span>
  );
}
