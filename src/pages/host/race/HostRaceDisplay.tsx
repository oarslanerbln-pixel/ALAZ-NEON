import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { collection, onSnapshot, query, where } from "firebase/firestore";

import { ConfettiCanvas } from "../../../components/ConfettiCanvas";
import { RaceDie } from "../../../components/race/RaceDie";
import { RaceGlyph } from "../../../components/race/RaceGlyph";
import { TVScaleFrame } from "../../../components/TVScaleFrame";
import { useLocale } from "../../../hooks/useLocale";
import { SoundManager, sounds } from "../../../lib/audio";
import { db } from "../../../lib/firebase";
import { GAME_CARDS, gameTitle } from "../../../lib/gameCatalog";
import { DURATION, EASE } from "../../../lib/motion";
import { finishNightRound, NIGHT_ROUND_OPEN } from "../../../lib/nightAwards";
import { pawnPoint } from "../../../lib/raceLayout";
import { teamPoints } from "../../../lib/nightLeague";
import {
  RACE_FINISH,
  RACE_MAX_ROUNDS,
  RACE_PAWNS,
  RACE_VOTE_MS,
  assignRaceTeams,
  homeCount,
  initialPawns,
  leadingTeams,
  legalPawns,
  parsePawnVote,
  raceRoundKey,
  raceStandings,
  resolveRound,
  rollDice,
  withLateJoiners,
  type RaceCapture,
  type RaceMove,
  type RacePawns,
  type RaceState,
  type RaceTeamId,
} from "../../../lib/race";
import { GameIntroCinematic } from "../components/GameIntroCinematic";
import { HostHeader } from "../components/HostHeader";
import type { HostGameProps } from "../gameDisplays";
import { HostRaceBoard, PAWN_HOME_SEC } from "./HostRaceBoard";

/** TV oynatma temposu (ms). Tur süresi bunlarla belirlenir; E2E'de ölçülür. */
const PACE = {
  /** Zarlar en az bu kadar görünür (herkes hemen oy verse bile). */
  minVote: 2500,
  roundStart: 300,
  announce: 650,
  step: 170,
  noMove: 700,
  capture: Math.max(1300, PAWN_HOME_SEC * 1000 + 500),
  core: 900,
  gap: 350,
} as const;

interface Playback {
  pawns: RacePawns;
  move: RaceMove | null;
  banner: string | null;
  returning: readonly RaceCapture[];
}

interface RoundVotes {
  key: string;
  byPlayer: Record<string, number>;
}

/** Takımın iki piyonunun toplam adımı (ilerleme çubuğu için). */
function teamSteps(pawns: RacePawns, team: RaceTeamId): number {
  return (pawns[team] ?? []).reduce((sum, p) => sum + Math.min(p, RACE_FINISH), 0);
}

const RACE_CARD = GAME_CARDS.find((c) => c.id === "race")!;

const TEAM_KEY = {
  fire: "race.team.fire",
  earth: "race.team.earth",
  air: "race.team.air",
  water: "race.team.water",
} as const;

