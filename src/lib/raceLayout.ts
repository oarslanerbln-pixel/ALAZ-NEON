/**
 * NOVA tahtasının çizim koordinatları (bkz. docs/yaris-oyunu.md §2).
 *
 * Saf geometri: tahta bir çember, merkez (0,0). Çizim birimi SVG kullanıcı
 * birimi; `BOARD_VIEW` kadar bir kare viewBox'a sığar.
 */
import { RACE_FINISH, RACE_LANE, RACE_RING, RACE_TEAM_IDS, gateCell, ringCell, type RaceTeamId } from "./race";

export interface Point {
  x: number;
  y: number;
}

export const BOARD_VIEW = 1100;
export const RING_RADIUS = 400;
export const CELL_RADIUS = 36;
export const CORE_RADIUS = 112;
const BASE_RADIUS = 496;
const LANE_STEP = 96;
const CORE_SLOT_RADIUS = 76;

function polar(radius: number, degrees: number): Point {
  const rad = (degrees * Math.PI) / 180;
  return { x: Math.round(radius * Math.cos(rad) * 10) / 10, y: Math.round(radius * Math.sin(rad) * 10) / 10 };
}

/** Halka karesinin açısı: 0. kare tepede, saat yönünde. */
export function cellAngle(cell: number): number {
  return -90 + (cell * 360) / RACE_RING;
}

export function cellPoint(cell: number): Point {
  return polar(RING_RADIUS, cellAngle(cell));
}

/** İniş yolu, takımın halkadaki son karesinden (kapıdan önceki) merkeze iner. */
function laneAngle(team: RaceTeamId): number {
  return cellAngle((gateCell(team) + RACE_RING - 1) % RACE_RING);
}

/** `step` 1…RACE_LANE. */
export function lanePoint(team: RaceTeamId, step: number): Point {
  return polar(RING_RADIUS - step * LANE_STEP, laneAngle(team));
}

/** Üsteki piyonun yeri: kapının dışında, iki piyon yan yana. */
export function basePoint(team: RaceTeamId, pawn: number): Point {
  return polar(BASE_RADIUS, cellAngle(gateCell(team)) + (pawn === 0 ? -7 : 7));
}

/** Çekirdekteki piyonun yeri: takımın çeyreğinde, iki piyon yan yana. */
export function corePoint(team: RaceTeamId, pawn: number): Point {
  const quarter = (RACE_TEAM_IDS.indexOf(team) * 360) / RACE_TEAM_IDS.length;
  return polar(CORE_SLOT_RADIUS, -90 + quarter + (pawn === 0 ? -34 : 34));
}

/** Piyonun tahtadaki yeri (ilerlemeye göre). */
export function pawnPoint(team: RaceTeamId, pawn: number, progress: number): Point {
  if (progress <= 0) return basePoint(team, pawn);
  if (progress >= RACE_FINISH) return corePoint(team, pawn);
  const cell = ringCell(team, progress);
  if (cell !== null) return cellPoint(cell);
  return lanePoint(team, Math.min(RACE_LANE, progress - RACE_RING));
}

/** Çekirdeğin sekiz köşeli yıldız yolu (SVG `d`); bir köşe tepede. */
export function novaPath(outer: number, inner: number, points = 8): string {
  const parts: string[] = [];
  for (let i = 0; i < points * 2; i++) {
    const p = polar(i % 2 === 0 ? outer : inner, -90 + (i * 180) / points);
    parts.push(`${i === 0 ? "M" : "L"}${p.x} ${p.y}`);
  }
  return `${parts.join(" ")} Z`;
}

export interface Star extends Point {
  r: number;
  o: number;
}

/**
 * Zemindeki sabit yıldızlar. Tohumlu üretilir: her cihazda ve her çizimde
 * aynı gökyüzü (rastgelelik render'da değil).
 */
export function starField(count: number, seed = 7): Star[] {
  let s = seed;
  const next = () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
  const limit = BOARD_VIEW / 2 - 12;
  return Array.from({ length: count }, () => {
    const p = polar(Math.sqrt(next()) * limit, next() * 360);
    return { ...p, r: Math.round((0.9 + next() * 1.9) * 10) / 10, o: Math.round((0.18 + next() * 0.5) * 100) / 100 };
  });
}

export const STARS: readonly Star[] = starField(90);
