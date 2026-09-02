import { render, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { HoldButton } from "../HoldButton";

/**
 * rAF'ı elle sürülen bir kuyrukla taklit ediyoruz: her `flush(ms)` çağrısı
 * bekleyen geri çağrıyı artan bir zaman damgasıyla çalıştırır.
 */
function makeFrameDriver() {
  let queue: FrameRequestCallback[] = [];
  let now = 0;
  vi.stubGlobal("requestAnimationFrame", vi.fn((cb: FrameRequestCallback) => {
    queue.push(cb);
    return queue.length;
  }));
  vi.stubGlobal("cancelAnimationFrame", vi.fn(() => { queue = []; }));
  return {
    flush(stepMs: number, frames = 1) {
      for (let i = 0; i < frames; i++) {
        now += stepMs;
        const pending = queue;
        queue = [];
        for (const cb of pending) cb(now);
      }
    },
  };
}

describe("HoldButton", () => {
  let driver: ReturnType<typeof makeFrameDriver>;

  beforeEach(() => {
    driver = makeFrameDriver();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("süre dolunca onComplete'i bir kez çağırır", () => {
    const onComplete = vi.fn();
    const { getByRole } = render(
      <HoldButton onComplete={onComplete} text="GÖNDER" holdDuration={1000} />,
    );
    const button = getByRole("button");

    act(() => { fireEvent.pointerDown(button); });
    // İlk kare başlangıcı sabitler; 16ms'lik 70 kare ≈ 1.1sn
    act(() => { driver.flush(16, 70); });

    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it("erken bırakılırsa onComplete çağrılmaz", () => {
    const onComplete = vi.fn();
    const { getByRole } = render(
      <HoldButton onComplete={onComplete} text="GÖNDER" holdDuration={1000} />,
    );
    const button = getByRole("button");

    act(() => { fireEvent.pointerDown(button); });
    act(() => { driver.flush(16, 20); }); // ~0.3sn
    act(() => { fireEvent.pointerUp(button); });
    act(() => { driver.flush(16, 80); });

    expect(onComplete).not.toHaveBeenCalled();
  });

  it("disabled iken basılı tutma başlamaz", () => {
    const onComplete = vi.fn();
    const { getByRole } = render(
      <HoldButton onComplete={onComplete} text="GÖNDER" disabled />,
    );
    act(() => { fireEvent.pointerDown(getByRole("button")); });
    act(() => { driver.flush(16, 100); });
    expect(onComplete).not.toHaveBeenCalled();
  });
});
