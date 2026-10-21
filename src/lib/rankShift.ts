/**
 * Sıralama ekranlarının "eski sıradan yeni sıraya kayış" koreografisi için
 * saf yardımcılar. Ekran önce bir önceki sıralamayı gösterir, kısa bir
 * bekleyişten sonra yeni sıraya `layout` animasyonuyla geçer ve yer
 * değiştirenlere ▲/▼ rozeti basar (bkz. docs/motion-system.md §4).
 */

export interface RankedEntry {
  id: string;
  total_score: number;
  created_at?: number;
}

/** Puana göre azalan; eşitlikte önce katılan önde (sıra her render'da aynı kalsın). */
export function rankOrder(entries: readonly RankedEntry[]): string[] {
  return [...entries]
    .sort((a, b) => b.total_score - a.total_score || (a.created_at ?? 0) - (b.created_at ?? 0))
    .map((e) => e.id);
}

/**
 * Ekranın İLK karede göstereceği sıra: önceki sıralama, artık olmayanlar
 * çıkarılmış, yeni katılanlar sona eklenmiş. Önceki sıra yoksa yeni sıra.
 */
export function startingOrder(previous: readonly string[], next: readonly string[]): string[] {
  if (previous.length === 0) return [...next];
  const present = new Set(next);
  const kept = previous.filter((id) => present.has(id));
  const known = new Set(kept);
  return [...kept, ...next.filter((id) => !known.has(id))];
}

/**
 * Oyuncu başına kaç basamak yükseldi (+) ya da düştü (−). Önceki sıralamada
 * olmayan ya da yerinde kalan oyuncu listede yer almaz.
 */
export function rankDeltas(previous: readonly string[], next: readonly string[]): Record<string, number> {
  const before = new Map(previous.map((id, i) => [id, i]));
  const deltas: Record<string, number> = {};
  next.forEach((id, i) => {
    const was = before.get(id);
    if (was !== undefined && was !== i) deltas[id] = was - i;
  });
  return deltas;
}
