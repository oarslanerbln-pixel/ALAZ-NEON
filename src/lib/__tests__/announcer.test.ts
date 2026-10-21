import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, it, expect } from "vitest";
import {
  ANNOUNCER_CUES,
  CUE_COOLDOWN_MS,
  QUEUE_MAX_WAIT_MS,
  LAST_SECONDS_LEAD_MS,
  announcerPath,
  createAnnouncerState,
  cueForLegacyId,
  cueForTransition,
  decideCue,
  isNewGameStatus,
  lastSecondsDelay,
  pickQueued,
  recordPlay,
  startNewGame,
  type RoomSnapshot,
} from "../announcer";

const snap = (status: string, questionIndex = 0, totalQuestions = 5): RoomSnapshot => ({ status, questionIndex, totalQuestions });

describe("announcer — dosyalar", () => {
  it("her anın Almanca dosyası public/audio/vo/de altında var", () => {
    for (const cue of ANNOUNCER_CUES) {
      expect(existsSync(join(process.cwd(), "public", announcerPath(cue))), cue).toBe(true);
    }
  });

  it("üretim betiğindeki satırlar anlarla birebir aynı", () => {
    const src = readFileSync(join(process.cwd(), "scripts/voiceover-lines.mjs"), "utf8");
    const ids = [...src.matchAll(/id: "([a-z_]+)"/g)].map((m) => m[1]);
    expect(ids).toEqual([...ANNOUNCER_CUES]);
  });
});

describe("announcer — karar", () => {
  const t0 = 1_000_000;

  it("boştayken çalar, susturulmuşken çalmaz", () => {
    const s = createAnnouncerState();
    expect(decideCue(s, "quiz_intro", t0, null, false)).toEqual({ kind: "play" });
    expect(decideCue(s, "quiz_intro", t0, null, true)).toEqual({ kind: "skip", reason: "muted" });
  });

  it("gece başına bir kez: açılış anonsu yeni oyunda da tekrarlanmaz", () => {
    let s = recordPlay(createAnnouncerState(), "night_open", t0);
    s = startNewGame(s);
    expect(decideCue(s, "night_open", t0 + 60_000, null, false)).toEqual({ kind: "skip", reason: "limit" });
  });

  it("oyun başı sınır yeni oyunda sıfırlanır", () => {
    let s = recordPlay(createAnnouncerState(), "standings", t0);
    expect(decideCue(s, "standings", t0 + 60_000, null, false)).toEqual({ kind: "skip", reason: "limit" });
    s = startNewGame(s);
    expect(decideCue(s, "standings", t0 + 60_000, null, false)).toEqual({ kind: "play" });
  });

  it("aynı an kısa sürede iki kez gelirse ikincisi düşer (StrictMode, çift tetikleyici)", () => {
    const s = recordPlay(createAnnouncerState(), "bomb_exploded", t0);
    expect(decideCue(s, "bomb_exploded", t0 + 100, null, false)).toEqual({ kind: "skip", reason: "cooldown" });
    expect(decideCue(s, "bomb_exploded", t0 + CUE_COOLDOWN_MS, null, false)).toEqual({ kind: "play" });
  });

  it("üst üste binmez: daha önemlisi keser, yakında bitecekse bekler, değilse düşer", () => {
    const s = createAnnouncerState();
    const fuse = { cue: "bomb_fuse" as const, endsAt: t0 + 5000 };
    expect(decideCue(s, "bomb_exploded", t0, fuse, false)).toEqual({ kind: "interrupt" });
    const champion = { cue: "champion" as const, endsAt: t0 + QUEUE_MAX_WAIT_MS };
    expect(decideCue(s, "standings", t0, champion, false)).toEqual({ kind: "queue" });
    const long = { cue: "podium" as const, endsAt: t0 + QUEUE_MAX_WAIT_MS + 1 };
    expect(decideCue(s, "standings", t0, long, false)).toEqual({ kind: "skip", reason: "busy" });
  });

  it("bekleme yerini yalnızca daha önemli anons alır", () => {
    expect(pickQueued(null, "standings")).toBe("standings");
    expect(pickQueued("standings", "champion")).toBe("champion");
    expect(pickQueued("champion", "standings")).toBe("champion");
  });
});

