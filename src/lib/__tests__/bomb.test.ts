import { describe, expect, it } from "vitest";

import { bombLives, pickBombHolder } from "../bomb";

describe("bombLives", () => {
  it("yazılmamış can tam sayılır", () => {
    expect(bombLives({ lives: undefined })).toBe(3);
    expect(bombLives({ lives: 0 })).toBe(0);
  });
});

describe("pickBombHolder", () => {
  const players = [
    { id: "a", lives: 2 },
    { id: "b", lives: 0 },
    { id: "c", lives: undefined },
    { id: "d", lives: 1 },
  ];

  it("elenmişleri ve hariç tutulanı seçmez", () => {
    for (const r of [0, 0.34, 0.67, 0.9999]) {
      const id = pickBombHolder(players, "a", () => r);
      expect(id).not.toBe("a");
      expect(id).not.toBe("b");
    }
  });

  it("random 1'e çok yakın olsa da dizinin dışına taşmaz", () => {
    expect(pickBombHolder(players, null, () => 0.999999)).toBe("d");
  });

  it("canı olan kimse kalmadıysa null", () => {
    expect(pickBombHolder([{ id: "x", lives: 0 }], null)).toBeNull();
    expect(pickBombHolder([{ id: "x", lives: 2 }], "x")).toBeNull();
  });
});
