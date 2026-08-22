import type { LeagueTier } from "../types/database";

export interface LeagueInfo {
  tier: LeagueTier;
  title: string;
  minScore: number;
  badge: string;
  color: string;
  glowColor: string;
  bgGradient: string;
}

export const LEAGUE_TIERS: LeagueInfo[] = [
  {
    tier: "BRONZE",
    title: "Bronz Lig",
    minScore: 0,
    badge: "🥉",
    color: "#cd7f32",
    glowColor: "rgba(205, 127, 50, 0.4)",
    bgGradient: "from-amber-950/40 to-black",
  },
  {
    tier: "SILVER",
    title: "Gümüş Lig",
    minScore: 1000,
    badge: "🥈",
    color: "#c0c0c0",
    glowColor: "rgba(192, 192, 192, 0.4)",
    bgGradient: "from-slate-800/40 to-black",
  },
  {
    tier: "GOLD",
    title: "Altın Lig",
    minScore: 3000,
    badge: "🥇",
    color: "#ffd700",
    glowColor: "rgba(255, 215, 0, 0.5)",
    bgGradient: "from-yellow-950/40 to-black",
  },
  {
    tier: "PLATINUM",
    title: "Platin Lig",
    minScore: 5000,
    badge: "💎",
    color: "#00f0ff",
    glowColor: "rgba(0, 240, 255, 0.6)",
    bgGradient: "from-cyan-950/40 to-black",
  },
  {
    tier: "NEON",
    title: "Hegame Neon",
    minScore: 8000,
    badge: "⚡",
    color: "#ff0077",
    glowColor: "rgba(255, 0, 119, 0.7)",
    bgGradient: "from-fuchsia-950/40 to-black",
  },
  {
    tier: "LEGEND",
    title: "Hegame Titan",
    minScore: 12000,
    badge: "👑",
    color: "#ff5500",
    glowColor: "rgba(255, 85, 0, 0.8)",
    bgGradient: "from-orange-950/50 to-black",
  },
];

/**
 * Toplam skordan lig kademesini hesaplar
 */
export function getLeagueFromScore(score: number): LeagueInfo {
  for (let i = LEAGUE_TIERS.length - 1; i >= 0; i--) {
    if (score >= LEAGUE_TIERS[i].minScore) {
      return LEAGUE_TIERS[i];
    }
  }
  return LEAGUE_TIERS[0];
}

/**
 * Bir sonraki lige geçiş için gereken puanı ve ilerleme yüzdesini döner
 */
export function getNextLeagueProgress(score: number): {
  current: LeagueInfo;
  next: LeagueInfo | null;
  progressPercent: number;
  pointsNeeded: number;
} {
  const current = getLeagueFromScore(score);
  const currentIndex = LEAGUE_TIERS.findIndex((l) => l.tier === current.tier);
  const next = currentIndex < LEAGUE_TIERS.length - 1 ? LEAGUE_TIERS[currentIndex + 1] : null;

  if (!next) {
    return {
      current,
      next: null,
      progressPercent: 100,
      pointsNeeded: 0,
    };
  }

  const range = next.minScore - current.minScore;
  const currentProgress = Math.max(0, score - current.minScore);
  const progressPercent = Math.min(100, Math.floor((currentProgress / range) * 100));
  const pointsNeeded = Math.max(0, next.minScore - score);

  return {
    current,
    next,
    progressPercent,
    pointsNeeded,
  };
}