describe("announcer — oda geçişleri", () => {
  it("ilk görüntü ve aynı durum konuşmaz", () => {
    expect(cueForTransition(null, snap("quiz_intro"))).toBeNull();
    expect(cueForTransition(snap("quiz_intro"), snap("quiz_intro"))).toBeNull();
  });

  it("oyun girişleri seslendirilir", () => {
    expect(cueForTransition(snap("lobby"), snap("quiz_intro"))).toBe("quiz_intro");
    expect(cueForTransition(snap("lobby"), snap("bomb_intro"))).toBe("bomb_intro");
    expect(cueForTransition(snap("lobby"), snap("sensor_intro"))).toBe("sensor_intro");
  });

  it("son soru duyurulur, aradaki sorular sessiz", () => {
    expect(cueForTransition(snap("quiz_leaderboard", 3), snap("question_intro", 4))).toBe("final_question");
    expect(cueForTransition(snap("quiz_leaderboard", 1), snap("question_intro", 2))).toBeNull();
    expect(cueForTransition(snap("quiz_intro", 0, 1), snap("question_intro", 0, 1))).toBeNull();
  });

  it("cevap açıklaması yalnızca ilk ve son soruda", () => {
    expect(cueForTransition(snap("question_active", 0), snap("question_reveal", 0))).toBe("reveal");
    expect(cueForTransition(snap("question_active", 2), snap("question_reveal", 2))).toBeNull();
    expect(cueForTransition(snap("question_active", 4), snap("question_reveal", 4))).toBe("reveal");
  });

  it("sıralama ekranına girişte bir kez", () => {
    expect(cueForTransition(snap("question_reveal"), snap("quiz_leaderboard"))).toBe("standings");
    expect(cueForTransition(snap("bomb_explosion"), snap("bomb_standings"))).toBe("standings");
  });

  it("yeni oyun yalnızca intro'ya girişte başlar", () => {
    expect(isNewGameStatus(snap("lobby"), snap("quiz_intro"))).toBe(true);
    expect(isNewGameStatus(snap("quiz_intro"), snap("quiz_intro"))).toBe(false);
    expect(isNewGameStatus(snap("question_reveal"), snap("quiz_leaderboard"))).toBe(false);
  });
});

describe("announcer — son saniyeler", () => {
  const now = 2_000_000;

  it("ilk ve son soruda süre bitmeden 5 sn önce", () => {
    expect(lastSecondsDelay(snap("question_active", 0), now + 20_000, now)).toBe(20_000 - LAST_SECONDS_LEAD_MS);
    expect(lastSecondsDelay(snap("question_active", 4), now + 20_000, now)).toBe(20_000 - LAST_SECONDS_LEAD_MS);
  });

  it("ara sorular, geçmiş süre ve başka durumlar sessiz", () => {
    expect(lastSecondsDelay(snap("question_active", 2), now + 20_000, now)).toBeNull();
    expect(lastSecondsDelay(snap("question_active", 0), now + 3000, now)).toBeNull();
    expect(lastSecondsDelay(snap("question_active", 0), null, now)).toBeNull();
    expect(lastSecondsDelay(snap("question_reveal", 0), now + 20_000, now)).toBeNull();
  });
});

describe("announcer — eski kimlikler", () => {
  it("ekranların çağırdığı anlar yeni pakete düşer, gürültülüler susar", () => {
    expect(cueForLegacyId("welcome_arena")).toBe("night_open");
    expect(cueForLegacyId("hurry_up")).toBe("bomb_fuse");
    expect(cueForLegacyId("champion_announce")).toBe("champion");
    expect(cueForLegacyId("new_player_joined")).toBeNull();
    expect(cueForLegacyId("countdown_10s")).toBeNull();
  });
});
