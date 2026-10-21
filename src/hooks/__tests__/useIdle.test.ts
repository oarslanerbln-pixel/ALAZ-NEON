import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useIdle } from "../useIdle";

describe("useIdle", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it("süre dolunca true, harekette false", () => {
    const { result } = renderHook(() => useIdle(1000));
    expect(result.current).toBe(false);
    act(() => vi.advanceTimersByTime(1001));
    expect(result.current).toBe(true);
    act(() => window.dispatchEvent(new Event("pointerdown")));
    expect(result.current).toBe(false);
    act(() => vi.advanceTimersByTime(1001));
    expect(result.current).toBe(true);
  });

  it("kapalıyken hiç boşta sayılmaz", () => {
    const { result } = renderHook(() => useIdle(1000, false));
    act(() => vi.advanceTimersByTime(5000));
    expect(result.current).toBe(false);
  });
});
