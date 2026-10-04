import { describe, it, expect } from "vitest";
import { newestFirst, vaultWinner } from "../vault";

const guess = (player_id: string, value: string, at: string) => ({
  player_id,
  data: { guess: value },
  created_at: at,
});

describe("vaultWinner", () => {
  it("kodu ilk bulan kazanır, liste sırası değil", () => {
    const guesses = [
      guess("b", "1234", "2026-10-04T12:00:05Z"),
      guess("a", "1234", "2026-10-04T12:00:02Z"),
      guess("c", "9999", "2026-10-04T12:00:01Z"),
    ];
    expect(vaultWinner(guesses, "1234")).toBe("a");
  });

  it("doğru tahmin ya da kod yoksa kazanan yok", () => {
    expect(vaultWinner([guess("a", "1111", "2026-10-04T12:00:00Z")], "1234")).toBeNull();
    expect(vaultWinner([guess("a", "", "2026-10-04T12:00:00Z")], "")).toBeNull();
    expect(vaultWinner([], undefined)).toBeNull();
  });
});

describe("newestFirst", () => {
  it("en yeni tahmini üste koyar, girdiyi değiştirmez", () => {
    const guesses = [guess("a", "1", "2026-10-04T12:00:01Z"), guess("b", "2", "2026-10-04T12:00:03Z")];
    expect(newestFirst(guesses).map((g) => g.player_id)).toEqual(["b", "a"]);
    expect(guesses[0].player_id).toBe("a");
  });
});
