import { memo } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { RaceShape } from "../../../components/race/RaceGlyph";
import { gameTitle } from "../../../lib/gameCatalog";
import { RACE_FINISH, RACE_LANE, RACE_PAWNS, RACE_RING, gateCell, type RacePawns, type RaceTeamId } from "../../../lib/race";
import {
  BOARD_VIEW,
  CORE_RADIUS,
  RING_RADIUS,
  STARS,
  basePoint,
  cellPoint,
  lanePoint,
  novaPath,
  pawnPoint,
  type Point,
} from "../../../lib/raceLayout";

const PAWN_RADIUS = 31;
const CELL_DOT = 27;
const TRACK_WIDTH = 86;
/** Bir karelik adımın süresi (sn). TV oynatıcısındaki adım aralığından kısa olmalı. */
export const PAWN_STEP_SEC = 0.14;
/** Üsse dönen piyonun uçuşu: oyunun tek "wow" hareketi. */
export const PAWN_HOME_SEC = 0.6;

export interface BoardTrail {
  team: RaceTeamId;
  pawn: number;
  from: number;
  to: number;
}

interface HostRaceBoardProps {
  teams: readonly RaceTeamId[];
  pawns: RacePawns;
  /** O an oynayan takım (vurgu rengi yalnız onda). */
  activeTeam: RaceTeamId | null;
  /** Oynanan hamlenin yolu: geçilecek kareler ve varış işaretlenir. */
  trail?: BoardTrail | null;
  /** Üsse gönderilmekte olan piyonlar: uzun uçuşla döner. */
  returning?: readonly { team: RaceTeamId; pawn: number }[];
  /** Yakalama anı: bu noktada tek seferlik halka patlaması. */
  burst?: { key: string; at: Point } | null;
}

/** Değişmeyen zemin: gök, yıldızlar, yörünge bandı. Piyonlar oynarken yeniden çizilmez. */
const Backdrop = memo(function Backdrop() {
  const half = BOARD_VIEW / 2;
  return (
    <g>
      <defs>
        <radialGradient id="race-sky" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--color-surface-2)" />
          <stop offset="62%" stopColor="var(--color-surface)" />
          <stop offset="100%" stopColor="var(--color-bg)" />
        </radialGradient>
        <radialGradient id="race-core" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.38" />
          <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0.06" />
        </radialGradient>
      </defs>
      <circle r={half} fill="url(#race-sky)" />
      {STARS.map((s, i) => (
        <circle key={i} cx={s.x} cy={s.y} r={s.r} className="fill-ink" opacity={s.o} />
      ))}
      {/* Yörünge bandı ve ince kenar çizgileri */}
      <circle r={RING_RADIUS} className="fill-none stroke-bg" strokeWidth={TRACK_WIDTH} opacity={0.72} />
      <circle r={RING_RADIUS + TRACK_WIDTH / 2} className="fill-none stroke-line" strokeWidth={2} />
      <circle r={RING_RADIUS - TRACK_WIDTH / 2} className="fill-none stroke-line" strokeWidth={2} />
    </g>
  );
});

const SPARKS = Array.from({ length: 8 }, (_, i) => ({ cos: Math.cos((i * Math.PI) / 4), sin: Math.sin((i * Math.PI) / 4) }));

/**
 * NOVA tahtası: 24 kareli yörünge, her takımın kapısı, iniş yolu ve yıldız
 * biçimli çekirdek. Düz SVG (filtre/bulanıklık yok); yalnız piyonlar hareket
 * eder (transform), her biri kendi katmanında.
 */
