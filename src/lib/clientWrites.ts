import { arrayUnion, increment, serverTimestamp } from "firebase/firestore";

import { retentionExpiry } from "./retention";
import type { Reward, VenueConfig } from "../types/database";

/**
 * Kurallara tabi her istemci yazmasının verisi buradaki bir fonksiyondan
 * çıkar; uygulama da kural testleri de (test/firestore.rules.test.ts) aynı
 * fonksiyonu kullanır.
 *
 * Neden: Kural testleri yıllarca istemcinin gerçekte yazmadığı veriyle
 * yazılmıştı. Overload savuşturması testte geçiyor, canlıda her seferinde
 * reddediliyordu; çark ve unity için hiç kural yoktu. Veri tek yerden
 * üretildiğinde test ile istemci birbirinden ayrışamaz.
 *
 * Sözleşme src/lib/__tests__/writeContract.test.ts'te denetleniyor:
 * oyuncu tarafındaki dosyalar yazma verisini satır içinde kuramaz ve
 * buradaki her fonksiyon en az bir kural testinde kullanılmak zorunda.
 *
 * Bu dosya saf kalmalı: Firebase uygulamasını başlatan `./firebase`'i
 * import etmemeli (kural testleri onu yükleyemez).
 */

// ─── Katılım ve profil ──────────────────────────────────────────────

export function playerJoinPayload(args: {
  roomId: string;
  uid: string;
  nickname: string;
  teamName: string | null;
  now?: number;
}) {
  const now = args.now ?? Date.now();
  return {
    room_id: args.roomId,
    nickname: args.nickname,
    team_name: args.teamName,
    total_score: 0,
    night_score: 0,
    uid: args.uid,
    created_at: now,
    // Firestore TTL politikası bu alana bakıp dokümanı siliyor (lib/retention.ts).
    expires_at: retentionExpiry(now),
  };
}

export function profileCreatePayload(args: { phoneNumber: string; nickname: string; now?: number }) {
  const now = args.now ?? Date.now();
  return {
    phone_number: args.phoneNumber,
    nickname: args.nickname,
    total_lifetime_score: 0,
    current_league: "BRONZE" as const,
    created_at: now,
    last_active: now,
  };
}

export function nicknamePayload(nickname: string) {
  return { nickname };
}

/** Canlılık sinyali — oyuncu `players.last_active`, host `rooms.host_last_active`. */
export function heartbeatPayload(field: "last_active" | "host_last_active", now: number = Date.now()) {
  return { [field]: now };
}

// ─── Cevaplar (answers) ─────────────────────────────────────────────

/** Klasik (harf) turu cevabı — PlayerGame. */
export function letterAnswerPayload(args: {
  roomId: string;
  playerId: string;
  letter: string;
  roundIndex: number;
  data: Record<string, string>;
  now?: number;
}) {
  const now = args.now ?? Date.now();
  return {
    room_id: args.roomId,
    player_id: args.playerId,
    round_letter: args.letter,
    round_index: args.roundIndex,
    data: args.data,
    created_at: new Date(now).toISOString(),
    expires_at: retentionExpiry(now),
  };
}

export function quizAnswerPayload(args: {
  roomId: string;
  playerId: string;
  questionIndex: number;
  option: string;
}) {
  return {
    room_id: args.roomId,
    player_id: args.playerId,
    round_letter: args.questionIndex.toString(),
    data: { selectedOption: args.option },
    created_at: serverTimestamp(),
    expires_at: retentionExpiry(),
  };
}

export function vaultGuessPayload(args: { roomId: string; playerId: string; guess: string; now?: number }) {
  const now = args.now ?? Date.now();
  return {
    room_id: args.roomId,
    player_id: args.playerId,
    round_letter: "VAULT",
    round_index: 0,
    data: { guess: args.guess },
    created_at: new Date(now).toISOString(),
    expires_at: retentionExpiry(now),
  };
}

export function aynaGuessPayload(args: {
  roomId: string;
  playerId: string;
  roundKey: string;
  roundIndex: number;
  value: number;
}) {
  return {
    room_id: args.roomId,
    player_id: args.playerId,
    round_letter: args.roundKey,
    round_index: args.roundIndex,
    data: { guess: String(args.value) },
    created_at: serverTimestamp(),
    expires_at: retentionExpiry(),
  };
}

export function aynaSurveyPayload(args: {
  roomId: string;
  hostUid: string;
  playerId: string;
  answers: Record<string, boolean>;
}) {
  return {
    room_id: args.roomId,
    host_uid: args.hostUid,
    player_id: args.playerId,
    answers: args.answers,
    created_at: serverTimestamp(),
    expires_at: retentionExpiry(),
  };
}

// ─── Oda dokümanındaki sıra/yarış hamleleri (kimliğe bağlı) ─────────

export function bombPassPayload(fromPlayerId: string, toPlayerId: string, word: string) {
  return {
    previous_bomb_target_player: fromPlayerId,
    bomb_target_player: toPlayerId,
    used_words: arrayUnion(word),
  };
}

export function sensorBuzzPayload(playerId: string, now: number = Date.now()) {
  return {
    status: "sensor_buzzed" as const,
    sensor_buzzer_player_id: playerId,
    sensor_buzzer_timestamp: now,
  };
}

/** Kuralın kabul ettiği en uzun buzzer cevabı. */
export const SENSOR_ANSWER_MAX = 100;

