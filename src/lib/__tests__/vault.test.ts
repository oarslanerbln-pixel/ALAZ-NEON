import { describe, it, expect } from "vitest";
import { newestFirst, newVaultCode, vaultFeedback, vaultWinner } from "../vault";

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

describe("vaultFeedback", () => {
  it("doğru yer, başka yerde var ve yok", () => {
    expect(vaultFeedback("1234", "1243")).toEqual(["correct", "correct", "present", "present"]);
    expect(vaultFeedback("5678", "1234")).toEqual(["absent", "absent", "absent", "absent"]);
    expect(vaultFeedback("4821", "4821").every((f) => f === "correct")).toBe(true);
  });

  it("yinelenen rakam kodda kaç kez geçiyorsa o kadar sayılır", () => {
    expect(vaultFeedback("1111", "1234")).toEqual(["correct", "absent", "absent", "absent"]);
    expect(vaultFeedback("2211", "1122")).toEqual(["present", "present", "present", "present"]);
  });
});

describe("newVaultCode", () => {
  it("her zaman 4 hane, 1000–9999", () => {
    expect(newVaultCode(() => 0)).toBe("1000");
    expect(newVaultCode(() => 0.9999)).toBe("9999");
  });
});
