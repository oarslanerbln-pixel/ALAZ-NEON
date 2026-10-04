import { describe, it, expect } from "vitest";
import { COUNTER_MAX_STEP, counterStep, nextUnityReport, UNITY_MAX_STEP } from "../clientWrites";

describe("counterStep", () => {
  it("bekleyen artışı kuralın tek yazma sınırına kırpar", () => {
    expect(counterStep("colors_clicks", 12)).toBe(12);
    expect(counterStep("colors_clicks", 95)).toBe(COUNTER_MAX_STEP.colors_clicks);
    expect(counterStep("kablo_score", 3)).toBe(1);
    expect(counterStep("spectrum_clicks", 0)).toBe(0);
    expect(counterStep("spectrum_clicks", -4)).toBe(0);
  });
});

describe("nextUnityReport", () => {
  it("toplamı bir yazmada en fazla UNITY_MAX_STEP artırır", () => {
    expect(nextUnityReport(0, 10)).toBe(10);
    expect(nextUnityReport(10, 100)).toBe(10 + UNITY_MAX_STEP);
    expect(nextUnityReport(40, 40)).toBe(40);
  });
});
