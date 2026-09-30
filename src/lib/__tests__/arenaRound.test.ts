import { describe, expect, it } from "vitest";

import { haveAllPlayersSubmitted, isAnswerForRound, submittedPlayerIdsForRound } from "../arenaRound";

const ans = (player_id: string, round_letter: string, round_index?: number) => ({
  player_id,
  round_letter,
  round_index,
});

describe("isAnswerForRound", () => {
  it("harf ve tur eşleşince bu turundur", () => {
    expect(isAnswerForRound(ans("p1", "K", 2), "K", 2)).toBe(true);
  });

  it("aynı harf, önceki oyunun farklı turu → bu turun değil", () => {
    expect(isAnswerForRound(ans("p1", "K", 1), "K", 3)).toBe(false);
  });

  it("başka oyunun anahtarı (quiz '0', ayna_0, VAULT) hiçbir zaman eşleşmez", () => {
    for (const key of ["0", "ayna_0", "VAULT"]) {
      expect(isAnswerForRound(ans("p1", key, 0), "K", 0)).toBe(false);
    }
  });

  it("round_index'i olmayan eski kayıt yalnızca harfe göre eşleşir", () => {
    expect(isAnswerForRound(ans("p1", "K"), "K", 2)).toBe(true);
    expect(isAnswerForRound(ans("p1", "M"), "K", 2)).toBe(false);
  });

  it("aktif harf yoksa (lobi, '?' öncesi) hiçbir cevap bu turun değil", () => {
    expect(isAnswerForRound(ans("p1", "K", 1), undefined, 1)).toBe(false);
    expect(isAnswerForRound(ans("p1", "K", 1), "", 1)).toBe(false);
  });
});

describe("submittedPlayerIdsForRound", () => {
  it("host yenilemesi: gecenin tüm geçmişi gelse bile yalnızca bu turu sayar (regresyon)", () => {
    const history = [
      ans("p1", "A", 1),
      ans("p2", "A", 1),
      ans("p3", "0", 0), // quiz
      ans("p1", "K", 2),
      ans("p1", "K", 2), // çift gönderim
      ans("p2", "M", 3),
    ];
    expect(submittedPlayerIdsForRound(history, "K", 2)).toEqual(["p1"]);
  });
});

describe("haveAllPlayersSubmitted", () => {
  const players = [{ id: "p1" }, { id: "p2" }];

  it("herkes gönderdiyse true", () => {
    expect(haveAllPlayersSubmitted(players, ["p2", "p1"])).toBe(true);
  });

  it("odadan çıkmış birinin cevabı eksik oyuncuyu kapatmaz (regresyon)", () => {
    // Eski sayı karşılaştırması: 2 gönderen >= 2 oyuncu → tur erken kapanıyordu.
    expect(haveAllPlayersSubmitted(players, ["p1", "left-player"])).toBe(false);
  });

  it("oyuncu yoksa tur erken bitmez", () => {
    expect(haveAllPlayersSubmitted([], [])).toBe(false);
  });
});
