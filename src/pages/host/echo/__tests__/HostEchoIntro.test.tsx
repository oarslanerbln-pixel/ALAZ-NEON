import { render, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

import { HostEchoIntro } from "../HostEchoIntro";
import type { Room } from "../../../../types/database";

const room = { id: "r1", status: "echo_intro", echo_question: "echo.q1" } as unknown as Room;

describe("HostEchoIntro", () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  // Host her oyuncu sinyalinde yeniden çiziliyor ve her seferinde yeni bir
  // onNext veriyor. Zamanlayıcı buna bağlıyken intro hiç bitmiyordu.
  it("onNext her yeniden çizimde değişse de 6 sn sonra bir kez oylamaya geçer", () => {
    const calls: string[] = [];
    const { rerender } = render(<HostEchoIntro room={room} onNext={() => calls.push("ilk")} />);

    for (let i = 0; i < 5; i++) {
      act(() => vi.advanceTimersByTime(1000));
      rerender(<HostEchoIntro room={room} onNext={() => calls.push(`yeni-${i}`)} />);
    }
    expect(calls).toEqual([]);

    act(() => vi.advanceTimersByTime(1000));
    expect(calls).toEqual(["yeni-4"]);

    act(() => vi.advanceTimersByTime(10000));
    expect(calls).toHaveLength(1);
  });
});
