import { describe, it, expect } from "vitest";
import {
  detectCategoryKind,
  validateCategoryMatch,
} from "../categoryValidation";
import { calculateRoundScores } from "../scoring";
import type { Room, Player, Answer } from "../../types/database";

describe("detectCategoryKind", () => {
  it("Almanca kategorileri doğru eşleştirir", () => {
    expect(detectCategoryKind("Gegenstand")).toBe("object");
    expect(detectCategoryKind("Tier")).toBe("animal");
    expect(detectCategoryKind("Stadt")).toBe("city");
    expect(detectCategoryKind("Land")).toBe("country");
    expect(detectCategoryKind("Fluss")).toBe("river");
    expect(detectCategoryKind("Pflanze")).toBe("plant_fruit");
    expect(detectCategoryKind("Essen")).toBe("food");
    expect(detectCategoryKind("Name")).toBe("person_name");
  });

  it("Türkçe kategorileri doğru eşleştirir", () => {
    expect(detectCategoryKind("Eşya")).toBe("object");
    expect(detectCategoryKind("Hayvan")).toBe("animal");
    expect(detectCategoryKind("Şehir")).toBe("city");
    expect(detectCategoryKind("Ülke")).toBe("country");
    expect(detectCategoryKind("Nehir")).toBe("river");
    expect(detectCategoryKind("Bitki")).toBe("plant_fruit");
    expect(detectCategoryKind("Yiyecek")).toBe("food");
    expect(detectCategoryKind("İsim")).toBe("person_name");
  });

  it("İngilizce kategorileri doğru eşleştirir", () => {
    expect(detectCategoryKind("Object")).toBe("object");
    expect(detectCategoryKind("Animal")).toBe("animal");
    expect(detectCategoryKind("City")).toBe("city");
    expect(detectCategoryKind("Country")).toBe("country");
    expect(detectCategoryKind("Plant")).toBe("plant_fruit");
    expect(detectCategoryKind("Food")).toBe("food");
  });
});

describe("validateCategoryMatch — Almanca (Kullanıcının Irrtum / Gegenstand örneği)", () => {
  it("Gegenstand kategorisine soyut kavram (Irrtum) yazıldığında reddeder", () => {
    const result = validateCategoryMatch("Irrtum", "Gegenstand");
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.reasonCode).toBe("abstractNotObject");
    }
  });

  it("Gegenstand kategorisine diğer soyut kavramlar (Idee, Liebe, Zeit) yazıldığında reddeder", () => {
    expect(validateCategoryMatch("Idee", "Gegenstand").valid).toBe(false);
    expect(validateCategoryMatch("Liebe", "Gegenstand").valid).toBe(false);
    expect(validateCategoryMatch("Zeit", "Gegenstand").valid).toBe(false);
  });

  it("Gegenstand kategorisine hayvan (Hund, Katze) yazıldığında reddeder", () => {
    const res = validateCategoryMatch("Hund", "Gegenstand");
    expect(res.valid).toBe(false);
    if (!res.valid) expect(res.reasonCode).toBe("animalNotObject");
  });

  it("Gegenstand kategorisine şehir (Berlin) yazıldığında reddeder", () => {
    const res = validateCategoryMatch("Berlin", "Gegenstand");
    expect(res.valid).toBe(false);
    if (!res.valid) expect(res.reasonCode).toBe("placeNotObject");
  });

  it("Gegenstand kategorisine gerçek nesneler (Tisch, Stuhl, Isolierband, Iglu) geçer", () => {
    expect(validateCategoryMatch("Tisch", "Gegenstand").valid).toBe(true);
    expect(validateCategoryMatch("Stuhl", "Gegenstand").valid).toBe(true);
    expect(validateCategoryMatch("Isolierband", "Gegenstand").valid).toBe(true);
    expect(validateCategoryMatch("Iglu", "Gegenstand").valid).toBe(true);
  });

  it("Tier kategorisine eşya (Tisch) veya soyut kavram (Irrtum) yazıldığında reddeder", () => {
    const res1 = validateCategoryMatch("Tisch", "Tier");
    expect(res1.valid).toBe(false);
    if (!res1.valid) expect(res1.reasonCode).toBe("objectNotAnimal");

    const res2 = validateCategoryMatch("Irrtum", "Tier");
    expect(res2.valid).toBe(false);
    if (!res2.valid) expect(res2.reasonCode).toBe("abstractNotAnimal");
  });

  it("Tier kategorisine gerçek hayvanlar (Igel, Hund, Katze) geçer", () => {
    expect(validateCategoryMatch("Igel", "Tier").valid).toBe(true);
    expect(validateCategoryMatch("Hund", "Tier").valid).toBe(true);
    expect(validateCategoryMatch("Katze", "Tier").valid).toBe(true);
  });

  it("Stadt kategorisine ülke (Deutschland) yazıldığında reddeder", () => {
    const res = validateCategoryMatch("Deutschland", "Stadt");
    expect(res.valid).toBe(false);
    if (!res.valid) expect(res.reasonCode).toBe("countryNotCity");
  });

  it("Stadt kategorisine şehirler (Berlin, Hamburg, München) geçer", () => {
    expect(validateCategoryMatch("Berlin", "Stadt").valid).toBe(true);
    expect(validateCategoryMatch("Hamburg", "Stadt").valid).toBe(true);
  });

  it("Land kategorisine şehir (Berlin) yazıldığında reddeder, ülke (Deutschland) geçer", () => {
    const res = validateCategoryMatch("Berlin", "Land");
    expect(res.valid).toBe(false);
    if (!res.valid) expect(res.reasonCode).toBe("cityNotCountry");

    expect(validateCategoryMatch("Deutschland", "Land").valid).toBe(true);
  });
});

