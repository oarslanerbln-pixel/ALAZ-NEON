/**
 * Renkler (halat çekme) sonuç kuralı.
 *
 * - "domination": ibre bir uca dayanınca biter. Güvenlik süresi dolarsa
 *   (iki eşit takım ibreyi hiç uca taşıyamayabilir; eskiden oyun sonsuza dek
 *   sürüyordu) ibre hangi taraftaysa o kazanır.
 * - "timed": süre sonunda ibre hangi taraftaysa o kazanır. Bu seçenek kurulum
 *   ekranında vardı ama hiçbir yere bağlı değildi.
 */
export type ColorsWinCondition = "domination" | "timed";
export type ColorsResult = "red" | "blue" | "draw";

export const COLORS_TIMED_SEC = 60;
export const COLORS_DOMINATION_CAP_SEC = 120;

export function colorsDurationSec(condition: ColorsWinCondition | undefined): number {
  return condition === "timed" ? COLORS_TIMED_SEC : COLORS_DOMINATION_CAP_SEC;
}

/** İbre konumu: %50 ortada, takım farkı hedefin tamamına ulaşınca 0/100. */
export function redShare(redScore: number, blueScore: number, target: number): number {
  const safeTarget = target > 0 ? target : 100;
  const pct = 50 + ((redScore - blueScore) / safeTarget) * 50;
  return Math.max(0, Math.min(100, pct));
}

/** Oyun bitti mi, bittiyse sonuç. `null` = sürüyor. */
export function decideColors(opts: {
  redPct: number;
  condition?: ColorsWinCondition;
  now: number;
  endTime?: number;
}): ColorsResult | null {
  const { redPct, condition = "domination", now, endTime } = opts;
  if (condition === "domination") {
    if (redPct >= 100) return "red";
    if (redPct <= 0) return "blue";
  }
  if (endTime && endTime > 0 && now >= endTime) {
    if (redPct > 50) return "red";
    if (redPct < 50) return "blue";
    return "draw";
  }
  return null;
}
