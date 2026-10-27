import { lazy, type ComponentType } from "react";

import type { RoutedGame } from "../../lib/gameRouting";
import type { Player, Room } from "../../types/database";

/** PlayerGame'in her oyun kumandasına verdiği ortak prop seti. */
export interface PlayerGameProps {
  room: Room;
  player: Player;
}

/**
 * Mod → oyuncu kumandası. Host tarafındaki HOST_GAME_DISPLAYS ile aynı
 * anahtar kümesi; eksik mod derleme hatası verir.
 */
export const PLAYER_GAME_CONTROLLERS: Record<RoutedGame, ComponentType<PlayerGameProps>> = {
  quiz: lazy(() => import("./quiz/PlayerQuizController").then((m) => ({ default: m.PlayerQuizController }))),
  bomb: lazy(() => import("./bomb/PlayerBombController").then((m) => ({ default: m.PlayerBombController }))),
  slingshot: lazy(() => import("./slingshot/PlayerSlingshotController").then((m) => ({ default: m.PlayerSlingshotController }))),
};
