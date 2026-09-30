import { describe, expect, it } from "vitest";

import {
  awardNightPoints,
  gameStandings,
  isNightScoredFinish,
  nightAwardKey,
  rankByScore,
} from "../nightScore";
import type { Player, Room } from "../../types/database";

const player = (id: string, extra: Partial<Player> = {}): Player =>
  ({ id, room_id: "r", nickname: id, team_name: null, total_score: 0, created_at: 0, ...extra }) as Player;
const room = (extra: Partial<Room> = {}): Room => ({ id: "r", status: "finished", ...extra }) as Room;

describe("awardNightPoints", () => {
  it("sıralama puanı 10/7/5/3/2, geri kalan katılım 1", () => {
    const pts = awardNightPoints({
      groups: [["a"], ["b"], ["c"], ["d"], ["e"], ["f"]],
      participants: ["a", "b", "c", "d", "e", "f", "g"],
    });
    expect(pts).toEqual({ a: 10, b: 7, c: 5, d: 3, e: 2, f: 1, g: 1 });
  });

  it("beraberlikte aynı derece, sonraki sıra atlanır (standart yarışma sıralaması)", () => {
    const pts = awardNightPoints({ groups: [["a", "b"], ["c"]], participants: ["a", "b", "c"] });
    expect(pts).toEqual({ a: 10, b: 10, c: 5 });
  });

  it("işbirliği oyununda herkes aynı puanı alır", () => {
    expect(awardNightPoints({ groups: [], participants: ["a", "b"], coopPoints: 3 })).toEqual({ a: 3, b: 3 });
  });
});

describe("rankByScore", () => {
  it("skoru 0 olan derece almaz, eşit skorlar aynı grupta", () => {
    expect(
      rankByScore([
        { id: "a", score: 50 },
        { id: "b", score: 0 },
        { id: "c", score: 80 },
        { id: "d", score: 50 },
        { id: "e", score: undefined },
      ]),
    ).toEqual([["c"], ["a", "d"]]);
  });
});

describe("gameStandings — oyunlar arası ölçek farkı sıralamayı bozmaz", () => {
  it("quiz binlerle, arena onlarla puanlasa da kazanan 10 alır", () => {
    const quiz = gameStandings("quiz", room(), [player("a", { total_score: 4500 }), player("b", { total_score: 1500 })]);
    const arena = gameStandings("scattegories", room(), [player("a", { total_score: 30 }), player("b", { total_score: 60 })]);
    expect(awardNightPoints(quiz)).toEqual({ a: 10, b: 7 });
    expect(awardNightPoints(arena)).toEqual({ a: 7, b: 10 });
  });

  it("overload: şampiyon, sonra en son elenenden ilk elenene", () => {
    const s = gameStandings("overload", room({ overload_eliminated_ids: ["c", "b"] }), [
      player("a"),
      player("b"),
      player("c"),
    ]);
    expect(s.groups).toEqual([["a"], ["b"], ["c"]]);
  });

  it("overload erken bitirildiyse hayatta kalanlar birinciliği paylaşır", () => {
    const s = gameStandings("overload", room({ overload_eliminated_ids: ["c"] }), [player("a"), player("b"), player("c")]);
    expect(awardNightPoints(s)).toEqual({ a: 10, b: 10, c: 5 });
  });

  it("renkler: kazanan takım birinci, berabere olunca yalnızca katılım", () => {
    const teams = { a: "red", b: "blue", c: "red" } as const;
    const won = gameStandings("colors", room({ colors_team_assignments: teams, colors_winner: "red" }), [
      player("a"),
      player("b"),
      player("c"),
    ]);
    expect(awardNightPoints(won)).toEqual({ a: 10, b: 1, c: 10 });
    const draw = gameStandings("colors", room({ colors_team_assignments: teams, colors_winner: "draw" }), [player("a")]);
    expect(awardNightPoints(draw)).toEqual({ a: 1 });
  });

  it("birlik: hedef tutarsa herkese 3", () => {
    const players = [player("a", { unity_clicks: 60 }), player("b", { unity_clicks: 50 })];
    expect(awardNightPoints(gameStandings("unity", room({ unity_target: 100 }), players))).toEqual({ a: 3, b: 3 });
    expect(awardNightPoints(gameStandings("unity", room({ unity_target: 200 }), players))).toEqual({ a: 1, b: 1 });
  });

  it("ayna: oyun içi toplamlardan", () => {
    const s = gameStandings("ayna", room({ ayna_totals: { a: 40, b: 90 } }), [player("a"), player("b")]);
    expect(s.groups).toEqual([["b"], ["a"]]);
  });
});

describe("isNightScoredFinish / nightAwardKey", () => {
  it("yalnızca oyunun bitiş durumunda", () => {
    expect(isNightScoredFinish("quiz", "finished")).toBe(true);
    expect(isNightScoredFinish("quiz", "question_active")).toBe(false);
    expect(isNightScoredFinish("vault", "vault_reveal")).toBe(true);
  });

  it("şans ve oylama oyunları gece puanı vermez", () => {
    expect(isNightScoredFinish("wheel", "wheel_result")).toBe(false);
    expect(isNightScoredFinish("echo", "echo_reveal")).toBe(false);
  });

  it("anahtar oyun örneğine özgü; başlangıç anı yoksa dağıtım yapılmaz", () => {
    expect(nightAwardKey({ active_game: "quiz", game_started_at: 123 })).toBe("quiz:123");
    expect(nightAwardKey({ active_game: "quiz" })).toBeNull();
    expect(nightAwardKey({ active_game: "none", game_started_at: 1 })).toBeNull();
  });
});
