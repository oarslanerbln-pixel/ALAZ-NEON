import { describe, expect, it } from "vitest";

import { assignTwoTeams, clampLives, playerResetForGame } from "../gameLaunch";

describe("playerResetForGame", () => {
  it("sayaçlı oyunlar kendi sayacını sıfırlar", () => {
    expect(playerResetForGame("colors")).toEqual({ colors_clicks: 0 });
    expect(playerResetForGame("spectrum")).toEqual({ spectrum_clicks: 0 });
    expect(playerResetForGame("unity")).toEqual({ unity_clicks: 0 });
    expect(playerResetForGame("bar")).toEqual({ bar_score: 0 });
    expect(playerResetForGame("kablo")).toEqual({ kablo_score: 0 });
  });

  it("bomba canları ayardaki değere döner — önceki oyunda elenenler de oyuna girer", () => {
    expect(playerResetForGame("bomb", { bombLives: 1 })).toEqual({ lives: 1, total_score: 0 });
    expect(playerResetForGame("bomb")).toEqual({ lives: 3, total_score: 0 });
  });

  it("sayaç tutmayan oyunlar dokunmaz", () => {
    expect(playerResetForGame("quiz")).toBeNull();
    expect(playerResetForGame("ayna")).toBeNull();
  });
});

describe("clampLives", () => {
  it("1–5 aralığına sıkıştırır, geçersizde 3", () => {
    expect(clampLives(0)).toBe(1);
    expect(clampLives(9)).toBe(5);
    expect(clampLives(2.6)).toBe(3);
    expect(clampLives(undefined)).toBe(3);
    expect(clampLives(Number.NaN)).toBe(3);
  });
});

describe("assignTwoTeams", () => {
  it("takımlar en fazla 1 kişi farklı ve herkes bir takımda", () => {
    const ids = ["a", "b", "c", "d", "e"];
    const teams = assignTwoTeams(ids, () => 0.42);
    expect(Object.keys(teams).sort()).toEqual(ids);
    const red = Object.values(teams).filter((t) => t === "red").length;
    expect(Math.abs(red - (ids.length - red))).toBeLessThanOrEqual(1);
  });
});
