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
  sensor: lazy(() => import("./sensor/PlayerSensorController").then((m) => ({ default: m.PlayerSensorController }))),
  wheel: lazy(() => import("./wheel/PlayerWheelController").then((m) => ({ default: m.PlayerWheelController }))),
  overload: lazy(() => import("./overload/PlayerOverloadGame").then((m) => ({ default: m.PlayerOverloadGame }))),
  echo: lazy(() => import("./echo/PlayerEchoController").then((m) => ({ default: m.PlayerEchoController }))),
  pulse: lazy(() => import("./pulse/PlayerPulseController").then((m) => ({ default: m.PlayerPulseController }))),
  spectrum: lazy(() => import("./spectrum/PlayerSpectrumController").then((m) => ({ default: m.PlayerSpectrumController }))),
  colors: lazy(() => import("./colors/PlayerColorsController").then((m) => ({ default: m.PlayerColorsController }))),
  vault: lazy(() => import("./vault/PlayerVaultController").then((m) => ({ default: m.PlayerVaultController }))),
  unity: lazy(() => import("./unity/PlayerUnityController").then((m) => ({ default: m.PlayerUnityController }))),
  bar: lazy(() => import("./bar/PlayerBarController").then((m) => ({ default: m.PlayerBarController }))),
  kablo: lazy(() => import("./kablo/PlayerKabloController").then((m) => ({ default: m.PlayerKabloController }))),
  ayna: lazy(() => import("./ayna/PlayerAynaController").then((m) => ({ default: m.PlayerAynaController }))),
};
