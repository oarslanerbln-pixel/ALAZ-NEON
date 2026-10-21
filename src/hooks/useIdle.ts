import { useEffect, useState } from "react";

const ACTIVITY_EVENTS = ["pointermove", "pointerdown", "keydown", "touchstart", "wheel"] as const;

/**
 * `ms` boyunca fare/dokunma/klavye hareketi olmazsa `true` döner; ilk
 * harekette `false`a döner. `enabled` false iken hep `false` (ör. oyun
 * kurulum penceresi açıkken TV tanıtıma geçmesin).
 */
export function useIdle(ms: number, enabled = true): boolean {
  const [idle, setIdle] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    let timer = window.setTimeout(() => setIdle(true), ms);
    const onActivity = () => {
      setIdle(false);
      window.clearTimeout(timer);
      timer = window.setTimeout(() => setIdle(true), ms);
    };
    for (const e of ACTIVITY_EVENTS) window.addEventListener(e, onActivity, { passive: true });
    return () => {
      window.clearTimeout(timer);
      for (const e of ACTIVITY_EVENTS) window.removeEventListener(e, onActivity);
    };
  }, [ms, enabled]);

  return enabled && idle;
}
