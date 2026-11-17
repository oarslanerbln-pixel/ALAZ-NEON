import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";

import { RaceDie } from "../../../components/race/RaceDie";
import { RaceGlyph, RaceShape } from "../../../components/race/RaceGlyph";
import { useLocale } from "../../../hooks/useLocale";
import { countdownDeadline, remainingMs } from "../../../lib/countdown";
import { db } from "../../../lib/firebase";
import { gameTitle } from "../../../lib/gameCatalog";
import { haptics } from "../../../lib/haptics";
import {
  RACE_FINISH,
  RACE_MAX_ROUNDS,
  RACE_VOTE_MS,
  capturesAt,
  moveTarget,
  raceRoundKey,
  raceStandings,
  type RaceState,
  type RaceTeamId,
} from "../../../lib/race";
import { retentionExpiry } from "../../../lib/retention";
import { PlayerStageScreen } from "../components/PlayerStageScreen";
import type { PlayerGameProps } from "../gameControllers";

const TEAM_KEY = {
  fire: "race.team.fire",
  earth: "race.team.earth",
  air: "race.team.air",
  water: "race.team.water",
} as const;

/** Kalan oylama süresi: telefonun kendi saatiyle (bkz. lib/countdown). */
function VoteTimer({ endsAt, live }: { endsAt: number; live: boolean }) {
  const [remaining] = useState(() => {
    const now = Date.now();
    return remainingMs(countdownDeadline({ mountedAt: now, durationMs: RACE_VOTE_MS, roundEndTime: endsAt, live }), now, RACE_VOTE_MS);
  });
  return (
    <div className="h-2 rounded-full bg-surface-2 overflow-hidden" aria-hidden="true">
      <motion.div
        className="h-full w-full origin-left rounded-full bg-accent"
        initial={{ scaleX: remaining / RACE_VOTE_MS }}
        animate={{ scaleX: 0 }}
        transition={{ duration: remaining / 1000, ease: "linear" }}
      />
    </div>
  );
}

function TeamBadge({ team, label }: { team: RaceTeamId; label: string }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-surface border border-line px-4 py-2 text-base font-semibold text-ink">
      <RaceGlyph team={team} size={20} active />
      {label}
    </span>
  );
}

