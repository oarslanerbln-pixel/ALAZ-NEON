import { describe, it, expect } from "vitest";
import { computeVenueKpis, MAX_GAME_MINUTES, type GameEventRecord } from "../venueKpis";

const HOUR = 3_600_000;
const MIN = 60_000;
const at = (hour: number) => hour * HOUR; // hourOf aşağıda UTC saatine sabit

const started = (game: string, hour: number, players = 10, room = "r1"): GameEventRecord => ({
  type: "game_started",
  room_id: room,
  game,
  player_count: players,
  started_at: at(hour),
});
const ended = (game: string, hour: number, minutes: number): GameEventRecord => ({
  type: "game_ended",
  room_id: "r1",
  game,
  player_count: 10,
  started_at: at(hour),
  ended_at: at(hour) + minutes * MIN,
});

const base = { nightCount: 2, guestUids: [], priorGuestUids: new Set<string>(), hourOf: (ms: number) => Math.floor(ms / HOUR) % 24 };

describe("computeVenueKpis", () => {
  it("oyunları başlangıç olaylarından sayar, gece başına ve en çok oynanan", () => {
    const kpis = computeVenueKpis({
      ...base,
      events: [started("quiz", 21), started("bomb", 22), started("quiz", 22, 20), ended("quiz", 21, 12)],
    });
    expect(kpis.gamesPlayed).toBe(3);
    expect(kpis.gamesPerNight).toBe(1.5);
    expect(kpis.topGames).toEqual([
      { game: "quiz", count: 2 },
      { game: "bomb", count: 1 },
    ]);
    expect(kpis.avgPlayersPerGame).toBe(13.3);
    expect(kpis.peakHour).toBe(22);
  });

  it("ortalama süre yalnızca makul biten oyunlardan (TV açık bırakılmışsa sayılmaz)", () => {
    const kpis = computeVenueKpis({
      ...base,
      events: [ended("quiz", 21, 10), ended("bomb", 22, 5), ended("echo", 23, MAX_GAME_MINUTES + 30)],
    });
    expect(kpis.avgGameMinutes).toBe(7.5);
  });

  it("tekil ve geri dönen misafir oranı", () => {
    const kpis = computeVenueKpis({
      ...base,
      events: [],
      guestUids: ["a", "b", "b", "c", ""],
      priorGuestUids: new Set(["b", "z"]),
    });
    expect(kpis.uniqueGuests).toBe(3);
    expect(kpis.returningGuests).toBe(1);
    expect(kpis.returningRate).toBeCloseTo(0.333, 3);
  });

  it("veri yoksa sıfır ve null; gece yoksa bölme yok", () => {
    const kpis = computeVenueKpis({ ...base, nightCount: 0, events: [] });
    expect(kpis).toMatchObject({
      gamesPlayed: 0,
      gamesPerNight: 0,
      topGames: [],
      avgPlayersPerGame: 0,
      avgGameMinutes: null,
      peakHour: null,
      uniqueGuests: 0,
      returningRate: null,
    });
  });
});
