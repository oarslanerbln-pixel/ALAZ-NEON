import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { useRoundTimer } from "../useRoundTimer";

describe("useRoundTimer", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-04T20:00:00Z"));
  });
  afterEach(() => vi.useRealTimers());

  it("kalan süreyi hemen ve sonra yarım saniyede bir bildirir, dolunca bir kez kapatır", () => {
    const onTick = vi.fn();
    const onExpire = vi.fn();
    renderHook(() => useRoundTimer(true, Date.now() + 3_000, onTick, onExpire));
    expect(onTick).toHaveBeenLastCalledWith(3);

    vi.advanceTimersByTime(1_500);
    expect(onTick).toHaveBeenLastCalledWith(1);
    expect(onExpire).not.toHaveBeenCalled();

    vi.advanceTimersByTime(2_000);
    expect(onTick).toHaveBeenLastCalledWith(0);
    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it("süresi çoktan dolmuş tur (host kapalıyken) hemen kapanır", () => {
    const onExpire = vi.fn();
    renderHook(() => useRoundTimer(true, Date.now() - 10_000, vi.fn(), onExpire));
    expect(onExpire).not.toHaveBeenCalled(); // bir tik sonra
    vi.advanceTimersByTime(0);
    expect(onExpire).toHaveBeenCalledTimes(1);
  });

  it("etkin değilken ya da bitiş anı yokken hiçbir şey yapmaz", () => {
    const onTick = vi.fn();
    renderHook(() => useRoundTimer(false, Date.now() + 3_000, onTick, vi.fn()));
    renderHook(() => useRoundTimer(true, null, onTick, vi.fn()));
    vi.advanceTimersByTime(5_000);
    expect(onTick).not.toHaveBeenCalled();
  });
});
