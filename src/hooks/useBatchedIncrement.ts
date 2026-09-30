import { useCallback, useEffect, useRef } from "react";
import { doc, increment, updateDoc } from "firebase/firestore";

import { db } from "../lib/firebase";
import { CLICK_FLUSH_INTERVAL_MS, takeFlushChunk } from "../lib/batchedIncrement";

type ClickField = "colors_clicks" | "spectrum_clicks" | "unity_clicks";

/**
 * Oyuncunun kendi sayacına toplu artış yazar (bkz. lib/batchedIncrement.ts).
 *
 * Aralık `active` değişmedikçe yeniden kurulmuyor: bekleyen sayı ref'te
 * tutuluyor. Spektrum'daki eski sürümde sayı state'teydi; her dokunuş
 * effect'i yeniden kurup temizleyicide yazma tetikliyordu.
 * `active` false olunca kalan birikim son bir kez gönderilir.
 */
export function useBatchedIncrement(playerId: string, field: ClickField, active: boolean) {
  const pendingRef = useRef(0);
  const flushingRef = useRef(false);

  const flush = useCallback(() => {
    if (flushingRef.current) return;
    const { flush: amount, rest } = takeFlushChunk(pendingRef.current);
    if (amount === 0) return;
    pendingRef.current = rest;
    flushingRef.current = true;
    updateDoc(doc(db, "players", playerId), { [field]: increment(amount) })
      .catch((err) => {
        console.error(`[useBatchedIncrement] ${field} yazılamadı:`, err);
        pendingRef.current += amount;
      })
      .finally(() => {
        flushingRef.current = false;
      });
  }, [playerId, field]);

  useEffect(() => {
    if (!active) return;
    const interval = setInterval(flush, CLICK_FLUSH_INTERVAL_MS);
    return () => {
      clearInterval(interval);
      flush();
    };
  }, [active, flush]);

  return useCallback(
    (count = 1) => {
      if (active) pendingRef.current += count;
    },
    [active],
  );
}
