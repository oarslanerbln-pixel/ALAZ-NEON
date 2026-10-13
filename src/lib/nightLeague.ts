import type { GameMode, Player } from "../types/database";

/**
 * Gecelik lig — F1 usulü yerleşme puanı.
 *
 * Eskiden gecelik skor her oyunun HAM puanını topluyordu: Quiz soru başına
 * ~1500 verirken Colors kazananına 150 düşüyordu, yani geceyi tek başına Quiz
 * belirliyordu. Artık her oyun bitince yalnızca SIRAYA göre puan dağıtılır;
 * her oyun eşit ağırlıkta, "tutarlı olan şampiyon olur".
 *
 * Saf: Firestore'a dokunmaz (bkz. lib/nightAwards — yazım orada, tek seferlik
 * transaction ile). Tasarım gerekçesi: docs/game-design-review.md §4.
 */

/** 1.–10. sıra puanları. */
export const PLACEMENT_POINTS = [25, 18, 15, 12, 10, 8, 6, 4, 2, 1] as const;
/** Puan alamayan ya da ilk 10'a giremeyen her katılımcıya: oynamak boşa gitmesin. */
export const PARTICIPATION_POINTS = 1;
/** Takım oyununda kazanan takımın her üyesine (bireysel 5.lik kadar). */
export const TEAM_WIN_POINTS = 10;

/** Oyuncu kimliği → bu oyundan kazanılan gecelik puan. */
export type NightPoints = Record<string, number>;

/**
 * Oyun skoruna göre sıra puanı. Eşit skor aynı sırayı paylaşır (yarışma
 * sıralaması: 1, 2, 2, 4). Hiç puan alamayan oyuncu sıraya girmez, katılım
 * puanı alır — 0 puanla "3." olmak anlamsız.
 */
export function placementPointsByScore(entries: readonly { id: string; score: number }[]): NightPoints {
  const sorted = [...entries].sort((a, b) => b.score - a.score);
  const out: NightPoints = {};
  let rank = 0;
  sorted.forEach((e, i) => {
    if (i > 0 && e.score !== sorted[i - 1].score) rank = i;
    out[e.id] = e.score > 0 && rank < PLACEMENT_POINTS.length ? PLACEMENT_POINTS[rank] : PARTICIPATION_POINTS;
  });
  return out;
}

/**
 * Skoru olmayan oyunlar için açık sıra (ör. Overload: hayatta kalan, sonra
 * en son elenenden geriye). `orderedIds[0]` birinci; listede olmayan herkes
 * katılım puanı alır.
 */
export function placementPointsByOrder(orderedIds: readonly string[], allIds: readonly string[]): NightPoints {
  const out: NightPoints = {};
  for (const id of allIds) out[id] = PARTICIPATION_POINTS;
  orderedIds.slice(0, PLACEMENT_POINTS.length).forEach((id, i) => {
    out[id] = PLACEMENT_POINTS[i];
  });
  return out;
}

/** Takım oyunu: kazanan takımın üyeleri TEAM_WIN_POINTS, diğerleri katılım. */
export function teamPoints(winnerIds: readonly string[], allIds: readonly string[]): NightPoints {
  const winners = new Set(winnerIds);
  const out: NightPoints = {};
  for (const id of new Set([...allIds, ...winnerIds])) {
    out[id] = winners.has(id) ? TEAM_WIN_POINTS : PARTICIPATION_POINTS;
  }
  return out;
}

/**
 * Skoru `total_score`'da tutan oyunların bitişi (arena, quiz, sensör, bomba).
 * Takım modunda takım toplamı en yüksek olan takım(lar) kazanır.
 */
export function nightPointsForPlayers(
  mode: GameMode | undefined,
  players: readonly Pick<Player, "id" | "total_score" | "team_name">[],
): NightPoints {
  if (mode === "team") {
    const totals = new Map<string, number>();
    for (const p of players) {
      const team = p.team_name || p.id;
      totals.set(team, (totals.get(team) ?? 0) + (p.total_score || 0));
    }
    const best = Math.max(0, ...totals.values());
    const winners = best > 0 ? players.filter((p) => totals.get(p.team_name || p.id) === best).map((p) => p.id) : [];
    return teamPoints(winners, players.map((p) => p.id));
  }
  return placementPointsByScore(players.map((p) => ({ id: p.id, score: p.total_score || 0 })));
}

/**
 * İki sıralama arasındaki yer değişimi: pozitif = yükseldi (▲), negatif =
 * düştü (▼). Yeni gelen oyuncu için 0. TV'deki "gecenin liderleri" listesi
 * bir oyun bitip puanlar dağıtıldığında kimin kaç basamak çıktığını gösterir.
 */
export function rankDeltas(prevOrder: readonly string[], nextOrder: readonly string[]): Record<string, number> {
  const prev = new Map(prevOrder.map((id, i) => [id, i]));
  const out: Record<string, number> = {};
  nextOrder.forEach((id, i) => {
    const before = prev.get(id);
    out[id] = before === undefined ? 0 : before - i;
  });
  return out;
}

type Standing = { id: string; nickname: string; night_score?: number };

/** Gecelik sıralama: gece puanı, eşitlikte ad (TV ve telefon aynı sırayı görsün). */
export function nightStandings<T extends Standing>(players: readonly T[]): T[] {
  return [...players].sort((a, b) => (b.night_score ?? 0) - (a.night_score ?? 0) || a.nickname.localeCompare(b.nickname));
}

/**
 * Bir oyuncunun gecelik sırası. Eşit puan aynı sırayı paylaşır (1, 2, 2, 4).
 * Henüz kimse puan almadıysa `null` — "8 kişiden 1." demenin anlamı yok.
 */
export function nightRankOf(players: readonly Standing[], playerId: string): { rank: number; total: number; points: number } | null {
  const me = players.find((p) => p.id === playerId);
  if (!me || !players.some((p) => (p.night_score ?? 0) > 0)) return null;
  const points = me.night_score ?? 0;
  const ahead = players.filter((p) => (p.night_score ?? 0) > points).length;
  return { rank: ahead + 1, total: players.length, points };
}
