/**
 * HENGAME NOVA — zarlı takım yarışı (bkz. docs/yaris-oyunu.md).
 *
 * Saf: Firestore'a dokunmaz. Zar ve tahta durumu odada (yalnız host yazar),
 * piyon oyu `answers`'ta. Rastgelelik parametre olarak gelir (testte sabit).
 *
 * İlerleme (progress): 0 = üs, 1…RACE_RING = halka (1 kendi kapısı),
 * sonraki RACE_LANE kare iniş yolu, RACE_FINISH = çekirdek (ev).
 */

export const RACE_TEAM_IDS = ["fire", "earth", "air", "water"] as const;
export type RaceTeamId = (typeof RACE_TEAM_IDS)[number];

export const RACE_RING = 24;
export const RACE_LANE = 2;
export const RACE_PAWNS = 2;
export const RACE_FINISH = RACE_RING + RACE_LANE + 1;
/** Ani bitiş: bu tur oynandıktan sonra en ilerideki takım kazanır. */
export const RACE_MAX_ROUNDS = 18;
export const RACE_VOTE_MS = 8000;
/** Oyun içi skorda çekirdeğe giren her piyonun değeri (bkz. teamScore). */
export const RACE_HOME_POINTS = 100;

export type RacePawns = Partial<Record<RaceTeamId, number[]>>;

export interface RaceCapture {
  team: RaceTeamId;
  pawn: number;
}

export interface RaceMove {
  team: RaceTeamId;
  roll: number;
  /** Altının getirdiği ek hamle mi. */
  bonus: boolean;
  /** Oynayan piyon; geçerli hamle yoksa `null` (zar yanar). */
  pawn: number | null;
  from: number;
  to: number;
  captured: RaceCapture[];
}

/** Odaya yazılan oyun durumu (`rooms.race`). */
export interface RaceState {
  /** Oyunun başladığı an (epoch ms): tekrar oynanınca eski oylar karışmasın. */
  game_id: number;
  teams: RaceTeamId[];
  /** Oyuncu kimliği → takım. */
  members: Record<string, RaceTeamId>;
  pawns: RacePawns;
  /** 1'den başlar. */
  round: number;
  /** Bu turun zarları. */
  dice: Partial<Record<RaceTeamId, number>>;
  /** Oylamanın bittiği an (host saati, epoch ms). */
  vote_ends_at: number;
  /** Son çözülen turun hamleleri (TV sırayla oynatır). */
  moves: RaceMove[];
  /** Son turdan önceki tahta: TV hamleleri buradan başlatıp oynatır. */
  before: RacePawns;
  winners: RaceTeamId[];
  finished: boolean;
}

type Random = () => number;

export function rollDie(random: Random = Math.random): number {
  return 1 + Math.min(5, Math.floor(random() * 6));
}

/**
 * Oyuncuları dengeli dağıtır: kimliğe göre sıralı, sırayla takımlara.
 * Takım sayısı en çok 4, en az oyuncu sayısı kadar (2–3 oyuncuda herkes tek).
 * Deterministik: aynı girdi her cihazda aynı takımları verir.
 */
export function assignRaceTeams(playerIds: readonly string[]): Pick<RaceState, "teams" | "members"> {
  const ids = [...new Set(playerIds)].sort();
  const teams = RACE_TEAM_IDS.slice(0, Math.min(RACE_TEAM_IDS.length, ids.length));
  const members: Record<string, RaceTeamId> = {};
  ids.forEach((id, i) => {
    members[id] = teams[i % teams.length];
  });
  return { teams: [...teams], members };
}

/** Sonradan katılanları en küçük takıma ekler (eşitlikte ilk takım). Değişiklik yoksa aynı nesne döner. */
export function withLateJoiners(
  state: Pick<RaceState, "teams" | "members">,
  playerIds: readonly string[],
): Record<string, RaceTeamId> {
  const missing = playerIds.filter((id) => !(id in state.members)).sort();
  if (missing.length === 0 || state.teams.length === 0) return state.members;
  const members = { ...state.members };
  for (const id of missing) {
    const size = (t: RaceTeamId) => Object.values(members).filter((m) => m === t).length;
    members[id] = state.teams.reduce((min, t) => (size(t) < size(min) ? t : min));
  }
  return members;
}

export function initialPawns(teams: readonly RaceTeamId[]): RacePawns {
  return Object.fromEntries(teams.map((t) => [t, Array<number>(RACE_PAWNS).fill(0)]));
}

/** Takımın kapısının halkadaki karesi (takım kimliğine bağlı, sabit). */
export function gateCell(team: RaceTeamId): number {
  return (RACE_TEAM_IDS.indexOf(team) * RACE_RING) / RACE_TEAM_IDS.length;
}

