/**
 * Burç temalı oyunların ortak mantığı (bkz. docs/burc-oyunlari.md).
 *
 * Saf: Firestore'a dokunmaz. Misafir burcunu 12'li ızgaradan seçer — doğum
 * tarihi sorulmaz, bu yüzden tarihten burç hesabı bilerek yok.
 */

/** Zodyak sırasıyla (Koç → Balık). Kimlikler çeviri anahtarlarında da kullanılır. */
export const ZODIAC_SIGNS = [
  "aries",
  "taurus",
  "gemini",
  "cancer",
  "leo",
  "virgo",
  "libra",
  "scorpio",
  "sagittarius",
  "capricorn",
  "aquarius",
  "pisces",
] as const;

export type ZodiacSign = (typeof ZODIAC_SIGNS)[number];
export type ZodiacElement = "fire" | "earth" | "air" | "water";

/** Zodyak sırasında elementler dörtlü döngüyle tekrar eder: ateş, toprak, hava, su. */
const ELEMENT_CYCLE: readonly ZodiacElement[] = ["fire", "earth", "air", "water"];

export const ELEMENT_OF = Object.fromEntries(
  ZODIAC_SIGNS.map((sign, i) => [sign, ELEMENT_CYCLE[i % ELEMENT_CYCLE.length]]),
) as Record<ZodiacSign, ZodiacElement>;

/** Telefondan gelen değer gerçekten bir burç mu (istemci kurcalanabilir kabul edilir). */
export function isZodiacSign(value: unknown): value is ZodiacSign {
  return typeof value === "string" && (ZODIAC_SIGNS as readonly string[]).includes(value);
}

/** Yeterli element yoksa kurulan iki dengeli takım. */
export type FallbackTeam = "sun" | "moon";

export interface ZodiacTeam {
  id: ZodiacElement | FallbackTeam;
  playerIds: string[];
}

/**
 * Oyuncuları element takımlarına böler (Yıldız Kayması).
 *
 * Tek kişilik takım yarışamaz: `minSize`'ın altındaki elementlerin oyuncuları,
 * o an en küçük olan geçerli takıma tek tek dağıtılır. Geçerli element sayısı
 * ikinin altındaysa (ör. herkes ateş) elementler bırakılır, iki dengeli takım
 * kurulur. Sonuç oyuncu kimliğine göre sıralı ve deterministiktir: aynı girdi
 * her cihazda aynı takımları verir.
 */
export function elementTeams(signs: Readonly<Record<string, ZodiacSign>>, minSize = 2): ZodiacTeam[] {
  const playerIds = Object.keys(signs).sort();
  const byElement = new Map<ZodiacElement, string[]>();
  for (const id of playerIds) {
    const element = ELEMENT_OF[signs[id]];
    byElement.set(element, [...(byElement.get(element) ?? []), id]);
  }

  const teams: ZodiacTeam[] = ELEMENT_CYCLE.filter((e) => (byElement.get(e)?.length ?? 0) >= minSize).map((e) => ({
    id: e,
    playerIds: [...byElement.get(e)!],
  }));

  if (teams.length < 2) {
    const sun: string[] = [];
    const moon: string[] = [];
    playerIds.forEach((id, i) => (i % 2 === 0 ? sun : moon).push(id));
    return [
      { id: "sun", playerIds: sun },
      { id: "moon", playerIds: moon },
    ].filter((t): t is ZodiacTeam => t.playerIds.length > 0);
  }

  const placed = new Set(teams.flatMap((t) => t.playerIds));
  for (const id of playerIds) {
    if (placed.has(id)) continue;
    // Eşitlikte ilk (zodyak sırasındaki) takım: seçim cihazdan cihaza değişmesin.
    const smallest = teams.reduce((min, t) => (t.playerIds.length < min.playerIds.length ? t : min));
    smallest.playerIds.push(id);
  }
  for (const t of teams) t.playerIds.sort();
  return teams;
}
