/**
 * Çoğunluk oylaması — doğru cevabı olmayan sorular (Hangi Burç?, bkz.
 * docs/burc-oyunlari.md). En kalabalık grupla aynı şıkkı seçen puan alır.
 *
 * Saf: Firestore'a dokunmaz; puan yazımı lib/scoreWrites ile yapılır.
 */

/** En kalabalık gruptaki her oyuncuya. */
export const MAJORITY_POINTS = 100;

export interface MajorityResult<Option extends string> {
  /** Şık → oy sayısı (yalnız oy alan şıklar). */
  counts: Partial<Record<Option, number>>;
  /** En çok oyu alan şık(lar); beraberlikte hepsi. Sürü yoksa boş. */
  winners: Option[];
  /** Puanı hak eden oyuncular, kimliğe göre sıralı. */
  winnerPlayerIds: string[];
}

/**
 * Oyları sayar. "Sürü" en az iki kişidir: herkes farklı şık seçtiyse (ya da
 * tek kişi oy verdiyse) kimse puan almaz — tek başına oy verip kazanmak yok.
 */
export function majorityResult<Option extends string>(votes: Readonly<Record<string, Option>>): MajorityResult<Option> {
  const counts: Partial<Record<Option, number>> = {};
  for (const option of Object.values(votes)) {
    counts[option] = (counts[option] ?? 0) + 1;
  }
  const top = Math.max(0, ...Object.values<number | undefined>(counts).map((n) => n ?? 0));
  if (top < 2) return { counts, winners: [], winnerPlayerIds: [] };

  const winners = (Object.keys(counts) as Option[]).filter((o) => counts[o] === top).sort();
  const winnerSet = new Set<string>(winners);
  const winnerPlayerIds = Object.keys(votes)
    .filter((id) => winnerSet.has(votes[id]))
    .sort();
  return { counts, winners, winnerPlayerIds };
}
