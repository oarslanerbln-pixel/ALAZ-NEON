import { describe, expect, it } from "vitest";

import {
  PARTICIPATION_POINTS,
  TEAM_WIN_POINTS,
  nightPointsForPlayers,
  placementPointsByScore,
  nightRankOf,
  nightStandings,
  rankDeltas,
  teamPoints,
} from "../nightLeague";

describe("placementPointsByScore", () => {
  it("F1 sırası: 25, 18, 15", () => {
    expect(placementPointsByScore([
      { id: "c", score: 300 },
      { id: "a", score: 900 },
      { id: "b", score: 600 },
    ])).toEqual({ a: 25, b: 18, c: 15 });
  });

  it("eşit skor aynı sırayı paylaşır, sonraki sıra atlanır (1, 2, 2, 4)", () => {
    expect(placementPointsByScore([
      { id: "a", score: 900 },
      { id: "b", score: 500 },
      { id: "c", score: 500 },
      { id: "d", score: 100 },
    ])).toEqual({ a: 25, b: 18, c: 18, d: 12 });
  });

  it("puan alamayan katılım puanı alır", () => {
    expect(placementPointsByScore([
      { id: "a", score: 400 },
      { id: "b", score: 0 },
    ])).toEqual({ a: 25, b: PARTICIPATION_POINTS });
  });

  it("ilk 10'un dışı katılım puanı alır", () => {
    const entries = Array.from({ length: 12 }, (_, i) => ({ id: `p${i}`, score: 1000 - i }));
    const pts = placementPointsByScore(entries);
    expect(pts.p9).toBe(1);
    expect(pts.p10).toBe(PARTICIPATION_POINTS);
    expect(pts.p11).toBe(PARTICIPATION_POINTS);
  });
});

describe("teamPoints", () => {
  it("kazanan takım üyeleri takım puanı alır", () => {
    expect(teamPoints(["a", "b"], ["a", "b", "c"])).toEqual({ a: TEAM_WIN_POINTS, b: TEAM_WIN_POINTS, c: PARTICIPATION_POINTS });
  });
});

describe("nightPointsForPlayers", () => {
  it("takım modunda takım toplamına bakar", () => {
    const pts = nightPointsForPlayers("team", [
      { id: "a", total_score: 100, team_name: "Kartal" },
      { id: "b", total_score: 100, team_name: "Kartal" },
      { id: "c", total_score: 150, team_name: "Aslan" },
    ]);
    expect(pts).toEqual({ a: TEAM_WIN_POINTS, b: TEAM_WIN_POINTS, c: PARTICIPATION_POINTS });
  });

  it("bireysel modda sıra puanı", () => {
    expect(nightPointsForPlayers("individual", [
      { id: "a", total_score: 10, team_name: null },
      { id: "b", total_score: 20, team_name: null },
    ])).toEqual({ a: 18, b: 25 });
  });
});

describe("rankDeltas", () => {
  it("yükselen pozitif, düşen negatif, yeni gelen 0", () => {
    expect(rankDeltas(["a", "b", "c"], ["c", "a", "b", "d"])).toEqual({ c: 2, a: -1, b: -1, d: 0 });
  });
});

describe("nightStandings / nightRankOf", () => {
  const players = [
    { id: "a", nickname: "Zeynep", night_score: 30 },
    { id: "b", nickname: "Ali", night_score: 43 },
    { id: "c", nickname: "Can", night_score: 30 },
    { id: "d", nickname: "Deniz" },
  ];

  it("puana, eşitlikte ada göre sıralar", () => {
    expect(nightStandings(players).map((p) => p.id)).toEqual(["b", "c", "a", "d"]);
  });

  it("eşit puan aynı sırayı paylaşır", () => {
    expect(nightRankOf(players, "a")).toEqual({ rank: 2, total: 4, points: 30 });
    expect(nightRankOf(players, "c")).toEqual({ rank: 2, total: 4, points: 30 });
    expect(nightRankOf(players, "d")).toEqual({ rank: 4, total: 4, points: 0 });
  });

  it("henüz kimse puan almadıysa sıra yok", () => {
    expect(nightRankOf([{ id: "x", nickname: "X" }], "x")).toBeNull();
  });
});
