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
 * uygulamada hicbir sekilde baslatilamaz. Echo, Pulse, Bar ve Kablo
 * tam olarak bu yuzden uzun sure yazilmis ama erisilemez kaldi; dosyanin
 * sonundaki exhaustiveness kontrolu ayni hatayi derleme zamaninda yakaliyor.
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
    id: "sensor",
    category: "reflex",
    titlePrefix: "HENGAME",
    titleHighlight: "SENSÖR",
    gradientText: "from-neon-pink to-purple-500 drop-shadow-[0_0_10px_rgba(255,0,255,0.3)]",
    shadowColor: "rgba(255,0,255,0.3)",
    icon: "dashboard" as const,
    iconColor: "pink" as const,
    descKey: "dashboard.modeSensorDesc",
    bgAccent: "bg-neon-pink/20",
    hoverBgAccent: "group-hover:bg-neon-pink/40",
    iconAccent: "bg-neon-pink/10 border-neon-pink/40",
    borderAccent: "hover:border-neon-pink/60",
    isComingSoon: true,
  },
  {
    id: "overload",
    category: "reflex",
    titlePrefix: "NEON",
    titleHighlight: "OVERLOAD",
    gradientText: "from-cyan-400 to-purple-500 drop-shadow-[0_0_10px_rgba(0,255,255,0.3)]",
    shadowColor: "rgba(0,255,255,0.3)",
    icon: "flame" as const,
    iconColor: "blue" as const,
    descKey: "dashboard.modeOverloadDesc",
    bgAccent: "bg-cyan-400/20",
    hoverBgAccent: "group-hover:bg-cyan-400/40",
    iconAccent: "bg-cyan-400/10 border-cyan-400/40",
    borderAccent: "hover:border-cyan-400/60",
    isComingSoon: true,
  },
  {
    id: "colors",
    category: "team",
    titlePrefix: "NEON",
    titleHighlight: "SAVAŞLARI",
    gradientText: "from-purple-400 to-pink-500 drop-shadow-[0_0_10px_rgba(168,85,247,0.3)]",
    shadowColor: "rgba(168,85,247,0.3)",
    icon: "dashboard" as const,
    iconColor: "pink" as const,
    descKey: "dashboard.modeColorsDesc",
    bgAccent: "bg-purple-500/20",
    hoverBgAccent: "group-hover:bg-purple-500/40",
    iconAccent: "bg-purple-500/10 border-purple-500/40",
    borderAccent: "hover:border-purple-500/60",
    isComingSoon: true,
  },
  {
    id: "wheel",
    category: "reward",
    titlePrefix: "HENGAME",
    titleHighlight: "ÇARK",
    gradientText: "from-cyber-yellow to-alaz-orange drop-shadow-[0_0_10px_rgba(255,215,0,0.3)]",
    shadowColor: "rgba(255,215,0,0.3)",
    icon: "flame" as const,
    iconColor: "gold" as const,
    descKey: "dashboard.modeWheelDesc",
    bgAccent: "bg-cyber-yellow/20",
    hoverBgAccent: "group-hover:bg-cyber-yellow/40",
    iconAccent: "bg-cyber-yellow/10 border-cyber-yellow/40",
    borderAccent: "hover:border-cyber-yellow/60",
    isComingSoon: true,
  },
  {
    id: "vault",
    category: "knowledge",
    titlePrefix: "NEON",
    titleHighlight: "ŞİFRE",
    gradientText: "from-emerald-400 to-teal-500 drop-shadow-[0_0_10px_rgba(168,85,247,0.3)]",
    shadowColor: "rgba(16,185,129,0.3)",
    icon: "flame" as const,
    iconColor: "green" as const,
    descKey: "dashboard.modeVaultDesc",
    bgAccent: "bg-emerald-500/20",
    hoverBgAccent: "group-hover:bg-emerald-500/40",
    iconAccent: "bg-emerald-500/10 border-emerald-500/40",
    borderAccent: "hover:border-emerald-500/60",
    isComingSoon: true,
  },
  {
    id: "unity",
    category: "team",
    titlePrefix: "NEON",
    titleHighlight: "BİRLİK",
    gradientText: "from-amber-400 to-orange-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]",
    shadowColor: "rgba(245,158,11,0.3)",
    icon: "flame" as const,
    iconColor: "orange" as const,
    descKey: "dashboard.modeUnityDesc",
    bgAccent: "bg-amber-500/20",
    hoverBgAccent: "group-hover:bg-amber-500/40",
    iconAccent: "bg-amber-500/10 border-amber-500/40",
    borderAccent: "hover:border-amber-500/60",
    isComingSoon: true,
  },
  {
    id: "echo",
    category: "social",
    titlePrefix: "HENGAME",
    titleHighlight: "ECHO",
    gradientText: "from-indigo-400 to-violet-500 drop-shadow-[0_0_10px_rgba(99,102,241,0.3)]",
    shadowColor: "rgba(99,102,241,0.3)",
    icon: "users",
    iconColor: "blue",
    descKey: "dashboard.modeEchoDesc",
    bgAccent: "bg-indigo-500/20",
    hoverBgAccent: "group-hover:bg-indigo-500/40",
    iconAccent: "bg-indigo-500/10 border-indigo-500/40",
    borderAccent: "hover:border-indigo-500/60",
    isComingSoon: true,
  },
  {
    id: "pulse",
    category: "team",
    titlePrefix: "NEON",
    titleHighlight: "PULSE",
    gradientText: "from-neon-blue to-cyan-300 drop-shadow-[0_0_10px_rgba(0,243,255,0.3)]",
    shadowColor: "rgba(0,243,255,0.3)",
    icon: "dashboard",
    iconColor: "blue",
    descKey: "dashboard.modePulseDesc",
    bgAccent: "bg-neon-blue/20",
    hoverBgAccent: "group-hover:bg-neon-blue/40",
    iconAccent: "bg-neon-blue/10 border-neon-blue/40",
    borderAccent: "hover:border-neon-blue/60",
    isComingSoon: true,
  },
  {
    id: "bar",
    category: "reflex",
    titlePrefix: "NEON",
    titleHighlight: "BAR",
    gradientText: "from-pink-400 to-fuchsia-500 drop-shadow-[0_0_10px_rgba(236,72,153,0.3)]",
    shadowColor: "rgba(236,72,153,0.3)",
    icon: "crown",
    iconColor: "pink",
    descKey: "dashboard.modeBarDesc",
    bgAccent: "bg-pink-500/20",
    hoverBgAccent: "group-hover:bg-pink-500/40",
    iconAccent: "bg-pink-500/10 border-pink-500/40",
    borderAccent: "hover:border-pink-500/60",
    isComingSoon: true,
  },
  {
    id: "kablo",
    category: "team",
    titlePrefix: "NEON",
    titleHighlight: "KABLO",
    gradientText: "from-yellow-400 to-amber-500 drop-shadow-[0_0_10px_rgba(245,158,11,0.3)]",
    shadowColor: "rgba(245,158,11,0.3)",
    icon: "flame",
    iconColor: "gold",
    descKey: "dashboard.modeKabloDesc",
    bgAccent: "bg-yellow-500/20",
    hoverBgAccent: "group-hover:bg-yellow-500/40",
    iconAccent: "bg-yellow-500/10 border-yellow-500/40",
    borderAccent: "hover:border-yellow-500/60",
    isComingSoon: true,
  },
  {
    id: "ayna",
    category: "social",
    titlePrefix: "HENGAME",
    titleHighlight: "AYNA",
    gradientText: "from-cyan-300 via-sky-300 to-violet-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.35)]",
    shadowColor: "rgba(34,211,238,0.35)",
    icon: "lightbulb",
    iconColor: "blue",
    descKey: "dashboard.modeAynaDesc",
    bgAccent: "bg-cyan-400/20",
    hoverBgAccent: "group-hover:bg-cyan-400/40",
    iconAccent: "bg-cyan-400/10 border-cyan-300/40",
    borderAccent: "hover:border-cyan-300/60",
    isComingSoon: true,
  },
  {
    id: "sniper",
    category: "reflex",
    titlePrefix: "SİBER",
    titleHighlight: "NİŞANCI",
    gradientText: "from-cyan-400 via-sky-400 to-blue-500 drop-shadow-[0_0_10px_rgba(0,243,255,0.4)]",
    shadowColor: "rgba(0,243,255,0.4)",
    icon: "target",
    iconColor: "blue",
    descKey: "dashboard.modeSniperDesc",
    bgAccent: "bg-cyan-500/20",
    hoverBgAccent: "group-hover:bg-cyan-500/40",
    iconAccent: "bg-cyan-500/10 border-cyan-400/40",
    borderAccent: "hover:border-cyan-400/60",
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
    isComingSoon: false,
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

/** Oyunun görünen adı ("NEON PULSE"); katalogda yoksa boş dize. */
export function gameTitle(id: GameType | null | undefined): string {
  const card = GAME_CARDS.find((c) => c.id === id);
  return card ? `${card.titlePrefix} ${card.titleHighlight}` : "";
}
