import { describe, it, expect } from "vitest";
import { echoVotesFromInputs, isInputForRound, pulseClicksFromInputs, unityTotalFromInputs } from "../roomInputs";

describe("isInputForRound", () => {
  it("yalnızca aynı turun kaydını sayar", () => {
    expect(isInputForRound({ round: 5, echo_vote: "b" }, 5)).toBe(true);
    expect(isInputForRound({ round: 4, echo_vote: "b" }, 5)).toBe(false);
  });

  it("kayıt ya da tur yoksa saymaz", () => {
    expect(isInputForRound(null, 5)).toBe(false);
    expect(isInputForRound(undefined, 5)).toBe(false);
    expect(isInputForRound({ round: 5 }, undefined)).toBe(false);
    expect(isInputForRound({ echo_vote: "b" }, 5)).toBe(false);
  });
});

describe("echoVotesFromInputs", () => {
  it("bu turun oylarını toplar, eski turları ve pulse kayıtlarını atlar", () => {
    const inputs = {
      a: { round: 9, echo_vote: "b" },
      b: { round: 9, echo_vote: "a" },
      c: { round: 8, echo_vote: "a" },
      d: { round: 9, pulse_click: 123 },
    };
    expect(echoVotesFromInputs(inputs, 9)).toEqual({ a: "b", b: "a" });
  });

  it("tur açılmamışsa boş döner", () => {
    expect(echoVotesFromInputs({ a: { round: 9, echo_vote: "b" } }, undefined)).toEqual({});
  });
});

describe("pulseClicksFromInputs", () => {
  it("bu turun dokunuşlarını toplar, echo kayıtlarını ve eski turları atlar", () => {
    const inputs = {
      a: { round: 2, pulse_click: 1000 },
      b: { round: 1, pulse_click: 2000 },
      c: { round: 2, echo_vote: "a" },
    };
    expect(pulseClicksFromInputs(inputs, 2)).toEqual({ a: 1000 });
  });
});

describe("unityTotalFromInputs", () => {
  it("bu turun dokunuş toplamlarını toplar, eski turları atlar", () => {
    const inputs = {
      a: { round: 4, unity_clicks: 12 },
      b: { round: 4, unity_clicks: 30 },
      c: { round: 3, unity_clicks: 99 },
      d: { round: 4, echo_vote: "a" },
    };
    expect(unityTotalFromInputs(inputs, 4)).toBe(42);
    expect(unityTotalFromInputs(inputs, undefined)).toBe(0);
  });
});
