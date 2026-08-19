import { describe, it, expect } from "vitest";
import { calculateRoundScores } from "../scoring";
import type { Room, Player, Answer } from "../../types/database";

const CATEGORIES = ["Şehir", "Hayvan"];

function makeRoom(overrides: Partial<Room> = {}): Room {
  return {
    id: "room-1",
    code: "ABCD",
    status: "review",
    categories: CATEGORIES,
    timer_setting: 60,
    total_rounds: 3,
    current_round: 1,
    game_mode: "individual",
    locale: "tr",
    ...overrides,
  } as Room;
}

function makePlayer(id: string, nickname: string, total_score = 0): Player {
  return {
    id,
    room_id: "room-1",
    nickname,
    team_name: null,
    total_score,
    created_at: 0,
  };
}

function makeAnswer(
  player_id: string,
  data: Record<string, string>,
  created_at = "2026-01-01T00:00:00.000Z",
): Answer {
  return { room_id: "room-1", player_id, round_letter: "A", data, created_at };
}

describe("calculateRoundScores — temel puanlama", () => {
  it("benzersiz cevap 20, paylaşılan cevap 10 puan", () => {
    const players = [makePlayer("p1", "BİR"), makePlayer("p2", "İKİ")];
    const answers = [
      makeAnswer("p1", { Şehir: "Ankara", Hayvan: "Aslan" }),
      makeAnswer("p2", { Şehir: "Ankara", Hayvan: "Ayı" }),
    ];

    const results = calculateRoundScores(makeRoom(), players, answers, "A");
    const p1 = results.find((r) => r.playerId === "p1")!;

    // Ankara paylaşıldı (10), Aslan benzersiz (20)
    expect(p1.answers["Şehir"].isUnique).toBe(false);
    expect(p1.answers["Şehir"].points).toBe(10);
    expect(p1.answers["Hayvan"].isUnique).toBe(true);
    expect(p1.answers["Hayvan"].points).toBe(20);
  });

  it("yanlış harfle başlayan cevaba puan vermez", () => {
    const players = [makePlayer("p1", "BİR")];
    const answers = [makeAnswer("p1", { Şehir: "Bursa", Hayvan: "Aslan" })];

    const results = calculateRoundScores(makeRoom(), players, answers, "A");
    expect(results[0].answers["Şehir"].isValid).toBe(false);
    expect(results[0].answers["Şehir"].points).toBe(0);
  });

  it("aynı oyuncunun mükerrer gönderimini tek sayar", () => {
    const players = [makePlayer("p1", "BİR")];
    const answers = [
      makeAnswer("p1", { Şehir: "Ankara" }, "2026-01-01T00:00:00.000Z"),
      makeAnswer("p1", { Şehir: "Adana" }, "2026-01-01T00:00:05.000Z"),
    ];

    const results = calculateRoundScores(makeRoom(), players, answers, "A");
    expect(results).toHaveLength(1);
    // En erken gönderim geçerli sayılır.
    expect(results[0].answers["Şehir"].value).toBe("Ankara");
  });
});

describe("calculateRoundScores — otomatik moderasyon", () => {
  it("anlamsız cevabı geçersiz sayar ve işaretler", () => {
    const players = [makePlayer("p1", "BİR")];
    const answers = [makeAnswer("p1", { Şehir: "Aaaa", Hayvan: "Aslan" })];

    const results = calculateRoundScores(makeRoom(), players, answers, "A");
    const sehir = results[0].answers["Şehir"];

    expect(sehir.isValid).toBe(false);
    expect(sehir.points).toBe(0);
    expect(sehir.isGibberish).toBe(true);
    expect(sehir.gibberishReason).toBe("repeatedLetters");
  });

  it("küfürlü cevabı geçersiz sayar ve işaretler", () => {
    const players = [makePlayer("p1", "BİR")];
    const answers = [makeAnswer("p1", { Şehir: "amk", Hayvan: "Aslan" })];

    const results = calculateRoundScores(makeRoom(), players, answers, "A");
    const sehir = results[0].answers["Şehir"];

    expect(sehir.isValid).toBe(false);
    expect(sehir.isProfane).toBe(true);
  });

  it("geçersiz cevap, başkasının benzersizlik bonusunu çalmaz", () => {
    const players = [makePlayer("p1", "BİR"), makePlayer("p2", "İKİ")];
    const answers = [
      makeAnswer("p1", { Şehir: "Aaaa" }), // anlamsız → sayıma girmemeli
      makeAnswer("p2", { Şehir: "Ankara" }),
    ];

    const results = calculateRoundScores(makeRoom(), players, answers, "A");
    const p2 = results.find((r) => r.playerId === "p2")!;

    expect(p2.answers["Şehir"].isUnique).toBe(true);
    expect(p2.answers["Şehir"].points).toBe(20);
  });

  it("gerçek cevapları moderasyon elemez", () => {
    const players = [makePlayer("p1", "BİR")];
    const answers = [makeAnswer("p1", { Şehir: "Ankara", Hayvan: "Ayı" })];

    const results = calculateRoundScores(makeRoom(), players, answers, "A");
    expect(results[0].answers["Şehir"].isValid).toBe(true);
    expect(results[0].answers["Hayvan"].isValid).toBe(true);
  });
});

describe("calculateRoundScores — joker ve erken gönderim", () => {
  it("doğru joker puanı ikiye katlar", () => {
    const players = [makePlayer("p1", "BİR")];
    const answers = [
      makeAnswer("p1", { Şehir: "Ankara", _jokerCategory: "Şehir" }),
    ];

    const results = calculateRoundScores(makeRoom(), players, answers, "A");
    // Tek oyuncu → benzersiz (20) → joker ile 40
    expect(results[0].answers["Şehir"].points).toBe(40);
    expect(results[0].answers["Şehir"].isJoker).toBe(true);
  });

  it("boş/yanlış jokere -10 ceza verir", () => {
    const players = [makePlayer("p1", "BİR")];
    const answers = [
      makeAnswer("p1", { Şehir: "Bursa", _jokerCategory: "Şehir" }),
    ];

    const results = calculateRoundScores(makeRoom(), players, answers, "A");
    expect(results[0].answers["Şehir"].points).toBe(-10);
  });

  it("erken gönderene 15 puan bonus verir", () => {
    const players = [makePlayer("p1", "BİR")];
    const answers = [
      makeAnswer("p1", { Şehir: "Ankara", _earlySubmit: "true" }),
    ];

    const results = calculateRoundScores(makeRoom(), players, answers, "A");
    expect(results[0].earlyBonus).toBe(true);
    // 20 (benzersiz) + 15 (erken)
    expect(results[0].roundScore).toBe(35);
  });

  it("toplam skoru oyuncunun mevcut skoruna ekler", () => {
    const players = [makePlayer("p1", "BİR", 100)];
    const answers = [makeAnswer("p1", { Şehir: "Ankara" })];

    const results = calculateRoundScores(makeRoom(), players, answers, "A");
    expect(results[0].roundScore).toBe(20);
    expect(results[0].totalScore).toBe(120);
  });
});
