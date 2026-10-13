import { describe, expect, it } from "vitest";

import { pointsFields } from "../scoreWrites";

describe("pointsFields", () => {
  it("yalnızca oyun skorunu artırır; gecelik skor oyun sonunda sıraya göre verilir", () => {
    expect(Object.keys(pointsFields(500))).toEqual(["total_score"]);
  });
});
