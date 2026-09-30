import type { GameType, Player } from "../types/database";

/**
 * Bir oyun gece panelinden açılırken oyuncu dokümanlarında sıfırlanması
 * gereken alanlar.
 *
 * Oyunlar sayaçlarını oyuncu dokümanında tutuyor ve oda gece boyu aynı.
 * Sıfırlanmayan sayaç bir sonraki oyuna taşınıyordu: ikinci Renkler oyunu
 * önceki tıklamalarla açılıp anında bitiyor, Bomba'da önceki oyunda elenen
 * misafirler (can = 0) yeni oyuna hiç alınmıyordu.
 */
export const DEFAULT_BOMB_LIVES = 3;

export function playerResetForGame(
  game: GameType,
  opts: { bombLives?: number } = {},
): Partial<Player> | null {
  switch (game) {
    case "bar":
      return { bar_score: 0 };
    case "kablo":
      return { kablo_score: 0 };
    case "colors":
      return { colors_clicks: 0 };
    case "spectrum":
      return { spectrum_clicks: 0 };
    case "unity":
      return { unity_clicks: 0 };
    case "bomb":
      return { lives: clampLives(opts.bombLives), total_score: 0 };
    default:
      return null;
  }
}

export function clampLives(lives: number | undefined): number {
  if (typeof lives !== "number" || !Number.isFinite(lives)) return DEFAULT_BOMB_LIVES;
  return Math.min(5, Math.max(1, Math.round(lives)));
}

/**
 * Oyuncuları iki takıma dengeli dağıtır (karıştırıp sırayla). Takım
 * büyüklükleri en fazla 1 farklı olur. `rand` test için enjekte ediliyor.
 */
export function assignTwoTeams(
  playerIds: readonly string[],
  rand: () => number = Math.random,
): Record<string, "red" | "blue"> {
  const shuffled = [...playerIds];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const teams: Record<string, "red" | "blue"> = {};
  shuffled.forEach((id, i) => {
    teams[id] = i % 2 === 0 ? "red" : "blue";
  });
  return teams;
}