export function PlayerRaceController({ room, player }: PlayerGameProps) {
  const { t } = useLocale();
  const race: RaceState | null = room.race ?? null;
  const status = room.status;
  const team = race?.members[player.id] ?? null;
  const roundKey = race ? raceRoundKey(race.game_id, race.round) : "";
  const title = gameTitle("race");

  const [votedKey, setVotedKey] = useState("");
  // İlk render'da gördüğümüz tur ortasından yakalanmış olabilir; sonrakiler canlı.
  const [firstKey] = useState(roundKey);

  useEffect(() => {
    if (status === "race_vote" && team) haptics.tap();
  }, [status, roundKey, team]);

  const vote = (pawn: number) => {
    if (!race || status !== "race_vote" || votedKey === roundKey) return;
    setVotedKey(roundKey);
    // Belge kimliği sabit: aynı tura ikinci oy "güncelleme" olur ve kural reddeder.
    setDoc(doc(db, "answers", `${room.id}_${player.id}_${roundKey}`), {
      room_id: room.id,
      player_id: player.id,
      round_letter: roundKey,
      round_index: race.round,
      data: { type: "race_vote", pawn: String(pawn) },
      created_at: serverTimestamp(),
      expires_at: retentionExpiry(),
    }).catch((err) => console.warn("[PlayerRace] Oy gönderilemedi:", err));
  };

  let screen;
  if (status === "race_finished" && race) {
    const standings = raceStandings(race.pawns, race.teams);
    const mine = standings.find((s) => s.team === team);
    const won = team !== null && race.winners.includes(team);
    screen = (
      <PlayerStageScreen
        icon={won ? "🏆" : "🏁"}
        eyebrow={title}
        title={won ? t("race.youWon") : t("race.youLost")}
        body={mine ? t("race.yourRank", mine.rank, standings.length) : undefined}
        hint={t("common.followMainScreen")}
      >
        {team && <TeamBadge team={team} label={t(TEAM_KEY[team])} />}
      </PlayerStageScreen>
    );
  } else if (!race || (status !== "race_vote" && status !== "race_move")) {
    screen = <PlayerStageScreen icon="🎲" eyebrow={title} title={t("race.getReady")} body={t("race.introStep2")} waiting />;
  } else if (!team) {
    screen = <PlayerStageScreen icon="⏳" eyebrow={title} title={t("race.joinNext")} waiting />;
  } else if (status === "race_move") {
    screen = (
      <PlayerStageScreen icon="💫" eyebrow={t("race.round", race.round, RACE_MAX_ROUNDS)} title={t("race.watchMoves")} waiting>
        <TeamBadge team={team} label={t(TEAM_KEY[team])} />
      </PlayerStageScreen>
    );
  } else {
    const roll = race.dice[team] ?? 0;
    const own = race.pawns[team] ?? [];
    const options = own.map((progress, pawn) => {
      const to = moveTarget(race.pawns, team, pawn, roll);
      const hint =
        to === null
          ? t("race.hintBlocked")
          : to >= RACE_FINISH
            ? t("race.hintCore")
            : capturesAt(race.pawns, team, to).length > 0
              ? t("race.hintCapture")
              : null;
      const where = progress <= 0 ? t("race.atBase") : progress >= RACE_FINISH ? t("race.inCore") : t("race.onRing", progress, RACE_FINISH);
      return { pawn, to, hint, where, progress };
    });
    const canMove = options.some((o) => o.to !== null);

    if (!canMove) {
      screen = (
        <PlayerStageScreen icon="🎲" eyebrow={title} title={t("race.noMove")} body={t("race.noMoveBody")} waiting>
          <TeamBadge team={team} label={t(TEAM_KEY[team])} />
        </PlayerStageScreen>
      );
    } else if (votedKey === roundKey) {
      screen = (
        <PlayerStageScreen icon="✅" eyebrow={title} title={t("race.voted")} body={t("race.votedBody")} waiting>
          <TeamBadge team={team} label={t(TEAM_KEY[team])} />
        </PlayerStageScreen>
      );
    } else {
      screen = (
        <div className="flex-1 flex flex-col gap-5 px-5 py-6" data-testid="race-vote">
          <VoteTimer key={roundKey} endsAt={race.vote_ends_at} live={roundKey !== firstKey} />
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-ink-2">{t("race.yourTeam")}</p>
              <p className="flex items-center gap-2 text-2xl font-extrabold text-ink">
                <RaceGlyph team={team} size={28} active />
                <span className="truncate">{t(TEAM_KEY[team])}</span>
              </p>
            </div>
            <RaceDie key={roundKey} value={roll} size={72} active label={`${t("race.yourDie")}: ${roll}`} />
          </div>

          <h1 className="text-2xl font-extrabold text-ink">{t("race.pickPawn")}</h1>

          <div className="flex-1 flex flex-col gap-4">
            {options.map((o) => (
              <button
                key={o.pawn}
                type="button"
                data-testid={`race-pawn-${o.pawn}`}
                disabled={o.to === null}
                onClick={() => vote(o.pawn)}
                className="flex-1 min-h-28 rounded-3xl border-2 border-line bg-surface px-6 py-5 text-left transition-colors duration-150 active:border-accent active:bg-surface-2 disabled:opacity-40"
              >
                <span className="flex items-center gap-4">
                  <svg width={64} height={64} viewBox="-34 -34 68 68" aria-hidden="true" className="shrink-0">
                    <RaceShape team={team} r={30} className={o.to === null ? "fill-ink-3" : "fill-accent"} />
                    <text y={team === "fire" ? 15 : 11} textAnchor="middle" fontSize={30} fontWeight={800} className="fill-bg">
                      {o.pawn + 1}
                    </text>
                  </svg>
                  <span className="min-w-0 flex-1">
                    <span className="block text-2xl font-extrabold text-ink">{t("race.pawn", o.pawn + 1)}</span>
                    <span className="block text-base text-ink-2 tabular-nums">{o.where}</span>
                    {o.hint && (
                      <span className={`block text-base font-semibold ${o.to === null ? "text-ink-3" : "text-accent"}`}>{o.hint}</span>
                    )}
                  </span>
                </span>
                {/* Yol çubuğu: dolu kısım şimdiki yer, soluk kısım bu zarla varılacak yer. */}
                <span className="relative mt-4 block h-2 overflow-hidden rounded-full bg-surface-2" aria-hidden="true">
                  {o.to !== null && (
                    <span className="absolute inset-y-0 left-0 rounded-full bg-accent/40" style={{ width: `${(o.to / RACE_FINISH) * 100}%` }} />
                  )}
                  <span className="absolute inset-y-0 left-0 rounded-full bg-accent" style={{ width: `${(Math.min(o.progress, RACE_FINISH) / RACE_FINISH) * 100}%` }} />
                </span>
              </button>
            ))}
          </div>
        </div>
      );
    }
  }

  return <div className="flex min-h-[100dvh] flex-col bg-bg text-ink">{screen}</div>;
}

