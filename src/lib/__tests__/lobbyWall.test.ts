import { describe, it, expect } from "vitest";

import { LOBBY_WALL_SLOTS, initialsOf, lobbyWall } from "../lobbyWall";

const p = (id: string, at: number) => ({ id, created_at: at });
const ids = (list: { id: string }[]) => list.map((x) => x.id);

describe("lobbyWall", () => {
  it("boş lobide duvar boş", () => {
    expect(lobbyWall([], LOBBY_WALL_SLOTS)).toEqual({ shown: [], hidden: 0 });
  });

  it("isimleri katılım sırasıyla dizer ve girdiyi değiştirmez", () => {
    const players = [p("b", 2), p("a", 1), p("c", 3)];
    expect(ids(lobbyWall(players, 10).shown)).toEqual(["a", "b", "c"]);
    expect(ids(players)).toEqual(["b", "a", "c"]);
  });

  it("tam sığan liste kesilmez", () => {
    const ten = Array.from({ length: 10 }, (_, i) => p(`p${i}`, i));
    const wall = lobbyWall(ten, 10);
    expect(wall.shown).toHaveLength(10);
    expect(wall.hidden).toBe(0);
  });

  it("sığmayınca son hücre sayaca kalır, en yeni katılanlar görünür", () => {
    const forty = Array.from({ length: 40 }, (_, i) => p(`p${i}`, i));
    const wall = lobbyWall(forty, 10);
    expect(ids(wall.shown)).toEqual(["p31", "p32", "p33", "p34", "p35", "p36", "p37", "p38", "p39"]);
    expect(wall.hidden).toBe(31);
  });

  it("yeni katılan, duvar doluyken de görünür", () => {
    const eleven = Array.from({ length: 11 }, (_, i) => p(`p${i}`, i));
    expect(ids(lobbyWall(eleven, 10).shown)).toContain("p10");
  });

  it("tek hücrelik duvar yalnız sayaç gösterir", () => {
    expect(lobbyWall([p("a", 1), p("b", 2)], 1)).toEqual({ shown: [], hidden: 2 });
  });
});

describe("initialsOf", () => {
  it("ilk iki harfi büyütür", () => {
    expect(initialsOf("ayşe")).toBe("AY");
    expect(initialsOf("  jo  ")).toBe("JO");
  });

  it("büyük harfi arayüz diline göre seçer", () => {
    expect(initialsOf("ilk")).toBe("İL");
    expect(initialsOf("ilse", "de")).toBe("IL");
  });

  it("emoji ile başlayan adı bozmadan böler", () => {
    expect(initialsOf("🔥x")).toBe("🔥X");
  });

  it("boş ad için yer tutucu döner", () => {
    expect(initialsOf(" ")).toBe("?");
  });
});
