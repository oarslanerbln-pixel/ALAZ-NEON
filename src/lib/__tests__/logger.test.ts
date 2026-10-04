import { describe, it, expect, vi, beforeEach } from "vitest";

const captureException = vi.fn();
vi.mock("../monitoring", () => ({ captureException: (...args: unknown[]) => captureException(...args) }));

import { createLogger, isTransientError, resetLoggerForTests } from "../logger";

describe("logger", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    captureException.mockReset();
    resetLoggerForTests();
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  it("error: konsola kapsamla yazar ve hatayı etiketle izlemeye gönderir", () => {
    const log = createLogger("HostBomb");
    const err = Object.assign(new Error("denied"), { code: "permission-denied" });
    log.error("Bomba devri yazılamadı:", err);

    expect(console.error).toHaveBeenCalledWith("[HostBomb]", "Bomba devri yazılamadı:", err);
    expect(captureException).toHaveBeenCalledWith(err, {
      tags: { scope: "HostBomb", code: "permission-denied" },
      extra: { message: "Bomba devri yazılamadı:" },
    });
  });

  it("error: hata nesnesi yoksa mesajdan bir Error üretir", () => {
    createLogger("Audio").error("bağlam açılamadı");
    const [sent] = captureException.mock.calls[0];
    expect(sent).toBeInstanceOf(Error);
    expect((sent as Error).message).toBe("bağlam açılamadı");
  });

  it("geçici ağ hataları izlemeye gitmez", () => {
    const log = createLogger("Room");
    log.error("dinleme koptu", { code: "unavailable" });
    log.error(Object.assign(new Error("x"), { code: "firestore/deadline-exceeded" }));
    log.error(new TypeError("Failed to fetch"));
    expect(captureException).not.toHaveBeenCalled();
    expect(console.error).toHaveBeenCalledTimes(3);
  });

  it("bir kapsamdan oturum başına en fazla 5 hata gider", () => {
    const log = createLogger("Loop");
    for (let i = 0; i < 12; i++) log.error(new Error(`#${i}`));
    expect(captureException).toHaveBeenCalledTimes(5);
    createLogger("Other").error(new Error("başka kapsam"));
    expect(captureException).toHaveBeenCalledTimes(6);
  });

  it("warn yalnızca konsola yazar", () => {
    createLogger("Audio").warn("dosya yok, synth'e düşülüyor", "/a.mp3");
    expect(console.warn).toHaveBeenCalledWith("[Audio]", "dosya yok, synth'e düşülüyor", "/a.mp3");
    expect(captureException).not.toHaveBeenCalled();
  });

  it("yöntemler geri çağırma olarak verilebilir (.catch(log.error))", async () => {
    const log = createLogger("Cb");
    await Promise.reject(new Error("r")).catch(log.error);
    expect(captureException).toHaveBeenCalledTimes(1);
  });

  it("isTransientError kalıcı hataları geçici saymaz", () => {
    expect(isTransientError({ code: "permission-denied" })).toBe(false);
    expect(isTransientError(new Error("boom"))).toBe(false);
    expect(isTransientError(undefined)).toBe(false);
  });
});
