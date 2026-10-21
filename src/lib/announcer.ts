/**
 * HENGAME — TV spikeri: hangi an seslendirilir, ne zaman susulur (saf mantık).
 *
 * Seslendirme yalnızca host/TV ekranında çalar; telefon (player) kısa SFX ve
 * haptikle kalır. Dosyalar tek seferlik betikle üretilir
 * (scripts/generate-voiceover-google.mjs) ve public/audio/vo/de/ altında
 * sabittir — çalışma anında TTS çağrısı yok. Mekanlar Almanca olduğu için
 * spiker arayüz dilinden bağımsız olarak hep Almanca konuşur.
 *
 * "Az ama etkili": her anın gece/oyun başına sınırı var, aynı an kısa sürede
 * iki kez tetiklenirse (StrictMode, iki ayrı tetikleyici) ikincisi düşer,
 * iki anons asla üst üste binmez.
 */

import type { GermanVoiceoverId } from "./germanVoiceover";

export const ANNOUNCER_CUES = [
  "night_open",
  "game_start",
  "quiz_intro",
  "bomb_intro",
  "sensor_intro",
  "final_question",
  "last_seconds",
  "reveal",
  "bomb_fuse",
  "bomb_exploded",
  "standings",
  "podium",
  "champion",
] as const;

export type AnnouncerCue = (typeof ANNOUNCER_CUES)[number];

interface CueRule {
  /** Yüksek öncelik, çalan düşük öncelikli anonsu keser. */
  priority: number;
  /** Bir gecede (TV sekmesi açık kaldıkça) en fazla kaç kez. */
  perNight?: number;
  /** Bir oyunda (intro'dan intro'ya) en fazla kaç kez. */
  perGame?: number;
}

export const CUE_RULES: Record<AnnouncerCue, CueRule> = {
  night_open: { priority: 1, perNight: 1 },
  game_start: { priority: 2, perGame: 1 },
  quiz_intro: { priority: 3, perGame: 1 },
  bomb_intro: { priority: 3, perGame: 1 },
  sensor_intro: { priority: 3, perGame: 1 },
  final_question: { priority: 3, perGame: 1 },
  last_seconds: { priority: 2, perGame: 2 },
  reveal: { priority: 2, perGame: 2 },
  bomb_fuse: { priority: 1, perGame: 1 },
  bomb_exploded: { priority: 4 },
  standings: { priority: 1, perGame: 1 },
  podium: { priority: 4, perGame: 1 },
  champion: { priority: 5, perGame: 1 },
};

/** Aynı anın tekrarına izin verilmeden önce geçmesi gereken süre. */
export const CUE_COOLDOWN_MS = 4000;
/** Çalan anons bu süre içinde bitecekse yeni anons beklemeye alınır. */
export const QUEUE_MAX_WAIT_MS = 2500;
/** Spiker konuşurken müziğin indiği oran (1 = hiç kısılmaz). */
export const MUSIC_DUCK_LEVEL = 0.3;
/** Son saniye anonsu sürenin bitmesine kaç ms kala. */
export const LAST_SECONDS_LEAD_MS = 5000;

export function announcerPath(cue: AnnouncerCue): string {
  return `/audio/vo/de/${cue}.mp3`;
}

type Counts = Partial<Record<AnnouncerCue, number>>;

export interface AnnouncerState {
  nightCounts: Counts;
  gameCounts: Counts;
  lastPlayedAt: Partial<Record<AnnouncerCue, number>>;
}

export function createAnnouncerState(): AnnouncerState {
  return { nightCounts: {}, gameCounts: {}, lastPlayedAt: {} };
}

/** Yeni oyun başladı: oyun başı sınırlar sıfırlanır, gece sınırları kalır. */
export function startNewGame(state: AnnouncerState): AnnouncerState {
  return { ...state, gameCounts: {} };
}

export function recordPlay(state: AnnouncerState, cue: AnnouncerCue, now: number): AnnouncerState {
  return {
    nightCounts: { ...state.nightCounts, [cue]: (state.nightCounts[cue] ?? 0) + 1 },
    gameCounts: { ...state.gameCounts, [cue]: (state.gameCounts[cue] ?? 0) + 1 },
    lastPlayedAt: { ...state.lastPlayedAt, [cue]: now },
  };
}

export interface NowPlaying {
  cue: AnnouncerCue;
  endsAt: number;
}

export type AnnouncerDecision =
  | { kind: "play" }
  | { kind: "interrupt" }
  | { kind: "queue" }
  | { kind: "skip"; reason: "muted" | "limit" | "cooldown" | "busy" };

