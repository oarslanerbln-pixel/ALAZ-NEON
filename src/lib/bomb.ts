import type { Player } from "../types/database";
import type { Locale } from "./i18n";

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
 * Odada kategori yokken bombanın kullandığı hazır liste: geniş, kafede
 * herkesin birkaç kelime bulabileceği konular. Kategori odaya metin olarak
 * yazılıyor, bu yüzden odanın dilinde (`room.locale`).
 */
export const BOMB_DEFAULT_CATEGORIES: Record<Locale, readonly string[]> = {
  de: ["Tiere", "Städte", "Länder", "Berufe", "Essen & Trinken", "Marken", "Sportarten", "Filme & Serien", "Obst & Gemüse", "Musiker & Bands"],
  tr: ["Hayvanlar", "Şehirler", "Ülkeler", "Meslekler", "Yiyecek & İçecek", "Markalar", "Spor Dalları", "Filmler & Diziler", "Meyve & Sebze", "Şarkıcılar & Gruplar"],
  en: ["Animals", "Cities", "Countries", "Jobs", "Food & Drinks", "Brands", "Sports", "Films & TV Shows", "Fruit & Vegetables", "Singers & Bands"],
};

/**
 * Bombanın sıradaki kategorisi ve güncel "kullanılmış" listesi.
 *
 * Gece lobisinden doğrudan açılan bombada odanın kategori listesi boş
 * (`categories: []`). Eskiden ikinci tur `availableCategories[NaN]` ile
 * `active_letter: undefined` yazmaya çalışıyor, Firestore bunu reddediyor ve
 * TV patlama ekranında kalıyordu; sonra boş liste "" (genel kategori) oldu,
 * ama "ALLGEMEIN" oyunu yönsüz bırakıyordu. Artık liste boşsa odanın
 * dilindeki hazır listeden (BOMB_DEFAULT_CATEGORIES) seçiliyor; dil
 * bilinmiyorsa Almanca (uygulamanın varsayılanı).
 */
export function nextBombCategory(
  categories: readonly string[] | undefined,
  used: readonly string[] | undefined,
  locale: Locale | undefined,
  random: () => number = Math.random,
): { category: string; used: string[] } {
  const own = (categories ?? []).filter((c) => typeof c === "string" && c.trim() !== "");
  const all = own.length > 0 ? own : [...BOMB_DEFAULT_CATEGORIES[locale ?? "de"]];
  const usedList = (used ?? []).filter((c) => all.includes(c));
  const fresh = all.filter((c) => !usedList.includes(c));
  const pool = fresh.length > 0 ? fresh : all;
  const category = pool[Math.min(pool.length - 1, Math.floor(random() * pool.length))];
  return { category, used: fresh.length > 0 ? [...usedList, category] : [category] };
}
