import { describe, it, expect } from "vitest";
import {
  aynaGuessPayload,
  aynaSurveyPayload,
  bombPassPayload,
  COUNTER_MAX_STEP,
  counterIncrementPayload,
  counterStep,
  echoInputPayload,
  emojiPulsePayload,
  heartbeatPayload,
  letterAnswerPayload,
  lifetimeCreditPayload,
  lifetimeMarkerPayload,
  nextUnityReport,
  nicknamePayload,
  overloadDeflectPayload,
  playerJoinPayload,
  profileCreatePayload,
  pulseInputPayload,
  quizAnswerPayload,
  rewardClaimPayload,
  rewardPayload,
  roomCreatePayload,
  sensorAnswerPayload,
  sensorBuzzPayload,
  UNITY_MAX_STEP,
  unityInputPayload,
  vaultGuessPayload,
  wheelSpinPayload,
} from "../clientWrites";

describe("counterStep", () => {
  it("bekleyen artışı kuralın tek yazma sınırına kırpar", () => {
    expect(counterStep("colors_clicks", 12)).toBe(12);
    expect(counterStep("colors_clicks", 95)).toBe(COUNTER_MAX_STEP.colors_clicks);
    expect(counterStep("kablo_score", 3)).toBe(1);
    expect(counterStep("spectrum_clicks", 0)).toBe(0);
    expect(counterStep("spectrum_clicks", -4)).toBe(0);
  });
});

describe("nextUnityReport", () => {
  it("toplamı bir yazmada en fazla UNITY_MAX_STEP artırır", () => {
    expect(nextUnityReport(0, 10)).toBe(10);
    expect(nextUnityReport(10, 100)).toBe(10 + UNITY_MAX_STEP);
    expect(nextUnityReport(40, 40)).toBe(40);
  });
});

/**
 * Firestore `set`/`update` içinde `undefined` bir alan görünce yazmayı
 * tümüyle reddediyor (ignoreUndefinedProperties kapalı). İsteğe bağlı
 * girdiler (mekan logosu, ödül süresi, takım adı) eksikken bile hiçbir yük
 * `undefined` taşımamalı; sonuç sessiz bir "yazma başarısız" olurdu.
 */
describe("yazma yükleri undefined alan taşımaz", () => {
  const now = 1_700_000_000_000;
  const payloads: Record<string, object> = {
    playerJoin: playerJoinPayload({ roomId: "r", uid: "u", nickname: "N", teamName: null, now }),
    profileCreate: profileCreatePayload({ phoneNumber: "", nickname: "N", now }),
    nickname: nicknamePayload("N"),
    heartbeat: heartbeatPayload("last_active", now),
    letterAnswer: letterAnswerPayload({ roomId: "r", playerId: "p", letter: "A", roundIndex: 0, data: {}, now }),
    quizAnswer: quizAnswerPayload({ roomId: "r", playerId: "p", questionIndex: 0, option: "A" }),
    vaultGuess: vaultGuessPayload({ roomId: "r", playerId: "p", guess: "1234", now }),
    aynaGuess: aynaGuessPayload({ roomId: "r", playerId: "p", roundKey: "k", roundIndex: 0, value: 50 }),
    aynaSurvey: aynaSurveyPayload({ roomId: "r", hostUid: "h", playerId: "p", answers: {} }),
    bombPass: bombPassPayload("a", "b", "kelime"),
    sensorBuzz: sensorBuzzPayload("p", now),
    sensorAnswer: sensorAnswerPayload("cevap"),
    overloadDeflect: overloadDeflectPayload("p"),
    wheelSpin: wheelSpinPayload(3),
    emojiPulse: emojiPulsePayload("🔥", "p", now),
    echoInput: echoInputPayload(1, "p"),
    pulseInput: pulseInputPayload(1, 500),
    unityInput: unityInputPayload(1, 10),
    counterIncrement: counterIncrementPayload("colors_clicks", 5),
    roomCreate: roomCreatePayload({ code: "ABCD", hostUid: "h", locale: "tr", venue: { name: "Mekan" }, now }),
    reward: rewardPayload({ roomId: "r", uid: "u", nickname: "N", venue: {}, code: "C", now }),
    rewardClaim: rewardClaimPayload(now),
    lifetimeCredit: lifetimeCreditPayload(10),
    lifetimeMarker: lifetimeMarkerPayload(10),
  };

  function undefinedPaths(value: unknown, path: string): string[] {
    if (value === undefined) return [path];
    if (value === null || typeof value !== "object") return [];
    // Firestore sentinel'leri (increment, serverTimestamp) olduğu gibi gider.
    if (Object.getPrototypeOf(value) !== Object.prototype && !Array.isArray(value)) return [];
    return Object.entries(value).flatMap(([k, v]) => undefinedPaths(v, `${path}.${k}`));
  }

  it.each(Object.entries(payloads))("%s", (name, payload) => {
    expect(undefinedPaths(payload, name)).toEqual([]);
  });

  it("ödül süresi tanımlıysa son kullanma tarihi eklenir, değilse anahtar hiç yoktur", () => {
    const base = { roomId: "r", uid: "u", nickname: "N", code: "C", now };
    expect(rewardPayload({ ...base, venue: { reward_validity_days: 2 } })).toMatchObject({
      expires_at: now + 2 * 24 * 60 * 60 * 1000,
    });
    expect(rewardPayload({ ...base, venue: { reward_validity_days: 0 } })).not.toHaveProperty("expires_at");
  });
});
