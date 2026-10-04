import { describe, it, expect } from "vitest";
import { assignColorsTeams, colorsTargetClicks } from "../colorsTeams";

const count = (teams: Record<string, string>, team: string) => Object.values(teams).filter((t) => t === team).length;

describe("assignColorsTeams", () => {
  it("iki oyuncuyu her zaman ayrı takımlara koyar", () => {
    for (const r of [0, 0.3, 0.6, 0.99]) {
      const teams = assignColorsTeams(["a", "b"], () => r);
      expect(new Set(Object.values(teams))).toEqual(new Set(["red", "blue"]));
    }
  });

  it("takımlar en fazla bir kişi farklı ve herkes atanır", () => {
    const ids = ["a", "b", "c", "d", "e"];
    const teams = assignColorsTeams(ids, () => 0.42);
    expect(Object.keys(teams).sort()).toEqual(ids);
    expect(count(teams, "red")).toBe(3);
    expect(count(teams, "blue")).toBe(2);
  });

  it("kimse yoksa boş döner, girdiyi değiştirmez", () => {
    expect(assignColorsTeams([])).toEqual({});
    const ids = ["a", "b", "c"];
    assignColorsTeams(ids, () => 0);
    expect(ids).toEqual(["a", "b", "c"]);
  });
});

describe("colorsTargetClicks", () => {
  it("küçük masada 80, kalabalıkta oyuncu başına 35", () => {
    expect(colorsTargetClicks(2)).toBe(80);
    expect(colorsTargetClicks(3)).toBe(105);
    expect(colorsTargetClicks(10)).toBe(350);
  });
});
