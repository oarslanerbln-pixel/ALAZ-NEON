import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { DEFAULT_VENUE_CONFIG, type VenueConfig } from "../types/database";
import { DEFAULT_VENUE_ID } from "../lib/venues";
import { createLogger } from "../lib/logger";

const log = createLogger("useActiveVenue");

/**
 * Bir mekanın ayarlarını (marka, ödül şablonu, reklamlar, çark) canlı dinler:
 * `venues/{venueId}` (docs/design/3.1-cok-mekan.md).
 *
 * Geçiş (aşama A): `default` mekanın belgesi göç betiği çalışana kadar yok;
 * o sürece eski tek belge `app_config/active_venue` okunur. Hiçbiri yoksa
 * (ilk kurulum) varsayılan HENGAME markası.
 */
export function useVenueConfig(venueId: string): { venue: VenueConfig; loading: boolean; legacy: boolean } {
  const [state, setState] = useState<{ key: string; venue: VenueConfig; legacy: boolean } | null>(null);

  useEffect(() => {
    let legacyUnsub: (() => void) | null = null;
    const stopLegacy = () => {
      legacyUnsub?.();
      legacyUnsub = null;
    };
    const unsub = onSnapshot(
      doc(db, "venues", venueId),
      (snap) => {
        if (snap.exists()) {
          stopLegacy();
          setState({ key: venueId, venue: { ...DEFAULT_VENUE_CONFIG, ...(snap.data() as Partial<VenueConfig>), id: venueId }, legacy: false });
          return;
        }
        if (venueId !== DEFAULT_VENUE_ID) {
          setState({ key: venueId, venue: { ...DEFAULT_VENUE_CONFIG, id: venueId }, legacy: false });
          return;
        }
        if (legacyUnsub) return;
        legacyUnsub = onSnapshot(
          doc(db, "app_config", "active_venue"),
          (legacy) =>
            setState({
              key: venueId,
              venue: { ...DEFAULT_VENUE_CONFIG, ...(legacy.exists() ? (legacy.data() as Partial<VenueConfig>) : {}), id: venueId },
              legacy: true,
            }),
          (err) => log.error("Mekan ayarları okunamadı:", err),
        );
      },
      (err) => {
        log.error("Mekan ayarları okunamadı:", err);
        setState({ key: venueId, venue: { ...DEFAULT_VENUE_CONFIG, id: venueId }, legacy: false });
      },
    );
    return () => {
      unsub();
      stopLegacy();
    };
  }, [venueId]);

  if (!state || state.key !== venueId) {
    return { venue: { ...DEFAULT_VENUE_CONFIG, id: venueId }, loading: true, legacy: false };
  }
  return { venue: state.venue, loading: false, legacy: state.legacy };
}
