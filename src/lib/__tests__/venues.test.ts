import { describe, it, expect } from "vitest";
import { DEFAULT_VENUE_ID, VENUE_ID_PATTERN, staffUidIssue, venueIdOf } from "../venues";

describe("venueIdOf", () => {
  it("mekansız eski kayıt varsayılan mekanındır", () => {
    expect(venueIdOf({})).toBe(DEFAULT_VENUE_ID);
    expect(venueIdOf({ venue_id: null })).toBe(DEFAULT_VENUE_ID);
    expect(venueIdOf(null)).toBe(DEFAULT_VENUE_ID);
    expect(venueIdOf({ venue_id: "kadikoy-neon" })).toBe("kadikoy-neon");
  });
});

describe("VENUE_ID_PATTERN", () => {
  it("küçük harf, rakam ve tire; tireyle başlamaz", () => {
    expect(VENUE_ID_PATTERN.test("kadikoy-neon")).toBe(true);
    expect(VENUE_ID_PATTERN.test("Kadikoy")).toBe(false);
    expect(VENUE_ID_PATTERN.test("-neon")).toBe(false);
    expect(VENUE_ID_PATTERN.test("a")).toBe(false);
  });
});

describe("staffUidIssue", () => {
  const OWN = "ownerUid0000000000000000";
  const OTHER = "staffUid0000000000000000";
  it("geçerli yeni kimlik eklenebilir", () => {
    expect(staffUidIssue(OTHER, OWN, [])).toBeNull();
  });
  it("biçimsiz, kendi ya da zaten ekli kimlik reddedilir", () => {
    expect(staffUidIssue("staff/abc", OWN, [])).toBe("invalid");
    expect(staffUidIssue("", OWN, [])).toBe("invalid");
    expect(staffUidIssue(OWN, OWN, [])).toBe("self");
    expect(staffUidIssue(OTHER, OWN, [OTHER])).toBe("exists");
  });
});
