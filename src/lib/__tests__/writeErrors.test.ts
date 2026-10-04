import { describe, it, expect, vi, beforeEach } from "vitest";

const captureException = vi.fn();
vi.mock("@sentry/react", () => ({ captureException: (...args: unknown[]) => captureException(...args) }));

import { isContractViolation, reportWriteError } from "../writeErrors";

describe("reportWriteError", () => {
  beforeEach(() => {
    captureException.mockReset();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("kural reddini yazma adıyla Sentry'ye bildirir", () => {
    const err = { code: "permission-denied", message: "Missing or insufficient permissions." };
    reportWriteError("overload_deflect", err);
    expect(captureException).toHaveBeenCalledWith(err, {
      tags: { write: "overload_deflect", code: "permission-denied" },
    });
  });

  it("bağlantı gibi geçici hataları Sentry'ye göndermez", () => {
    reportWriteError("heartbeat", { code: "unavailable" });
    reportWriteError("heartbeat", new Error("ağ yok"));
    expect(captureException).not.toHaveBeenCalled();
  });

  it("sözleşme ihlali kodlarını tanır", () => {
    expect(isContractViolation({ code: "invalid-argument" })).toBe(true);
    expect(isContractViolation({ code: "failed-precondition" })).toBe(true);
    expect(isContractViolation({ code: "not-found" })).toBe(false);
    expect(isContractViolation(null)).toBe(false);
  });
});
