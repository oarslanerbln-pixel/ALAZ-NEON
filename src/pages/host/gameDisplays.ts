import { lazy, type ComponentType, type LazyExoticComponent } from "react";

import type { RoutedGame } from "../../lib/gameRouting";
import type { Player, Room } from "../../types/database";

/** HostDisplay'in her oyun ekranına verdiği ortak prop seti. */
export interface HostGameProps {
  room: Room;
  players: Player[];
  updateRoomStatus: (status: Room["status"], extra?: Partial<Room>) => Promise<void>;
  updatePlayerScore: (playerId: string, totalScore: number) => Promise<void>;
}

type Loader = () => Promise<{ default: ComponentType<HostGameProps> }>;

/**
 * Mod → host ekranı yükleyicisi. `Record<RoutedGame, …>` olduğu için
 * GameType'a eklenen bir modun ekranı burada yoksa derleme kırılır.
 */
const HOST_GAME_LOADERS: Record<RoutedGame, Loader> = {
  quiz: () => import("./quiz/HostQuizDisplay").then((m) => ({ default: m.HostQuizDisplay })),
  bomb: () => import("./bomb/HostBombDisplay").then((m) => ({ default: m.HostBombDisplay })),
  sensor: () => import("./sensor/HostSensorDisplay").then((m) => ({ default: m.HostSensorDisplay })),
  wheel: () => import("./wheel/HostWheelDisplay").then((m) => ({ default: m.HostWheelDisplay })),
  overload: () => import("./overload/HostOverloadDisplay").then((m) => ({ default: m.HostOverloadDisplay })),
  echo: () => import("./echo/HostEchoDisplay").then((m) => ({ default: m.HostEchoDisplay })),
  pulse: () => import("./pulse/HostPulseDisplay").then((m) => ({ default: m.HostPulseDisplay })),
  spectrum: () => import("./spectrum/HostSpectrumDisplay").then((m) => ({ default: m.HostSpectrumDisplay })),
  colors: () => import("./colors/HostColorsDisplay").then((m) => ({ default: m.HostColorsDisplay })),
  vault: () => import("./vault/HostVaultDisplay").then((m) => ({ default: m.HostVaultDisplay })),
  unity: () => import("./unity/HostUnityDisplay").then((m) => ({ default: m.HostUnityDisplay })),
  bar: () => import("./bar/HostBarDisplay").then((m) => ({ default: m.HostBarDisplay })),
  kablo: () => import("./kablo/HostKabloDisplay").then((m) => ({ default: m.HostKabloDisplay })),
  ayna: () => import("./ayna/HostAynaDisplay").then((m) => ({ default: m.HostAynaDisplay })),
};

/**
 * Ekranlar tembel yükleniyor, böylece TV'nin ilk açılışı hafif kalıyor.
 * Yayın sonrası eski chunk'ın 404 vermesi main.tsx'teki
 * `vite:preloadError` dinleyicisiyle karşılanıyor.
 */
export const HOST_GAME_DISPLAYS = Object.fromEntries(
  Object.entries(HOST_GAME_LOADERS).map(([game, load]) => [game, lazy(load)]),
) as Record<RoutedGame, LazyExoticComponent<ComponentType<HostGameProps>>>;

/**
 * TV boştayken tüm oyun ekranlarını önceden indirir. Oyun değişiminde
 * bekleme olmuyor ve gece boyunca açık kalan sekme, gece yarısı bir yayın
 * sonrası artık var olmayan bir chunk'ı istemek zorunda kalmıyor. Yalnızca
 * host'ta: misafir telefonunun mobil verisini harcamaya değmez.
 */
export function preloadHostGameDisplays() {
  for (const load of Object.values(HOST_GAME_LOADERS)) {
    load().catch(() => {
      // Asıl yükleme sırasında tekrar denenir; burada sessiz geçiyoruz.
    });
  }
}
