import { useEffect, useRef } from "react";

/**
 * `active` iken Escape tuşu `onEscape`'i çağırır. Arka plana tıklayarak
 * kapanan katmanların (modal, ekran koruyucu, kiosk) klavye karşılığı:
 * fare/dokunma olmadan — TV kumandası ya da klavye — çıkış yolu kalmıyordu.
 */
export function useEscapeKey(active: boolean, onEscape: () => void) {
  const handler = useRef(onEscape);
  useEffect(() => {
    handler.current = onEscape;
  });
  useEffect(() => {
    if (!active) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") handler.current();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);
}
