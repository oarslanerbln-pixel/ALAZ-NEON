import { useEffect } from "react";
import { useActiveVenue } from "../hooks/useActiveVenue";
import { VenueContext } from "./VenueContextCore";

/**
 * Aktif mekan markasını uygulama kökünde BİR KEZ dinler ve alt bileşenlere
 * context ile dağıtır — her tüketici kendi useActiveVenue()'sunu çağırsaydı
 * aynı dokümana N tane ayrı onSnapshot aboneliği açılırdı.
 *
 * Ayrıca mekânın rengini tek vurgu rengi olarak uygular: index.css'te
 * `--color-accent` bir Tailwind v4 @theme değişkeni ve eski neon adları ile
 * renkli aileler de ona bağlı; onu :root üzerinde ezmek tüm arayüzü tek
 * noktadan yeniden renklendiriyor.
 */
export function VenueProvider({ children }: { children: React.ReactNode }) {
  const { venue, loading } = useActiveVenue();

  useEffect(() => {
    const root = document.documentElement;
    if (venue.primary_color) {
      root.style.setProperty("--color-accent", venue.primary_color);
    } else {
      root.style.removeProperty("--color-accent");
    }
  }, [venue.primary_color]);

  return (
    <VenueContext.Provider value={{ venue, loading }}>
      {children}
    </VenueContext.Provider>
  );
}
