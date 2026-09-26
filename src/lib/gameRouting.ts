import type { GameType, Room } from "../types/database";

/**
 * Oda hangi oyunu oynatıyor — HostDisplay ve PlayerGame'in ortak cevabı.
 *
 * Eskiden iki yönlendirici de her mod için ayrı bir
 * `room.active_game === x || room.game_type === x` bloğu tutuyordu (13'er
 * kopya). Bunun iki bedeli vardı:
 *
 * 1. Eski `game_type` alanı `active_game`'i EZEBİLİYORDU: "lobiye dön"
 *    `active_game: "none"` yazsa bile `game_type: "quiz"` taşıyan bir oda
 *    quiz ekranına geri düşüyordu. Artık `active_game` yazılmışsa ("none"
 *    dahil) tek söz sahibi o; `game_type` yalnızca hiç yazılmamışsa okunur.
 * 2. Yeni bir mod bir tarafa eklenip diğerine unutulabiliyordu. Kayıtlar
 *    artık `Record<RoutedGame, …>` — eksik mod derleme hatası.
 */

/** Kendi host ekranı ve oyuncu kumandası olan modlar; Arena klasik akışta. */
export type RoutedGame = Exclude<GameType, "scattegories">;

/**
 * Seçili oyun. `null` = henüz oyun seçilmedi (gece lobisi / dashboard).
 */
export function resolveActiveGame(
  room: Pick<Room, "active_game" | "game_type">,
): GameType | null {
  if (room.active_game !== undefined) {
    return room.active_game === "none" ? null : room.active_game;
  }
  return room.game_type ?? null;
}

/** Kendi ekran çifti olan bir mod seçiliyse onu, değilse `null` döner. */
export function resolveRoutedGame(
  room: Pick<Room, "active_game" | "game_type">,
): RoutedGame | null {
  const game = resolveActiveGame(room);
  return game === null || game === "scattegories" ? null : game;
}

/**
 * Oyundan bağımsız ara ekranlar: bu durumlarda oyuncu, oyunun kumandası
 * yerine ortak ekranı (eğitim / reklam arası) görür.
 */
const SHARED_PLAYER_STATUSES: ReadonlySet<Room["status"]> = new Set(["tutorial", "ad_break"]);

/** Oyuncu tarafında oyunun kendi kumandasına mı yönlendirilmeli. */
export function resolvePlayerGameRoute(
  room: Pick<Room, "active_game" | "game_type" | "status">,
): RoutedGame | null {
  if (SHARED_PLAYER_STATUSES.has(room.status)) return null;
  return resolveRoutedGame(room);
}
