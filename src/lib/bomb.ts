import type { Player } from "../types/database";

/** Can alanı hiç yazılmamış oyuncu tam canlı sayılır. */
export function bombLives(p: Pick<Player, "lives">): number {
  return p.lives === undefined ? 3 : p.lives;
}

/**
 * Bombanın yeni sahibi: hâlâ canı olan, `excludeId` dışındaki rastgele bir
 * oyuncu. Kimse kalmadıysa `null`. `random` testte sabitlenebilsin diye
 * parametre.
 */
export function pickBombHolder(
  players: readonly Pick<Player, "id" | "lives">[],
  excludeId: string | null | undefined,
  random: () => number = Math.random,
): string | null {
  const alive = players.filter((p) => p.id !== excludeId && bombLives(p) > 0);
  if (alive.length === 0) return null;
  return alive[Math.min(alive.length - 1, Math.floor(random() * alive.length))].id;
}

/**
 * Bombanın sıradaki kategorisi ve güncel "kullanılmış" listesi.
 *
 * Gece lobisinden doğrudan açılan bombada odanın kategori listesi boş
 * (`categories: []`). Eskiden ikinci tur `availableCategories[NaN]` ile
 * `active_letter: undefined` yazmaya çalışıyor, Firestore bunu reddediyor ve
 * TV patlama ekranında kalıyordu. Liste boşsa "" (genel kategori) döner;
 * ekranlar boş değeri `bomb.generalCategory` ile mekân dilinde gösteriyor.
 */
export function nextBombCategory(
  categories: readonly string[] | undefined,
  used: readonly string[] | undefined,
  random: () => number = Math.random,
): { category: string; used: string[] } {
  const all = (categories ?? []).filter((c) => typeof c === "string" && c.trim() !== "");
  if (all.length === 0) return { category: "", used: [""] };
  const usedList = (used ?? []).filter((c) => all.includes(c));
  const fresh = all.filter((c) => !usedList.includes(c));
  const pool = fresh.length > 0 ? fresh : all;
  const category = pool[Math.min(pool.length - 1, Math.floor(random() * pool.length))];
  return { category, used: fresh.length > 0 ? [...usedList, category] : [category] };
}
