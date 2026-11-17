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
const CORE_SLOT_RADIUS = 62;

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
  return polar(BASE_RADIUS, cellAngle(gateCell(team)) + (pawn === 0 ? -5 : 5));
}

/** Çekirdekteki piyonun yeri: takımın çeyreğinde, iki piyon yan yana. */
export function corePoint(team: RaceTeamId, pawn: number): Point {
  const quarter = (RACE_TEAM_IDS.indexOf(team) * 360) / RACE_TEAM_IDS.length;
  return polar(CORE_SLOT_RADIUS, -90 + quarter + (pawn === 0 ? -24 : 24));
}

/** Piyonun tahtadaki yeri (ilerlemeye göre). */
export function pawnPoint(team: RaceTeamId, pawn: number, progress: number): Point {
  if (progress <= 0) return basePoint(team, pawn);
  if (progress >= RACE_FINISH) return corePoint(team, pawn);
  const cell = ringCell(team, progress);
  if (cell !== null) return cellPoint(cell);
  return lanePoint(team, Math.min(RACE_LANE, progress - RACE_RING));
}
