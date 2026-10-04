import { describe, it, expect } from "vitest";
import { safeNextPath } from "../safeRedirect";

describe("safeNextPath", () => {
  const FALLBACK = "/admin/venue";

  it("uygulama içi yolu sorgusuyla birlikte korur", () => {
    expect(safeNextPath("/host/setup", FALLBACK)).toBe("/host/setup");
    expect(safeNextPath("/host/display?roomId=abc", FALLBACK)).toBe("/host/display?roomId=abc");
  });

  it("boş ya da eksik değerde varsayılana döner", () => {
    expect(safeNextPath(null, FALLBACK)).toBe(FALLBACK);
    expect(safeNextPath(undefined, FALLBACK)).toBe(FALLBACK);
    expect(safeNextPath("", FALLBACK)).toBe(FALLBACK);
  });

  it("başka siteye giden yolları reddeder (açık yönlendirme)", () => {
    expect(safeNextPath("https://evil.example", FALLBACK)).toBe(FALLBACK);
    expect(safeNextPath("//evil.example", FALLBACK)).toBe(FALLBACK);
    expect(safeNextPath("/\\evil.example", FALLBACK)).toBe(FALLBACK);
    expect(safeNextPath("javascript:alert(1)", FALLBACK)).toBe(FALLBACK);
  });
});