/** Piyonun halkadaki karesi (0…RACE_RING-1); üs, iniş yolu ve çekirdekte `null`. */
export function ringCell(team: RaceTeamId, progress: number): number | null {
  if (progress < 1 || progress > RACE_RING) return null;
  return (gateCell(team) + progress - 1) % RACE_RING;
}

function pawnsOf(pawns: RacePawns, team: RaceTeamId): number[] {
  return pawns[team] ?? Array<number>(RACE_PAWNS).fill(0);
}

/**
 * Hamlenin varacağı ilerleme; geçersizse `null`. Çekirdeğe tam sayı şartı
 * yok. Kendi piyonunun üstüne gelinemez (çekirdek hariç).
 */
export function moveTarget(pawns: RacePawns, team: RaceTeamId, pawn: number, roll: number): number | null {
  const own = pawnsOf(pawns, team);
  const from = own[pawn];
  if (from === undefined || from >= RACE_FINISH) return null;
  const to = Math.min(RACE_FINISH, from + roll);
  if (to < RACE_FINISH && own.some((p, i) => i !== pawn && p === to)) return null;
  return to;
}

export function legalPawns(pawns: RacePawns, team: RaceTeamId, roll: number): number[] {
  return pawnsOf(pawns, team)
    .map((_, i) => i)
    .filter((i) => moveTarget(pawns, team, i, roll) !== null);
}

/** Hamle rakip piyon yakalar mı (telefonda ipucu için). */
export function capturesAt(pawns: RacePawns, team: RaceTeamId, to: number): RaceCapture[] {
  const cell = ringCell(team, to);
  if (cell === null) return [];
  const out: RaceCapture[] = [];
  for (const other of RACE_TEAM_IDS) {
    if (other === team) continue;
    (pawns[other] ?? []).forEach((p, i) => {
      if (ringCell(other, p) === cell) out.push({ team: other, pawn: i });
    });
  }
  return out;
}

/**
 * Takımın oyunu sayar: en çok oyu alan geçerli piyon; eşitlikte (ve hiç oy
 * yoksa) daha ilerideki, o da eşitse küçük numaralı. Geçersiz piyona verilen
 * oy sayılmaz (istemci kurcalanabilir kabul edilir). Geçerli hamle yoksa `null`.
 */
export function tallyPawnVote(votes: readonly number[], legal: readonly number[], progress: readonly number[]): number | null {
  if (legal.length === 0) return null;
  const counts = new Map<number, number>(legal.map((i) => [i, 0]));
  for (const v of votes) {
    if (counts.has(v)) counts.set(v, counts.get(v)! + 1);
  }
  return [...legal].sort(
    (a, b) => counts.get(b)! - counts.get(a)! || (progress[b] ?? 0) - (progress[a] ?? 0) || a - b,
  )[0];
}

/** Hamleyi uygular; yakalanan rakip piyonlar üsse döner. Girdi değişmez. */
export function applyMove(
  pawns: RacePawns,
  team: RaceTeamId,
  pawn: number,
  roll: number,
  bonus = false,
): { pawns: RacePawns; move: RaceMove } {
  const to = moveTarget(pawns, team, pawn, roll);
  const from = pawnsOf(pawns, team)[pawn] ?? 0;
  if (to === null) {
    return { pawns, move: { team, roll, bonus, pawn: null, from, to: from, captured: [] } };
  }
  const captured = capturesAt(pawns, team, to);
  const next: RacePawns = { ...pawns, [team]: pawnsOf(pawns, team).map((p, i) => (i === pawn ? to : p)) };
  for (const c of captured) {
    next[c.team] = pawnsOf(next, c.team).map((p, i) => (i === c.pawn ? 0 : p));
  }
  return { pawns: next, move: { team, roll, bonus, pawn, from, to, captured } };
}

export function homeCount(pawns: RacePawns, team: RaceTeamId): number {
  return pawnsOf(pawns, team).filter((p) => p >= RACE_FINISH).length;
}

export function hasFinished(pawns: RacePawns, team: RaceTeamId): boolean {
  return homeCount(pawns, team) >= RACE_PAWNS;
}

/** Her tur başlayan takım değişir. */
export function turnOrder(teams: readonly RaceTeamId[], round: number): RaceTeamId[] {
  if (teams.length === 0) return [];
  const start = (((round - 1) % teams.length) + teams.length) % teams.length;
  return [...teams.slice(start), ...teams.slice(0, start)];
}

export function rollDice(teams: readonly RaceTeamId[], random: Random = Math.random): Partial<Record<RaceTeamId, number>> {
  return Object.fromEntries(teams.map((t) => [t, rollDie(random)]));
}

