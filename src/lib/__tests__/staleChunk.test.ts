import { describe, it, expect } from "vitest";

import { STALE_CHUNK_RELOAD_WINDOW_MS, shouldReloadForStaleChunk } from "../staleChunk";

function memoryStorage() {
  const data = new Map<string, string>();
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
  };
}

const NOW = 1_700_000_000_000;

describe("shouldReloadForStaleChunk", () => {
  it("ilk hatada yeniler", () => {
    const storage = memoryStorage();
    expect(shouldReloadForStaleChunk(() => storage, NOW)).toBe(true);
  });

  it("aynı pencere içinde ikinci kez yenilemez — döngü yok", () => {
    const storage = memoryStorage();
    shouldReloadForStaleChunk(() => storage, NOW);
    expect(shouldReloadForStaleChunk(() => storage, NOW + 5_000)).toBe(false);
  });

  it("pencere geçince (bir sonraki yayın) tekrar yenileyebilir", () => {
    const storage = memoryStorage();
    shouldReloadForStaleChunk(() => storage, NOW);
    expect(shouldReloadForStaleChunk(() => storage, NOW + STALE_CHUNK_RELOAD_WINDOW_MS)).toBe(true);
  });

  it("depolamaya erişilemiyorsa yenilemez", () => {
    const blocked = () => {
      throw new DOMException("blocked", "SecurityError");
    };
    expect(shouldReloadForStaleChunk(blocked, NOW)).toBe(false);
  });
});
