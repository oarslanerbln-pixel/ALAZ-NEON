import { useCallback, useEffect, useMemo, useState } from "react";
import { useVenueConfig } from "../hooks/useActiveVenue";
import { DEFAULT_VENUE_ID, VENUE_ID_PATTERN } from "../lib/venues";
import { VenueContext } from "./VenueContextCore";

const STORAGE_KEY = "hengame_venue_id";

function savedVenueId(): string {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && (saved === DEFAULT_VENUE_ID || VENUE_ID_PATTERN.test(saved))) return saved;
  } catch {
    // Gizli sekme / engelli depolama: varsayılan mekan.
  }
  return DEFAULT_VENUE_ID;
}

/**
 * Etkin mekanı uygulama kökünde BİR KEZ dinler ve dağıtır (her tüketici kendi
 * aboneliğini açmasın). Etkin mekan: odaya bağlı ekranda odanın mekanı
 * (`followRoomVenue`), değilse personelin cihazda seçtiği mekan
 * (`selectVenue`; docs/design/3.1-cok-mekan.md).
 *
 * Ayrıca ana vurgu rengini burada CSS değişkenine uygular: index.css'te
 * `--color-alaz-orange` bir Tailwind v4 @theme değişkeni olduğu için, onu
 * :root üzerinde ezmek `bg-alaz-orange`/`text-alaz-orange`/`border-alaz-orange`
 * kullanan HER bileşeni tek noktadan yeniden renklendiriyor.
 */
export function VenueProvider({ children }: { children: React.ReactNode }) {
  const [selected, setSelected] = useState(savedVenueId);
  const [roomVenue, setRoomVenue] = useState<string | null>(null);
  const venueId = roomVenue ?? selected;
  const { venue, loading, legacy } = useVenueConfig(venueId);

  const selectVenue = useCallback((id: string) => {
    setSelected(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // Saklanamazsa seçim yalnızca bu oturumda geçerli.
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (venue.primary_color) {
      root.style.setProperty("--color-alaz-orange", venue.primary_color);
    } else {
      root.style.removeProperty("--color-alaz-orange");
    }
  }, [venue.primary_color]);

  const value = useMemo(
    () => ({ venue, loading, legacy, venueId, selectVenue, followRoomVenue: setRoomVenue }),
    [venue, loading, legacy, venueId, selectVenue],
  );
  return <VenueContext.Provider value={value}>{children}</VenueContext.Provider>;
}
