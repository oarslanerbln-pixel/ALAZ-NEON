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
