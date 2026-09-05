import { describe, it, expect } from "vitest";
import { Timestamp } from "firebase/firestore";

import { DATA_RETENTION_DAYS, retentionExpiry } from "../retention";

describe("veri saklama süresi", () => {
  it("Firestore TTL'in şart koştuğu Timestamp tipini üretiyor", () => {
    // Düz sayı yazılırsa TTL politikası dokümanı hiç silmez, sessizce
    // görmezden gelir — bu yüzden tip testi.
    expect(retentionExpiry()).toBeInstanceOf(Timestamp);
  });

  it("son yazma anından DATA_RETENTION_DAYS kadar sonrasını gösteriyor", () => {
    const now = 1_700_000_000_000;
    const expected = now + DATA_RETENTION_DAYS * 24 * 60 * 60 * 1000;
    expect(retentionExpiry(now).toMillis()).toBe(expected);
  });

  it("saklama süresi gecelik raporun en geniş aralığını (~30 gün) kapsıyor", () => {
    // Rapor ekranının "bu ay" aralığından kısa bir TTL, raporu sessizce
    // boşaltırdı; bu test o bağı görünür tutuyor.
    expect(DATA_RETENTION_DAYS).toBeGreaterThan(31);
  });
});