export function sensorAnswerPayload(answer: string) {
  return { sensor_player_answer: answer.trim().slice(0, SENSOR_ANSWER_MAX) };
}

export function overloadDeflectPayload(playerId: string) {
  return { overload_target_id: "passing", overload_last_target_id: playerId };
}

export function wheelSpinPayload(resultIndex: number) {
  return { status: "wheel_spinning" as const, wheel_result_index: resultIndex };
}

export function emojiPulsePayload(emoji: string, playerId: string, now: number = Date.now()) {
  return { emoji, timestamp: now, player_id: playerId };
}

// ─── Oyuncu girişleri: rooms/{id}/inputs/{playerId} ─────────────────

export function echoInputPayload(round: number, targetPlayerId: string) {
  return { round, echo_vote: targetPlayerId };
}

export function pulseInputPayload(round: number, clickTime: number) {
  return { round, pulse_click: clickTime };
}

/** Unity: bir yazmada toplam en fazla bu kadar artabilir (kural sınırı). */
export const UNITY_MAX_STEP = 30;

/** Unity: bu turun o ana kadarki toplam dokunuşu (artan, mutlak değer). */
export function unityInputPayload(round: number, clicks: number) {
  return { round, unity_clicks: clicks };
}

/**
 * Unity: bir sonraki yazmada bildirilecek toplam. Kural tek yazmada en fazla
 * UNITY_MAX_STEP artışa izin veriyor; telefon arka planda kalıp birikmiş
 * dokunuşlar fazlaysa birkaç yazmaya bölünür, hiçbiri reddedilmez.
 */
export function nextUnityReport(reported: number, total: number): number {
  return Math.min(total, reported + UNITY_MAX_STEP);
}

// ─── Oyuncunun kendi sayaçları (players/{id}) ───────────────────────

/** Kuralın (isValidIncrement) bir yazmada izin verdiği en büyük artış. */
export const COUNTER_MAX_STEP = {
  kablo_score: 1,
  bar_score: 1,
  colors_clicks: 30,
  spectrum_clicks: 30,
} as const;

export type PlayerCounter = keyof typeof COUNTER_MAX_STEP;

/**
 * Bekleyen artışın bu yazmada gönderilecek kısmı. Eskiden bekleyen artış
 * sınırı aşınca yazma reddediliyor, geri eklenip bir dahaki sefere daha
 * büyük olarak tekrar deneniyordu: sayaç bir daha hiç yazılamıyordu.
 */
export function counterStep(field: PlayerCounter, pending: number): number {
  return Math.max(0, Math.min(pending, COUNTER_MAX_STEP[field]));
}

export function counterIncrementPayload(field: PlayerCounter, step: number) {
  return { [field]: increment(step) };
}

// ─── Personel/host yazmaları (kural kısıtlı) ────────────────────────

export function roomCreatePayload(args: {
  code: string;
  hostUid: string;
  locale: string;
  venue: Pick<VenueConfig, "name" | "logo_url" | "primary_color">;
  now?: number;
}) {
  const now = args.now ?? Date.now();
  return {
    code: args.code,
    status: "night_lobby" as const,
    active_game: "none" as const,
    categories: [] as string[],
    timer_setting: 60,
    total_rounds: 3,
    current_round: 0,
    time_left: 0,
    game_mode: "individual" as const,
    locale: args.locale,
    created_at: now,
    expires_at: retentionExpiry(now),
    host_uid: args.hostUid,
    // Aktif mekan markasının anlık kopyası — canlı referans değil
    // (bkz. types/database.ts Room.venue_* alanları).
    venue_name: args.venue.name,
    venue_logo_url: args.venue.logo_url || null,
    venue_primary_color: args.venue.primary_color || null,
  };
}

export function rewardPayload(args: {
  roomId: string;
  uid: string;
  nickname: string;
  venue: Pick<VenueConfig, "reward_type" | "reward_title" | "reward_description" | "reward_validity_days">;
  code: string;
  now?: number;
}): Omit<Reward, "id"> {
  const now = args.now ?? Date.now();
  const validityDays = args.venue.reward_validity_days;
  // Firestore set() undefined alan kabul etmiyor: geçerlilik süresi yoksa
  // expires_at anahtarı hiç eklenmiyor.
  const expiresAt =
    typeof validityDays === "number" && validityDays > 0
      ? now + validityDays * 24 * 60 * 60 * 1000
      : null;
  return {
    uid: args.uid,
    nickname: args.nickname,
    type: args.venue.reward_type || "drink",
    title: (args.venue.reward_title ?? "").trim(),
    description: args.venue.reward_description?.trim() || "",
    status: "available",
    code: args.code,
    earned_at: now,
    room_id: args.roomId,
    ...(expiresAt !== null ? { expires_at: expiresAt } : {}),
  };
}

export function rewardClaimPayload(now: number = Date.now()) {
  return { status: "claimed" as const, claimed_at: now };
}

/** Host: kalıcı lig puanına aktarım (users/{uid}). */
export function lifetimeCreditPayload(delta: number) {
  return { total_lifetime_score: increment(delta) };
}

/** Host: oda puanının ne kadarının aktarıldığı işaretçisi (players/{id}). */
export function lifetimeMarkerPayload(credited: number) {
  return { lifetime_credited: credited };
}