export function HostRaceDisplay({ room, players, updateRoomStatus }: HostGameProps) {
  const { t } = useLocale();
  const race = room.race ?? null;
  const status = room.status;

  const [introDone, setIntroDone] = useState(false);
  const [playback, setPlayback] = useState<Playback | null>(null);
  const [votes, setVotes] = useState<RoundVotes>({ key: "", byPlayer: {} });

  // Zamanlayıcılar ve dinleyiciler her zaman güncel odayı görsün.
  const latest = useRef({ race, players, roomId: room.id });
  useEffect(() => {
    latest.current = { race, players, roomId: room.id };
  });
  const resolvedKey = useRef("");

  const teamName = useCallback((team: RaceTeamId) => t(TEAM_KEY[team]), [t]);

  const startRound = useCallback(
    (base: RaceState, round: number) => {
      const next: RaceState = {
        ...base,
        members: withLateJoiners(base, latest.current.players.map((p) => p.id)),
        round,
        dice: rollDice(base.teams),
        vote_ends_at: Date.now() + RACE_VOTE_MS,
        moves: [],
        before: base.pawns,
      };
      SoundManager.getInstance().playSFX(sounds.CLICK, 0.5);
      return updateRoomStatus("race_vote", { race: next, current_round: round, total_rounds: RACE_MAX_ROUNDS });
    },
    [updateRoomStatus],
  );

  const finish = useCallback(
    (final: RaceState) => {
      const winnerIds = Object.keys(final.members).filter((id) => final.winners.includes(final.members[id]));
      // Gece ligi: kazanan takımın her üyesine 10, diğerlerine katılım puanı.
      finishNightRound(latest.current.roomId, teamPoints(winnerIds, Object.keys(final.members)));
      SoundManager.getInstance().playSFX(sounds.FANFARE, 0.8);
      return updateRoomStatus("race_finished", { race: final });
    },
    [updateRoomStatus],
  );

  // Dashboard'dan "lobby" ile açılan odalar için.
  useEffect(() => {
    if (status === "lobby") updateRoomStatus("race_intro", { race: null });
  }, [status, updateRoomStatus]);

  // Açılış bitti ve yeterli oyuncu var: takımları kur, ilk zarları at.
  useEffect(() => {
    if (status !== "race_intro" || race || !introDone || players.length < 2) return;
    const { teams, members } = assignRaceTeams(players.map((p) => p.id));
    const pawns = initialPawns(teams);
    startRound(
      { game_id: Date.now(), teams, members, pawns, round: 0, dice: {}, vote_ends_at: 0, moves: [], before: pawns, winners: [], finished: false },
      1,
    );
  }, [status, race, introDone, players, startRound]);

  const roundKey = race ? raceRoundKey(race.game_id, race.round) : "";

  // Oylar: yalnız host okur (answers kuralı), tur başına tek sorgu.
  useEffect(() => {
    if (status !== "race_vote" || !roundKey) return;
    const q = query(collection(db, "answers"), where("room_id", "==", room.id), where("round_letter", "==", roundKey));
    return onSnapshot(
      q,
      (snap) => {
        const byPlayer: Record<string, number> = {};
        snap.forEach((d) => {
          const a = d.data();
          const pawn = parsePawnVote(a.data);
          if (pawn !== null && typeof a.player_id === "string" && !(a.player_id in byPlayer)) byPlayer[a.player_id] = pawn;
        });
        setVotes({ key: roundKey, byPlayer });
      },
      (err) => console.error("[HostRace] Oylar okunamadı:", err),
    );
  }, [status, roundKey, room.id]);

  const roundVotes = useMemo(() => (votes.key === roundKey ? votes.byPlayer : {}), [votes, roundKey]);

  // Oylama süre dolunca ya da oy verebilecek herkes oy verince kapanır.
  useEffect(() => {
    if (status !== "race_vote" || !race) return;
    const present = new Set(players.map((p) => p.id));
    const eligible = Object.keys(race.members).filter((id) => {
      const team = race.members[id];
      return present.has(id) && legalPawns(race.pawns, team, race.dice[team] ?? 0).length > 0;
    });
    const allVoted = eligible.every((id) => id in roundVotes);
    const opened = race.vote_ends_at - RACE_VOTE_MS;
    const closeAt = allVoted ? Math.min(race.vote_ends_at, opened + PACE.minVote) : race.vote_ends_at;

    const timer = setTimeout(() => {
      if (resolvedKey.current === roundKey) return;
      resolvedKey.current = roundKey;
      const byTeam: Partial<Record<RaceTeamId, number[]>> = {};
      for (const [id, pawn] of Object.entries(roundVotes)) {
        const team = race.members[id];
        if (team) (byTeam[team] ??= []).push(pawn);
      }
      const result = resolveRound(race, byTeam);
      updateRoomStatus("race_move", {
        race: { ...race, before: race.pawns, pawns: result.pawns, moves: result.moves, winners: result.winners, finished: result.finished },
      });
    }, Math.max(0, closeAt - Date.now()));
    return () => clearTimeout(timer);
  }, [status, race, players, roundVotes, roundKey, updateRoomStatus]);

  // Hamleleri sırayla oynat, sonra sıradaki tura (ya da bitişe) geç.
  useEffect(() => {
    if (status !== "race_move" || !roundKey) return;
    const current = latest.current.race;
    if (!current) return;
    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const wait = (ms: number) => new Promise<void>((resolve) => timers.push(setTimeout(resolve, ms)));
    const sfx = SoundManager.getInstance();

    (async () => {
      let pawns = current.before;
      setPlayback({ pawns, move: null, banner: null, returning: [] });
      await wait(PACE.roundStart);
      for (const move of current.moves) {
        if (cancelled) return;
        setPlayback({ pawns, move, banner: move.bonus ? t("race.six") : null, returning: [] });
        await wait(PACE.announce);
        if (cancelled) return;
        if (move.pawn === null) {
          setPlayback({ pawns, move, banner: `${teamName(move.team)}: ${t("race.noMove")}`, returning: [] });
          await wait(PACE.noMove);
          continue;
        }
        for (let progress = move.from + 1; progress <= move.to; progress++) {
          pawns = { ...pawns, [move.team]: (pawns[move.team] ?? []).map((v, i) => (i === move.pawn ? progress : v)) };
          setPlayback({ pawns, move, banner: move.bonus ? t("race.six") : null, returning: [] });
          await wait(PACE.step);
          if (cancelled) return;
        }
        if (move.captured.length > 0) {
          for (const c of move.captured) {
            pawns = { ...pawns, [c.team]: (pawns[c.team] ?? []).map((v, i) => (i === c.pawn ? 0 : v)) };
          }
          const victims = [...new Set(move.captured.map((c) => teamName(c.team)))].join(", ");
          sfx.playSFX(sounds.BURN, 0.7);
          setPlayback({ pawns, move, banner: t("race.sentHome", teamName(move.team), victims), returning: move.captured });
          await wait(PACE.capture);
        } else if (move.to >= RACE_FINISH) {
          sfx.playSFX(sounds.SUCCESS, 0.6);
          setPlayback({ pawns, move, banner: t("race.reachedCore", teamName(move.team)), returning: [] });
          await wait(PACE.core);
        }
        await wait(PACE.gap);
      }
      if (cancelled) return;
      const now = latest.current.race;
      if (!now) return;
      if (now.finished) await finish(now);
      else await startRound(now, now.round + 1);
    })();

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      setPlayback(null);
    };
  }, [status, roundKey, t, teamName, finish, startRound]);

  const handleEndGameEarly = () => {
    if (!race || status === "race_finished") {
      updateRoomStatus("night_lobby", { active_game: "none" });
      return;
    }
    resolvedKey.current = roundKey;
    finish({ ...race, moves: [], before: race.pawns, winners: leadingTeams(race.pawns, race.teams), finished: true });
  };

  const handlePlayAgain = () => {
    setIntroDone(false);
    updateRoomStatus("race_intro", { race: null, current_round: 0, ...NIGHT_ROUND_OPEN });
  };

  const membersOf = (team: RaceTeamId) => (race ? Object.keys(race.members).filter((id) => race.members[id] === team) : []);
  const nicknameOf = (id: string) => players.find((p) => p.id === id)?.nickname;

  const inPlay = race !== null && (status === "race_vote" || status === "race_move");
  const shownPawns = playback?.pawns ?? race?.pawns ?? {};
  const activeMove = status === "race_move" ? (playback?.move ?? null) : null;
  const trail =
    activeMove && activeMove.pawn !== null
      ? { team: activeMove.team, pawn: activeMove.pawn, from: shownPawns[activeMove.team]?.[activeMove.pawn] ?? activeMove.to, to: activeMove.to }
      : null;
  const burst =
    activeMove && activeMove.pawn !== null && (playback?.returning.length ?? 0) > 0
      ? { key: `${roundKey}-${activeMove.team}-${activeMove.bonus ? "b" : "a"}`, at: pawnPoint(activeMove.team, activeMove.pawn, activeMove.to) }
      : null;

  return (
    <TVScaleFrame>
      <div className="w-full h-full overflow-hidden flex flex-col px-24 py-12">
        <HostHeader
          room={room}
          onEndGameEarly={handleEndGameEarly}
          onReturnToLobby={() => updateRoomStatus("night_lobby", { active_game: "none" })}
        />
        <div className="flex-1 relative overflow-hidden min-h-0">
          <AnimatePresence mode="wait">
            {!inPlay && status !== "race_finished" && !introDone && (
              <motion.div key="intro" className="w-full h-full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: DURATION.base }}>
                <GameIntroCinematic
                  eyebrow={RACE_CARD.titlePrefix}
                  title={RACE_CARD.titleHighlight}
                  subtitle={t("race.introSubtitle")}
                  roster={players.map((p) => p.nickname)}
                  steps={[
                    { icon: "🎲", text: t("race.introStep1") },
                    { icon: "📱", text: t("race.introStep2") },
                    { icon: "💫", text: t("race.introStep3") },
                  ]}
                  onComplete={() => setIntroDone(true)}
                />
              </motion.div>
            )}

            {!inPlay && status !== "race_finished" && introDone && (
              <motion.div
                key="waiting"
                className="w-full h-full flex flex-col items-center justify-center gap-6 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: DURATION.base }}
              >
                <h2 className="text-6xl font-extrabold text-ink">{gameTitle("race")}</h2>
                <p className="text-3xl text-ink-2">{t("race.needPlayers")}</p>
              </motion.div>
            )}

            {inPlay && race && (
              <motion.div
                key="board"
                className="w-full h-full flex items-center gap-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: DURATION.base }}
              >
                <div className="h-full aspect-square shrink-0">
                  <HostRaceBoard
                    teams={race.teams}
                    pawns={shownPawns}
                    activeTeam={activeMove?.team ?? null}
                    trail={trail}
                    returning={playback?.returning}
                    burst={burst}
                  />
                </div>

                <div className="flex-1 min-w-0 flex flex-col gap-5">
                  <div>
                    <p className="text-2xl font-semibold text-ink-2 tabular-nums" data-testid="race-round">
                      {t("race.round", race.round, RACE_MAX_ROUNDS)}
                    </p>
                    <h2 className="text-6xl font-extrabold text-ink leading-tight">
                      {status === "race_vote" ? t("race.voteNow") : t("race.moving")}
                    </h2>
                  </div>

                  {/* Oylama süresi: ekrandaki tek odak animasyonu. */}
                  <div className="h-3 rounded-full bg-surface-2 overflow-hidden">
                    {status === "race_vote" && (
                      <motion.div
                        key={roundKey}
                        className="h-full w-full origin-left rounded-full bg-accent"
                        style={{ willChange: "transform" }}
                        initial={{ scaleX: Math.min(1, Math.max(0, (race.vote_ends_at - Date.now()) / RACE_VOTE_MS)) }}
                        animate={{ scaleX: 0 }}
                        transition={{ duration: Math.max(0, (race.vote_ends_at - Date.now()) / 1000), ease: "linear" }}
                      />
                    )}
                  </div>

                  <ul className="flex flex-col gap-3">
                    {race.teams.map((team) => {
                      const active = activeMove?.team === team;
                      const ids = membersOf(team);
                      const voted = ids.filter((id) => id in roundVotes).length;
                      const die = active && activeMove ? activeMove.roll : race.dice[team];
                      return (
                        <li
                          key={team}
                          data-testid={`race-team-${team}`}
                          className={`surface rounded-3xl px-6 py-4 flex items-center gap-5 border-2 transition-colors duration-200 ${
                            active ? "border-accent" : "border-transparent"
                          }`}
                        >
                          <RaceGlyph team={team} size={56} active={active} />
                          <div className="flex-1 min-w-0">
                            <p className={`text-4xl font-extrabold truncate ${active ? "text-accent" : "text-ink"}`}>{teamName(team)}</p>
                            <p className="text-2xl text-ink-2 tabular-nums">
                              {status === "race_vote" ? `${voted}/${ids.length}` : t("race.members", ids.length)} ·{" "}
                              {t("race.homeCount", homeCount(shownPawns, team), RACE_PAWNS)}
                            </p>
                            {/* Takımın toplam yolu: iki piyonun adımları. */}
                            <div className="mt-2 h-2 rounded-full bg-surface-2 overflow-hidden">
                              <div
                                className={`h-full w-full origin-left rounded-full transition-transform duration-200 ${active ? "bg-accent" : "bg-ink-3"}`}
                                style={{ transform: `scaleX(${teamSteps(shownPawns, team) / (RACE_PAWNS * RACE_FINISH)})` }}
                              />
                            </div>
                          </div>
                          <RaceDie key={`${roundKey}-${active && activeMove?.bonus ? "b" : "a"}`} value={die} size={84} active={active} />
                        </li>
                      );
                    })}
                  </ul>

                  <div className="h-24 flex items-center">
                    <AnimatePresence mode="wait">
                      {playback?.banner && (
                        <motion.p
                          key={playback.banner}
                          data-testid="race-banner"
                          className={`text-4xl font-extrabold leading-tight ${playback.returning.length > 0 ? "text-accent" : "text-ink"}`}
                          initial={{ opacity: 0, scale: playback.returning.length > 0 ? 1.25 : 1, y: 8 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: DURATION.slow, ease: EASE.out }}
                        >
                          {playback.banner}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
            )}

            {status === "race_finished" && (
              <motion.div
                key="finished"
                className="w-full h-full flex items-center gap-12"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: DURATION.base }}
              >
                {race && (
                  <div className="h-full aspect-square shrink-0">
                    <HostRaceBoard teams={race.teams} pawns={race.pawns} activeTeam={race.winners[0] ?? null} />
                  </div>
                )}
                {race && race.winners.length > 0 && <ConfettiCanvas trigger autoCannon className="pointer-events-none" />}
                <div className="flex-1 min-w-0 flex flex-col gap-6" data-testid="race-finished">
                  <p className="text-3xl font-semibold text-ink-2">
                    {!race || race.winners.length === 0 ? t("race.noWinner") : race.winners.length > 1 ? t("race.winners") : t("race.winner")}
                  </p>
                  {race?.winners.map((team) => (
                    <motion.div
                      key={team}
                      className="flex items-center gap-6"
                      initial={{ opacity: 0, scale: 0.7 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: DURATION.cinematic, ease: EASE.out }}
                    >
                      <RaceGlyph team={team} size={120} active />
                      <div className="min-w-0">
                        <h2 className="text-8xl font-extrabold text-accent leading-none">{teamName(team)}</h2>
                        <p className="mt-3 text-3xl text-ink-2 line-clamp-2">
                          {membersOf(team)
                            .map(nicknameOf)
                            .filter(Boolean)
                            .slice(0, 12)
                            .join(" · ")}
                        </p>
                      </div>
                    </motion.div>
                  ))}

                  {race && (
                    <ol className="flex flex-col gap-2">
                      {raceStandings(race.pawns, race.teams).map((row) => (
                        <li key={row.team} className="surface rounded-2xl px-6 py-3 flex items-center gap-5 text-3xl">
                          <span className="w-10 font-extrabold tabular-nums text-ink-2">{row.rank}.</span>
                          <RaceGlyph team={row.team} size={40} active={race.winners.includes(row.team)} />
                          <span className="flex-1 font-semibold text-ink truncate">{teamName(row.team)}</span>
                          <span className="text-ink-2 tabular-nums">{t("race.homeCount", row.home, RACE_PAWNS)}</span>
                        </li>
                      ))}
                    </ol>
                  )}

                  <div className="flex gap-4 pt-2">
                    <button type="button" className="btn-primary text-3xl px-10 py-5" onClick={handlePlayAgain}>
                      {t("race.playAgain")}
                    </button>
                    <button
                      type="button"
                      className="btn-secondary text-3xl px-10 py-5"
                      onClick={() => updateRoomStatus("night_lobby", { active_game: "none" })}
                    >
                      {t("race.backToLobby")}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </TVScaleFrame>
  );
}
