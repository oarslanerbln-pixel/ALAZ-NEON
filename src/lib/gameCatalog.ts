import type { ComponentProps } from "react";

import type { NeonIcon } from "../components/NeonIcon";
import type { GameType } from "../types/database";
import type { TranslationKey } from "./i18n";

/**
 * Oyunun türü — dashboard karuselinde rozet olarak görünür; host gece
 * akışını (ısın → zirve → nefes → final) kartlardan okuyabilsin.
 * Bkz. docs/game-design-review.md §3.
 */
export type GameCategory = "knowledge" | "reflex" | "team" | "social" | "reward";

export const GAME_CATEGORY_KEY = {
  knowledge: "gameCategory.knowledge",
  reflex: "gameCategory.reflex",
  team: "gameCategory.team",
  social: "gameCategory.social",
  reward: "gameCategory.reward",
} as const satisfies Record<GameCategory, TranslationKey>;

export interface GameCard {
  id: GameType;
  category: GameCategory;
  titlePrefix: string;
  titleHighlight: string;
  gradientText: string;
  shadowColor: string;
  icon: NonNullable<ComponentProps<typeof NeonIcon>["type"]>;
  iconColor: NonNullable<ComponentProps<typeof NeonIcon>["color"]>;
  descKey: TranslationKey;
  bgAccent: string;
  hoverBgAccent: string;
  iconAccent: string;
  borderAccent: string;
  isComingSoon?: boolean;
}

/**
 * Host dashboard'unda gosterilen oyun kartlari — dizi sirasi karusel sirasi.
 *
 * `id` alani `GameType` ile birebir ortusmeli: HostDisplay ve PlayerGame
 * yonlendirmesi bu degere bakiyor, dolayisiyla burada karti olmayan bir mod
 * uygulamada hicbir sekilde baslatilamaz. Dosyanin sonundaki exhaustiveness
 * kontrolu eksik karti derleme zamaninda yakaliyor.
 *
 * Katalog bilerek dar: oynanabilir modlar once, kilitli (isComingSoon) modlar
 * sonda. Kaldirilan modlar ve gerekcesi: docs/game-design-review.md.
 */

export const GAME_CARDS = [
  {
    id: "scattegories",
    category: "knowledge",
    titlePrefix: "HENGAME",
    titleHighlight: "ARENA",
    gradientText: "from-alaz-orange to-yellow-500 drop-shadow-[0_0_10px_rgba(255,85,0,0.3)]",
    shadowColor: "rgba(255,85,0,0.4)",
    icon: "flame" as const,
    iconColor: "orange" as const,
    descKey: "dashboard.modeArenaDesc",
    bgAccent: "bg-alaz-orange/20",
    hoverBgAccent: "group-hover:bg-alaz-orange/40",
    iconAccent: "bg-alaz-orange/10 border-alaz-orange/40",
    borderAccent: "hover:border-alaz-orange/60",
    isComingSoon: false,
  },
  {
    id: "quiz",
    category: "knowledge",
    titlePrefix: "HENGAME",
    titleHighlight: "QUIZ",
    gradientText: "from-neon-blue to-blue-400 drop-shadow-[0_0_10px_rgba(0,229,255,0.3)]",
    shadowColor: "rgba(0,229,255,0.3)",
    icon: "lightbulb" as const,
    iconColor: "blue" as const,
    descKey: "dashboard.modeQuizDesc",
    bgAccent: "bg-neon-blue/20",
    hoverBgAccent: "group-hover:bg-neon-blue/40",
    iconAccent: "bg-neon-blue/10 border-neon-blue/40",
    borderAccent: "hover:border-neon-blue/60",
    isComingSoon: false,
  },
  {
    id: "bomb",
    category: "reflex",
    titlePrefix: "HENGAME",
    titleHighlight: "BOMB",
    gradientText: "from-red-500 to-orange-500 drop-shadow-[0_0_10px_rgba(255,0,0,0.3)]",
    shadowColor: "rgba(255,0,0,0.3)",
    icon: "rocket" as const,
    iconColor: "red" as const,
    descKey: "dashboard.modeBombDesc",
    bgAccent: "bg-red-500/20",
    hoverBgAccent: "group-hover:bg-red-500/40",
    iconAccent: "bg-red-500/10 border-red-500/40",
    borderAccent: "hover:border-red-500/60",
    isComingSoon: false,
  },
  {
    id: "slingshot",
    category: "reflex",
    titlePrefix: "YÖRÜNGE",
    titleHighlight: "SAPANI",
    gradientText: "from-emerald-400 via-teal-400 to-cyan-500 drop-shadow-[0_0_10px_rgba(16,185,129,0.4)]",
    shadowColor: "rgba(16,185,129,0.4)",
    icon: "crosshair",
    iconColor: "green",
    descKey: "dashboard.modeSlingshotDesc",
    bgAccent: "bg-emerald-500/20",
    hoverBgAccent: "group-hover:bg-emerald-500/40",
    iconAccent: "bg-emerald-500/10 border-emerald-400/40",
    borderAccent: "hover:border-emerald-400/60",
    // Kilitli: şut akışı PR #377'de düzeltildi; uçtan uca test yeşil olana
    // kadar mekanda açılmıyor.
    isComingSoon: true,
  }
] as const satisfies readonly GameCard[];

/** Katalogda karti bulunan mod kimlikleri. */
type CoveredGameType = (typeof GAME_CARDS)[number]["id"];

/**
 * `GameType`'a yeni bir mod eklenip buraya karti eklenmezse bu satir DERLENMEZ.
 * Kart eklemeyi unutmak eskiden sessizce "erisilemez oyun" uretiyordu; artik
 * build hatasi veriyor.
 */
type AssertNever<T extends never> = T;
export type _EveryGameTypeHasACard = AssertNever<Exclude<GameType, CoveredGameType>>;

/** Oyunun görünen adı ("HENGAME QUIZ"); katalogda yoksa boş dize. */
export function gameTitle(id: GameType | null | undefined): string {
  const card = GAME_CARDS.find((c) => c.id === id);
  return card ? `${card.titlePrefix} ${card.titleHighlight}` : "";
}
