import { describe, expect, it } from "vitest";

import { ELEMENT_OF, ZODIAC_SIGNS, elementTeams, isZodiacSign, type ZodiacSign } from "../zodiac";

describe("ELEMENT_OF", () => {
  it("12 burç, her elementte üçer tane", () => {
    expect(ZODIAC_SIGNS).toHaveLength(12);
    const perElement: Record<string, ZodiacSign[]> = {};
    for (const sign of ZODIAC_SIGNS) (perElement[ELEMENT_OF[sign]] ??= []).push(sign);
    expect(perElement).toEqual({
      fire: ["aries", "leo", "sagittarius"],
      earth: ["taurus", "virgo", "capricorn"],
      air: ["gemini", "libra", "aquarius"],
      water: ["cancer", "scorpio", "pisces"],
    });
  });
});

describe("isZodiacSign", () => {
  it("yalnız bilinen kimlikleri kabul eder", () => {
    expect(isZodiacSign("leo")).toBe(true);
    expect(isZodiacSign("Leo")).toBe(false);
    expect(isZodiacSign("ophiuchus")).toBe(false);
    expect(isZodiacSign(5)).toBe(false);
    expect(isZodiacSign(undefined)).toBe(false);
  });
});

describe("elementTeams", () => {
  it("yeterli büyüklükteki elementler kendi takımı olur", () => {
    const teams = elementTeams({ a: "aries", b: "leo", c: "taurus", d: "virgo", e: "gemini", f: "libra" });
    expect(teams).toEqual([
      { id: "fire", playerIds: ["a", "b"] },
      { id: "earth", playerIds: ["c", "d"] },
      { id: "air", playerIds: ["e", "f"] },
    ]);
  });

  it("tek kalan oyuncu en küçük takıma katılır, tek kişilik takım kalmaz", () => {
    const teams = elementTeams({ a: "aries", b: "leo", c: "sagittarius", d: "taurus", e: "virgo", f: "cancer" });
    expect(teams).toEqual([
      { id: "fire", playerIds: ["a", "b", "c"] },
      { id: "earth", playerIds: ["d", "e", "f"] },
    ]);
    expect(teams.every((t) => t.playerIds.length >= 2)).toBe(true);
  });

  it("geçerli element ikiden azsa iki dengeli takım kurulur", () => {
    expect(elementTeams({ a: "aries", b: "leo", c: "sagittarius", d: "aries" })).toEqual([
      { id: "sun", playerIds: ["a", "c"] },
      { id: "moon", playerIds: ["b", "d"] },
    ]);
    // Herkes farklı elementten: hiçbiri minSize'a ulaşmaz.
    expect(elementTeams({ a: "aries", b: "taurus", c: "gemini" }).map((t) => t.id)).toEqual(["sun", "moon"]);
  });

  it("her oyuncu tam bir takımda, girdi sırasından bağımsız", () => {
    const signs: Record<string, ZodiacSign> = {};
    ZODIAC_SIGNS.forEach((sign, i) => {
      signs[`p${String(i).padStart(2, "0")}`] = sign;
      if (i % 5 === 0) signs[`q${i}`] = sign;
    });
    const teams = elementTeams(signs);
    const all = teams.flatMap((t) => t.playerIds).sort();
    expect(all).toEqual(Object.keys(signs).sort());
    expect(new Set(all).size).toBe(all.length);

    const reversed = Object.fromEntries(Object.entries(signs).reverse());
    expect(elementTeams(reversed)).toEqual(teams);
  });

  it("boş oda ve tek oyuncu çökmez", () => {
    expect(elementTeams({})).toEqual([]);
    expect(elementTeams({ a: "leo" })).toEqual([{ id: "sun", playerIds: ["a"] }]);
  });
});
