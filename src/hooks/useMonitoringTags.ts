import { useEffect } from "react";

import { setMonitoringTags } from "../lib/monitoring";

/**
 * Ekran açıkken hatalara rol/oda/oyun etiketi ekler (docs/roadmap.md, 2.4).
 * "Hangi oyunda, TV'de mi telefonda mı patladı" sorusu artık Sentry'de
 * filtrelenebiliyor. Ekran kapanınca etiketler kaldırılır.
 */
export function useMonitoringTags(tags: Record<string, string | null | undefined>) {
  const key = JSON.stringify(tags);
  useEffect(() => {
    const current = JSON.parse(key) as Record<string, string | null>;
    const applied = Object.fromEntries(Object.entries(current).map(([k, v]) => [k, v ?? undefined]));
    setMonitoringTags(applied);
    return () => setMonitoringTags(Object.fromEntries(Object.keys(applied).map((k) => [k, undefined])));
  }, [key]);
}