describe("validateCategoryMatch — Türkçe", () => {
  it("Eşya kategorisine soyut kavram (Fikir, Hata) yazıldığında reddeder", () => {
    const res1 = validateCategoryMatch("Fikir", "Eşya");
    expect(res1.valid).toBe(false);
    if (!res1.valid) expect(res1.reasonCode).toBe("abstractNotObject");

    const res2 = validateCategoryMatch("Hata", "Eşya");
    expect(res2.valid).toBe(false);
    if (!res2.valid) expect(res2.reasonCode).toBe("abstractNotObject");
  });

  it("Eşya kategorisine hayvan (Kedi) yazıldığında reddeder", () => {
    const res = validateCategoryMatch("Kedi", "Eşya");
    expect(res.valid).toBe(false);
    if (!res.valid) expect(res.reasonCode).toBe("animalNotObject");
  });

  it("Eşya kategorisine gerçek eşyalar (Masa, Dolap) geçer", () => {
    expect(validateCategoryMatch("Masa", "Eşya").valid).toBe(true);
    expect(validateCategoryMatch("Dolap", "Eşya").valid).toBe(true);
  });

  it("Şehir kategorisine ülke (Almanya, Fransa) yazıldığında reddeder", () => {
    const res = validateCategoryMatch("Almanya", "Şehir");
    expect(res.valid).toBe(false);
    if (!res.valid) expect(res.reasonCode).toBe("countryNotCity");
  });

  it("Şehir kategorisine şehirler (Ankara, İstanbul, İzmir) geçer", () => {
    expect(validateCategoryMatch("Ankara", "Şehir").valid).toBe(true);
    expect(validateCategoryMatch("İzmir", "Şehir").valid).toBe(true);
  });
});

describe("validateCategoryMatch doğrudan çağrı", () => {
  it("Almanca turda Gegenstand kategorisinde 'Irrtum' wrongCategory (abstractNotObject) olarak döner", () => {
    const verdict = validateCategoryMatch("Irrtum", "Gegenstand", "de");
    expect(verdict.valid).toBe(false);
    if (!verdict.valid) {
      expect(verdict.reasonCode).toBe("abstractNotObject");
    }
  });

  it("Almanca turda Gegenstand kategorisinde 'Isolierband' geçer", () => {
    const verdict = validateCategoryMatch("Isolierband", "Gegenstand", "de");
    expect(verdict.valid).toBe(true);
  });
});


describe("calculateRoundScores — yanlış kategori puanlama testi", () => {
  function makeRoom(): Room {
    return {
      id: "room-de",
      code: "AREN",
      status: "review",
      categories: ["Gegenstand", "Tier"],
      timer_setting: 60,
      total_rounds: 3,
      current_round: 1,
      game_mode: "individual",
      locale: "de",
    } as Room;
  }

  function makePlayer(id: string, nickname: string): Player {
    return {
      id,
      room_id: "room-de",
      nickname,
      team_name: null,
      total_score: 0,
      created_at: 0,
    };
  }

  it("Irrtum yazan oyuncu Gegenstand'dan 0 puan alır ve isWrongCategory işaretlenir", () => {
    const players = [makePlayer("p1", "Max"), makePlayer("p2", "Lisa")];
    const answers: Answer[] = [
      {
        room_id: "room-de",
        player_id: "p1",
        round_letter: "I",
        data: {
          Gegenstand: "Irrtum", // Yanlış: soyut kavram!
          Tier: "Igel", // Doğru!
        },
        created_at: "2026-01-01T00:00:00.000Z",
      },
      {
        room_id: "room-de",
        player_id: "p2",
        round_letter: "I",
        data: {
          Gegenstand: "Isolierband", // Doğru nesne!
          Tier: "Igel", // Doğru!
        },
        created_at: "2026-01-01T00:00:01.000Z",
      },
    ];

    const results = calculateRoundScores(makeRoom(), players, answers, "I");
    const p1 = results.find((r) => r.playerId === "p1")!;
    const p2 = results.find((r) => r.playerId === "p2")!;

    // Max (p1) — Gegenstand için Irrtum yazdı:
    expect(p1.answers["Gegenstand"].isValid).toBe(false);
    expect(p1.answers["Gegenstand"].points).toBe(0);
    expect(p1.answers["Gegenstand"].isWrongCategory).toBe(true);
    expect(p1.answers["Gegenstand"].wrongCategoryReason).toBe("abstractNotObject");

    // Lisa (p2) — Gegenstand için Isolierband yazdı (geçerli ve benzersiz):
    expect(p2.answers["Gegenstand"].isValid).toBe(true);
    expect(p2.answers["Gegenstand"].points).toBe(20);
    expect(p2.answers["Gegenstand"].isUnique).toBe(true);
  });
});
