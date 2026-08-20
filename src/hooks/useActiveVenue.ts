import { useState, useEffect } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";
import { DEFAULT_VENUE_CONFIG, type VenueConfig } from "../types/database";

const ACTIVE_VENUE_PATH = ["app_config", "active_venue"] as const;

/**
 * O anda "aktif" mekan markasını canlı dinler (app_config/active_venue).
 *
 * Oda oluşturulmadan önceki ekranlarda (landing, login, host kurulumu)
 * kullanılır — satıcı bir mekana giderken bu tek dokümanı güncelleyip
 * tüm bu ekranların markasını demoya özel değiştirir. Doküman hiç
 * oluşturulmamışsa (ilk kurulum) varsayılan HENGAME markasına düşer.
 */
export function useActiveVenue(): { venue: VenueConfig; loading: boolean } {
  const [venue, setVenue] = useState<VenueConfig>(DEFAULT_VENUE_CONFIG);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, ...ACTIVE_VENUE_PATH),
      (snap) => {
        setVenue(snap.exists() ? { ...DEFAULT_VENUE_CONFIG, ...snap.data() } as VenueConfig : DEFAULT_VENUE_CONFIG);
        setLoading(false);
      },
      (err) => {
        console.error("[useActiveVenue] Mekan ayarları okunamadı:", err);
        setLoading(false);
      },
    );
    return () => unsubscribe();
  }, []);

  return { venue, loading };
}
