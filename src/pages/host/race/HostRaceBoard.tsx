import { motion } from "framer-motion";

import { gameTitle } from "../../../lib/gameCatalog";
import { RaceShape } from "../../../components/race/RaceGlyph";
import { RACE_LANE, RACE_PAWNS, RACE_RING, gateCell, type RacePawns, type RaceTeamId } from "../../../lib/race";
import {
  BOARD_VIEW,
  CELL_RADIUS,
  CORE_RADIUS,
  basePoint,
  cellPoint,
  lanePoint,
  pawnPoint,
} from "../../../lib/raceLayout";

const PAWN_RADIUS = 30;
/** Bir karelik adımın süresi (sn). TV oynatıcısındaki adım aralığından kısa olmalı. */
export const PAWN_STEP_SEC = 0.14;
/** Üsse dönen piyonun uçuşu: oyunun tek "wow" hareketi. */
export const PAWN_HOME_SEC = 0.6;

interface HostRaceBoardProps {
  teams: readonly RaceTeamId[];
  pawns: RacePawns;
  /** O an oynayan takım (vurgu rengi yalnız onda). */
  activeTeam: RaceTeamId | null;
  /** Üsse gönderilmekte olan piyonlar: uzun uçuşla döner. */
  returning?: readonly { team: RaceTeamId; pawn: number }[];
}

/**
 * NOVA tahtası: 24 kareli halka, her takımın kapısı, iniş yolu ve çekirdek.
 * Düz SVG; yalnız piyonlar hareket eder (transform), her biri kendi katmanında.
 */
export function HostRaceBoard({ teams, pawns, activeTeam, returning = [] }: HostRaceBoardProps) {
  const half = BOARD_VIEW / 2;
  const gates = new Map(teams.map((t) => [gateCell(t), t]));

  return (
    <svg
      viewBox={`${-half} ${-half} ${BOARD_VIEW} ${BOARD_VIEW}`}
      className="h-full w-full"
      role="img"
      aria-label={gameTitle("race")}
      data-testid="race-board"
    >
      {/* Halka */}
      {Array.from({ length: RACE_RING }, (_, cell) => {
        const p = cellPoint(cell);
        const gate = gates.get(cell);
        return (
          <g key={cell} transform={`translate(${p.x} ${p.y})`}>
            <circle
              r={CELL_RADIUS}
              className={gate ? (gate === activeTeam ? "fill-surface-2 stroke-accent" : "fill-surface-2 stroke-ink-3") : "fill-surface stroke-ink-3/50"}
              strokeWidth={gate ? 4 : 2}
            />
            {gate && <RaceShape team={gate} r={13} className={gate === activeTeam ? "fill-accent/40" : "fill-ink-3/50"} />}
          </g>
        );
      })}

      {/* İniş yolları ve üsler */}
      {teams.map((team) => (
        <g key={team}>
          {Array.from({ length: RACE_LANE }, (_, i) => {
            const p = lanePoint(team, i + 1);
            return <circle key={i} cx={p.x} cy={p.y} r={CELL_RADIUS - 6} className="fill-surface stroke-ink-3" strokeWidth={2} strokeDasharray="6 8" />;
          })}
          {Array.from({ length: RACE_PAWNS }, (_, i) => {
            const p = basePoint(team, i);
            return <circle key={i} cx={p.x} cy={p.y} r={PAWN_RADIUS + 6} className="fill-none stroke-line" strokeWidth={2} />;
          })}
        </g>
      ))}

      {/* Çekirdek */}
      <circle r={CORE_RADIUS} className="fill-surface-2 stroke-accent" strokeWidth={4} />

      {/* Piyonlar: oynayan takım en üstte çizilir. */}
      {[...teams]
        .sort((a, b) => Number(a === activeTeam) - Number(b === activeTeam))
        .flatMap((team) =>
          (pawns[team] ?? []).map((progress, pawn) => {
            const p = pawnPoint(team, pawn, progress);
            const active = team === activeTeam;
            const flyingHome = returning.some((r) => r.team === team && r.pawn === pawn);
            return (
              <motion.g
                key={`${team}-${pawn}`}
                data-testid={`race-pawn-${team}-${pawn}`}
                data-progress={progress}
                initial={false}
                animate={{ x: p.x, y: p.y }}
                transition={{ duration: flyingHome ? PAWN_HOME_SEC : PAWN_STEP_SEC, ease: flyingHome ? [0.2, 0, 0, 1] : "linear" }}
                style={{ willChange: "transform" }}
              >
                <RaceShape team={team} r={PAWN_RADIUS} className={active ? "fill-accent stroke-bg" : "fill-ink stroke-bg"} strokeWidth={3} />
                <text
                  y={team === "fire" ? 15 : 11}
                  textAnchor="middle"
                  fontSize={32}
                  fontWeight={800}
                  className="fill-bg tabular-nums"
                >
                  {pawn + 1}
                </text>
              </motion.g>
            );
          }),
        )}
    </svg>
  );
}
