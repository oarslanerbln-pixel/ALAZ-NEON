import type { Page } from "@playwright/test";

/**
 * Başsız Chromium'da gerçek ekran kilidi gözlenemiyor; bu betik
 * `navigator.wakeLock`'u sayaç tutan bir sahteyle değiştirir. Uygulama
 * kodu (lib/wakeLock.ts) değişmeden çalışır, test yalnızca "şu an kaç kilit
 * tutuluyor" sorusunu sorar.
 */
export const WAKE_LOCK_INIT_SCRIPT = `(() => {
  const state = { active: 0, requests: 0 };
  Object.defineProperty(window, "__e2eWakeLock", { value: state });
  const wakeLock = {
    request: async () => {
      state.requests += 1;
      state.active += 1;
      let released = false;
      const listeners = [];
      return {
        type: "screen",
        get released() { return released; },
        addEventListener: (_type, listener) => listeners.push(listener),
        removeEventListener: () => {},
        release: async () => {
          if (released) return;
          released = true;
          state.active -= 1;
          listeners.forEach((listener) => listener());
        },
      };
    },
  };
  Object.defineProperty(Navigator.prototype, "wakeLock", { configurable: true, get: () => wakeLock });
})();`;

/** Sayfanın şu an tuttuğu ekran kilidi sayısı. */
export function activeWakeLocks(page: Page): Promise<number> {
  return page.evaluate(
    () => (window as unknown as { __e2eWakeLock: { active: number } }).__e2eWakeLock.active,
  );
}