export interface RaceStanding {
  team: RaceTeamId;
  home: number;
  steps: number;
  /** Yarışma sıralaması (1, 2, 2, 4). */
  rank: number;
}

/** Sıralama: önce evdeki piyon, sonra toplam adım. */
export function raceStandings(pawns: RacePawns, teams: readonly RaceTeamId[]): RaceStanding[] {
  const rows = teams
    .map((team) => ({
      team,
      home: homeCount(pawns, team),
      steps: pawnsOf(pawns, team).reduce((a, b) => a + Math.min(b, RACE_FINISH), 0),
    }))
    .sort((a, b) => b.home - a.home || b.steps - a.steps || teams.indexOf(a.team) - teams.indexOf(b.team));
  let rank = 1;
  return rows.map((r, i) => {
    if (i > 0 && (r.home !== rows[i - 1].home || r.steps !== rows[i - 1].steps)) rank = i + 1;
    return { ...r, rank };
  });
}

/** Tur sınırında kazanan(lar): en ilerideki takım; eşitlikte ortak galibiyet. Hiç ilerleme yoksa kazanan yok. */
export function leadingTeams(pawns: RacePawns, teams: readonly RaceTeamId[]): RaceTeamId[] {
  const standings = raceStandings(pawns, teams);
  if (standings.length === 0 || standings[0].steps === 0) return [];
  return standings.filter((s) => s.rank === 1).map((s) => s.team);
}

export interface RoundResult {
  pawns: RacePawns;
  moves: RaceMove[];
  /** Oyun bittiyse kazanan(lar); sürüyorsa boş. */
  winners: RaceTeamId[];
  finished: boolean;
}

/**
 * Turu çözer: takımlar dönen sırayla oynar; altı atan takımın aynı piyonu
 * bir zar daha oynar (tur başına en çok bir kez; o piyon oynayamıyorsa en
 * ilerideki geçerli piyon). İki piyonu da çekirdeğe giren takım o an kazanır;
 * tur sınırında en ilerideki takım.
 *
 * @param votes takım → o takımın üyelerinin seçtiği piyon numaraları
 */
export function resolveRound(
  state: Pick<RaceState, "teams" | "pawns" | "round" | "dice">,
  votes: Partial<Record<RaceTeamId, readonly number[]>>,
  random: Random = Math.random,
): RoundResult {
  let pawns = state.pawns;
  const moves: RaceMove[] = [];
  for (const team of turnOrder(state.teams, state.round)) {
    const roll = state.dice[team] ?? rollDie(random);
    const choice = tallyPawnVote(votes[team] ?? [], legalPawns(pawns, team, roll), pawnsOf(pawns, team));
    const first = applyMove(pawns, team, choice ?? 0, roll);
    pawns = first.pawns;
    moves.push(first.move);
    if (roll === 6 && !hasFinished(pawns, team)) {
      const bonusRoll = rollDie(random);
      const legal = legalPawns(pawns, team, bonusRoll);
      const same = choice !== null && legal.includes(choice) ? choice : tallyPawnVote([], legal, pawnsOf(pawns, team));
      const second = applyMove(pawns, team, same ?? 0, bonusRoll, true);
      pawns = second.pawns;
      moves.push(second.move);
    }
    if (hasFinished(pawns, team)) return { pawns, moves, winners: [team], finished: true };
  }
  if (state.round >= RACE_MAX_ROUNDS) {
    return { pawns, moves, winners: leadingTeams(pawns, state.teams), finished: true };
  }
  return { pawns, moves, winners: [], finished: false };
}

/** Oyun içi skor: takım ilerlemesi (ev başına 100 + adım); gece ligi ayrıca `teamPoints` ile. */
export function teamScore(pawns: RacePawns, team: RaceTeamId): number {
  return pawnsOf(pawns, team).reduce(
    (sum, p) => sum + (p >= RACE_FINISH ? RACE_HOME_POINTS : Math.min(p, RACE_FINISH)),
    0,
  );
}

/** Oyların `answers` anahtarı: oyun ve tur başına tek oy kümesi. */
export function raceRoundKey(gameId: number, round: number): string {
  return `race-${gameId}-${round}`;
}

/** Telefondan gelen oy (kurcalanmış olabilir): geçerli piyon numarası ya da `null`. */
export function parsePawnVote(data: Record<string, unknown> | null | undefined): number | null {
  if (!data || data.type !== "race_vote") return null;
  const n = typeof data.pawn === "string" && /^\d$/.test(data.pawn) ? Number(data.pawn) : NaN;
  return Number.isInteger(n) && n >= 0 && n < RACE_PAWNS ? n : null;
}

export function isRaceTeamId(value: unknown): value is RaceTeamId {
  return typeof value === "string" && (RACE_TEAM_IDS as readonly string[]).includes(value);
}
