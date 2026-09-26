import { describe, it, expect } from "vitest";

import { trPossessiveSuffix } from "../trSuffix";

describe("trPossessiveSuffix", () => {
  it.each([
    [0, "ı"], [1, "i"], [2, "si"], [3, "ü"], [4, "ü"], [5, "i"], [6, "sı"], [7, "si"], [8, "i"], [9, "u"],
    [10, "u"], [20, "si"], [30, "u"], [40, "ı"], [50, "si"], [60, "ı"], [70, "i"], [80, "i"], [90, "ı"],
    [78, "i"], [33, "ü"], [100, "ü"],
  ])("%%%i → '%s", (n, suffix) => {
    expect(trPossessiveSuffix(n)).toBe(suffix);
  });

  it("ondalıkta son okunan kelimeye bakar", () => {
    expect(trPossessiveSuffix(3.7)).toBe("si"); // üç virgül yedi
    expect(trPossessiveSuffix(10.6)).toBe("sı"); // on virgül altı
  });
});
