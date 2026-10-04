import { useEffect } from "react";

import { browserWakeLockEnv, keepScreenAwake } from "../lib/wakeLock";

/**
 * `active` doğru olduğu sürece ekranı uyanık tutar (bkz. lib/wakeLock.ts).
 * Kilit sayfa kapanınca ya da sekme gizlenince tarayıcı tarafından zaten
 * bırakılıyor; kullanıcı telefonu güç düğmesiyle her zaman kilitleyebilir.
 */
export function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    return keepScreenAwake(browserWakeLockEnv());
  }, [active]);
}
