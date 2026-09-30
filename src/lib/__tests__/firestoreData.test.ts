import { describe, expect, it } from "vitest";

import { chunk, withoutUndefined } from "../firestoreData";

describe("withoutUndefined", () => {
  it("undefined alanları atar, diğer falsy değerlere dokunmaz", () => {
    expect(withoutUndefined({ a: undefined, b: 0, c: null, d: "", e: false })).toEqual({
      b: 0,
      c: null,
      d: "",
      e: false,
    });
  });

  it("Arena'nın 2. tur güncellemesi artık undefined taşımıyor (regresyon)", () => {
    // Firestore bu nesneyi senkron reddediyordu: "Unsupported field value: undefined".
    const update = { tutorial_step: undefined, used_letters: ["A"] };
    const clean = withoutUndefined(update);
    expect("tutorial_step" in clean).toBe(false);
    expect(clean).toEqual({ used_letters: ["A"] });
  });
});

describe("chunk", () => {
  it("500 sınırında böler", () => {
    const items = Array.from({ length: 1001 }, (_, i) => i);
    const parts = chunk(items, 500);
    expect(parts.map((p) => p.length)).toEqual([500, 500, 1]);
    expect(parts.flat()).toEqual(items);
  });

  it("boş dizi için parça üretmez", () => {
    expect(chunk([], 500)).toEqual([]);
  });

  it("geçersiz boyutu reddeder", () => {
    expect(() => chunk([1], 0)).toThrow(RangeError);
  });
});
