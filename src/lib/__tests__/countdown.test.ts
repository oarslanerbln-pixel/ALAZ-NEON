import { describe, expect, it } from "vitest";

import { countdownDeadline, remainingMs } from "../countdown";

const T0 = 1_000_000;

describe("countdownDeadline", () => {
  it("canlı görülen aşamada süre telefonun gördüğü andan sayılır", () => {
    // TV'nin saati 7 sn ileride olsa bile tam süre gösterilir.
    expect(countdownDeadline({ mountedAt: T0, durationMs: 30_000, roundEndTime: T0 + 23_000, live: true })).toBe(T0 + 30_000);
  });

  it("aşama ortasında açılan sayfada host'un bitiş anı kullanılır", () => {
    expect(countdownDeadline({ mountedAt: T0, durationMs: 30_000, roundEndTime: T0 + 12_000, live: false })).toBe(T0 + 12_000);
  });

  it("host'un bitiş anı tam süreden uzunsa kırpılır", () => {
    expect(countdownDeadline({ mountedAt: T0, durationMs: 30_000, roundEndTime: T0 + 90_000, live: false })).toBe(T0 + 30_000);
  });

  it("host'un bitiş anı geçmişteyse süre bitmiş sayılır", () => {
    expect(countdownDeadline({ mountedAt: T0, durationMs: 30_000, roundEndTime: T0 - 5_000, live: false })).toBe(T0);
  });

  it("bitiş anı yoksa yerel süreye düşer", () => {
    expect(countdownDeadline({ mountedAt: T0, durationMs: 20_000, roundEndTime: null, live: false })).toBe(T0 + 20_000);
  });
});

describe("remainingMs", () => {
  it("[0, süre] aralığında kalır", () => {
    expect(remainingMs(T0 + 10_000, T0, 30_000)).toBe(10_000);
    expect(remainingMs(T0 - 1, T0, 30_000)).toBe(0);
    expect(remainingMs(T0 + 99_000, T0, 30_000)).toBe(30_000);
  });
});