export function HostRaceBoard({ teams, pawns, activeTeam, trail = null, returning = [], burst = null }: HostRaceBoardProps) {
  const half = BOARD_VIEW / 2;
  const gates = new Map(teams.map((t) => [gateCell(t), t]));
  const trailSteps = trail ? Array.from({ length: Math.max(0, trail.to - trail.from) }, (_, i) => trail.from + i + 1) : [];

  return (
    <svg
      viewBox={`${-half} ${-half} ${BOARD_VIEW} ${BOARD_VIEW}`}
      className="h-full w-full"
      role="img"
      aria-label={gameTitle("race")}
      data-testid="race-board"
    >
      <Backdrop />

      {/* İniş yolları ve üsler */}
      {teams.map((team) => {
        const active = team === activeTeam;
        const start = cellPoint((gateCell(team) + RACE_RING - 1) % RACE_RING);
        const end = lanePoint(team, RACE_LANE);
        const tone = active ? "fill-bg stroke-accent" : "fill-bg stroke-ink-3";
        return (
          <g key={team}>
            <line
              x1={start.x}
              y1={start.y}
              x2={end.x * 0.78}
              y2={end.y * 0.78}
              className={active ? "stroke-accent" : "stroke-ink-3"}
              strokeWidth={3}
              strokeDasharray="4 12"
              strokeLinecap="round"
              opacity={active ? 0.9 : 0.5}
            />
            {Array.from({ length: RACE_LANE }, (_, i) => {
              const p = lanePoint(team, i + 1);
              return <circle key={i} cx={p.x} cy={p.y} r={CELL_DOT} className={tone} strokeWidth={2.5} />;
            })}
            {Array.from({ length: RACE_PAWNS }, (_, i) => {
              const p = basePoint(team, i);
              return <circle key={i} cx={p.x} cy={p.y} r={PAWN_RADIUS + 7} className={tone} strokeWidth={2} strokeDasharray="3 7" opacity={0.85} />;
            })}
          </g>
        );
      })}

      {/* Halka kareleri */}
      {Array.from({ length: RACE_RING }, (_, cell) => {
        const p = cellPoint(cell);
        const gate = gates.get(cell);
        if (!gate) return <circle key={cell} cx={p.x} cy={p.y} r={CELL_DOT} className="fill-surface-2 stroke-line" strokeWidth={2} />;
        const active = gate === activeTeam;
        return (
          <g key={cell} transform={`translate(${p.x} ${p.y})`}>
            <circle r={CELL_DOT + 9} className={active ? "fill-bg stroke-accent" : "fill-bg stroke-ink-2"} strokeWidth={4} />
            <RaceShape team={gate} r={15} className={active ? "fill-accent" : "fill-ink-3"} />
          </g>
        );
      })}

      {/* Çekirdek: sekiz köşeli yıldız */}
      <path d={novaPath(CORE_RADIUS + 44, CORE_RADIUS - 6)} fill="url(#race-core)" className="stroke-accent" strokeWidth={3} strokeLinejoin="round" />
      <circle r={CORE_RADIUS - 14} className="fill-bg stroke-accent" strokeWidth={2} opacity={0.9} />

      {/* Hamle izi: geçilecek kareler küçük nokta, varış halka */}
      {trail &&
        trailSteps.map((progress) => {
          if (progress >= RACE_FINISH) return null;
          const p = pawnPoint(trail.team, trail.pawn, progress);
          return progress === trail.to ? (
            <circle key={progress} cx={p.x} cy={p.y} r={CELL_DOT + 12} className="fill-none stroke-accent" strokeWidth={5} />
          ) : (
            <circle key={progress} cx={p.x} cy={p.y} r={8} className="fill-accent" opacity={0.85} />
          );
        })}

      {/* Yakalama patlaması: tek seferlik halka ve kıvılcımlar */}
      <AnimatePresence>
        {burst && (
          <motion.g key={burst.key} transform={`translate(${burst.at.x} ${burst.at.y})`} exit={{ opacity: 0 }}>
            <motion.circle
              className="fill-none stroke-accent"
              initial={{ r: 30, opacity: 0.95, strokeWidth: 14 }}
              animate={{ r: 170, opacity: 0, strokeWidth: 2 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            />
            {SPARKS.map((s, i) => (
              <motion.line
                key={i}
                className="stroke-accent"
                strokeWidth={6}
                strokeLinecap="round"
                initial={{ x1: s.cos * 44, y1: s.sin * 44, x2: s.cos * 60, y2: s.sin * 60, opacity: 1 }}
                animate={{ x1: s.cos * 96, y1: s.sin * 96, x2: s.cos * 132, y2: s.sin * 132, opacity: 0 }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              />
            ))}
          </motion.g>
        )}
      </AnimatePresence>

      {/* Piyonlar: oynayan takım en üstte çizilir. */}
      {[...teams]
        .sort((a, b) => Number(a === activeTeam) - Number(b === activeTeam))
        .flatMap((team) =>
          (pawns[team] ?? []).map((progress, pawn) => {
            const p = pawnPoint(team, pawn, progress);
            const active = team === activeTeam;
            const moving = trail?.team === team && trail.pawn === pawn;
            const flyingHome = returning.some((r) => r.team === team && r.pawn === pawn);
            return (
              <motion.g
                key={`${team}-${pawn}`}
                data-testid={`race-pawn-${team}-${pawn}`}
                data-progress={progress}
                initial={false}
                animate={{ x: p.x, y: p.y, scale: moving ? 1.18 : 1 }}
                transition={{ duration: flyingHome ? PAWN_HOME_SEC : PAWN_STEP_SEC, ease: flyingHome ? [0.2, 0, 0, 1] : "linear" }}
                style={{ willChange: "transform" }}
              >
                {/* Düz gölge: piyonu zeminden ayırır (bulanıklık yok). */}
                <g transform="translate(0 7)" opacity={0.55}>
                  <RaceShape team={team} r={PAWN_RADIUS} className="fill-bg" />
                </g>
                <RaceShape team={team} r={PAWN_RADIUS} className={active ? "fill-accent stroke-bg" : "fill-ink stroke-bg"} strokeWidth={3} />
                <text y={team === "fire" ? 15 : 11} textAnchor="middle" fontSize={32} fontWeight={800} className="fill-bg tabular-nums">
                  {pawn + 1}
                </text>
              </motion.g>
            );
          }),
        )}
    </svg>
  );
}