export function decideCue(
  state: AnnouncerState,
  cue: AnnouncerCue,
  now: number,
  playing: NowPlaying | null,
  muted: boolean,
): AnnouncerDecision {
  if (muted) return { kind: "skip", reason: "muted" };

  const rule = CUE_RULES[cue];
  if (rule.perNight !== undefined && (state.nightCounts[cue] ?? 0) >= rule.perNight) {
    return { kind: "skip", reason: "limit" };
  }
  if (rule.perGame !== undefined && (state.gameCounts[cue] ?? 0) >= rule.perGame) {
    return { kind: "skip", reason: "limit" };
  }
  const last = state.lastPlayedAt[cue];
  if (last !== undefined && now - last < CUE_COOLDOWN_MS) {
    return { kind: "skip", reason: "cooldown" };
  }

  if (playing && now < playing.endsAt) {
    if (playing.cue === cue) return { kind: "skip", reason: "cooldown" };
    if (rule.priority > CUE_RULES[playing.cue].priority) return { kind: "interrupt" };
    if (playing.endsAt - now <= QUEUE_MAX_WAIT_MS) return { kind: "queue" };
    return { kind: "skip", reason: "busy" };
  }
  return { kind: "play" };
}

/** Bekleme sırasında tek yer var: yalnızca daha önemli anons öncekinin yerini alır. */
export function pickQueued(current: AnnouncerCue | null, incoming: AnnouncerCue): AnnouncerCue {
  if (!current) return incoming;
  return CUE_RULES[incoming].priority > CUE_RULES[current].priority ? incoming : current;
}

export interface RoomSnapshot {
  status: string;
  questionIndex: number;
  totalQuestions: number;
}

const GAME_START_STATUSES = new Set(["quiz_intro", "bomb_intro", "sensor_intro", "quiz_lobby"]);

/** Bu durum yeni bir oyunun başlangıcı mı (oyun başı sınırlar sıfırlanır)? */
export function isNewGameStatus(prev: RoomSnapshot | null, next: RoomSnapshot): boolean {
  return GAME_START_STATUSES.has(next.status) && prev?.status !== next.status;
}

function isFirstOrLastQuestion(s: RoomSnapshot): boolean {
  return s.questionIndex === 0 || s.questionIndex === s.totalQuestions - 1;
}

/**
 * Oda durumu değişiminden doğan anons. Durum değişmediyse (aynı durumda
 * snapshot yenilendiyse) hiçbir şey söylenmez. Lobi, bomba ve podyum
 * anları zamanlaması kendi ekranlarında olduğu için oradan gelir
 * (bkz. cueForLegacyId).
 */
export function cueForTransition(prev: RoomSnapshot | null, next: RoomSnapshot): AnnouncerCue | null {
  // İlk görüntü bir geçiş değil: TV oyunun ortasında yenilenirse konuşmaz.
  if (!prev) return null;
  if (prev.status === next.status && prev.questionIndex === next.questionIndex) return null;

  switch (next.status) {
    case "quiz_intro":
      return "quiz_intro";
    case "bomb_intro":
      return "bomb_intro";
    case "sensor_intro":
      return "sensor_intro";
    case "question_intro":
      return next.totalQuestions > 1 && next.questionIndex === next.totalQuestions - 1 ? "final_question" : null;
    case "question_reveal":
      return isFirstOrLastQuestion(next) ? "reveal" : null;
    case "quiz_leaderboard":
    case "bomb_standings":
    case "standings":
      return prev.status === next.status ? null : "standings";
    default:
      return null;
  }
}

/**
 * Soru sürerken "son beş saniye" anonsu kaç ms sonra söylenmeli. Yalnızca ilk
 * ve son soruda; süre zaten çok azsa (ya da hiç yoksa) null.
 */
export function lastSecondsDelay(snapshot: RoomSnapshot, roundEndTime: number | null | undefined, now: number): number | null {
  if (snapshot.status !== "question_active" || !roundEndTime) return null;
  if (!isFirstOrLastQuestion(snapshot)) return null;
  const delay = roundEndTime - LAST_SECONDS_LEAD_MS - now;
  return delay >= 0 ? delay : null;
}

/**
 * Ekranların hâlâ çağırdığı eski anons kimlikleri → yeni anlar. null dönenler
 * bilinçli olarak susturuldu (her katılımda/her soruda konuşmak premium değil).
 */
const LEGACY_CUES: Record<GermanVoiceoverId, AnnouncerCue | null> = {
  welcome_arena: "night_open",
  game_starting: "game_start",
  new_player_joined: null,
  countdown_10s: null,
  countdown_321: null,
  hurry_up: "bomb_fuse",
  bomb_intro: "bomb_intro",
  bomb_tick_fast: "bomb_fuse",
  bomb_exploded: "bomb_exploded",
  quiz_correct: null,
  quiz_wrong: null,
  quiz_streak: null,
  sensor_duel: "sensor_intro",
  podium_reveal: "podium",
  champion_announce: "champion",
  free_drink_reward: null,
};

export function cueForLegacyId(id: GermanVoiceoverId): AnnouncerCue | null {
  return LEGACY_CUES[id];
}
