import { useEffect } from "react";
import { useActiveVenue } from "../hooks/useActiveVenue";
import { VenueContext } from "./VenueContextCore";

/**
 * Aktif mekan markasını uygulama kökünde BİR KEZ dinler ve alt bileşenlere
 * context ile dağıtır — her tüketici kendi useActiveVenue()'sunu çağırsaydı
 * aynı dokümana N tane ayrı onSnapshot aboneliği açılırdı.
 *
 * Ayrıca ana vurgu rengini burada CSS değişkenine uygular: index.css'te
 * `--color-alaz-orange` bir Tailwind v4 @theme değişkeni olduğu için, onu
 * :root üzerinde ezmek `bg-alaz-orange`/`text-alaz-orange`/`border-alaz-orange`
 * kullanan HER bileşeni tek noktadan yeniden renklendiriyor — component
 * component renk sınıfı değiştirmeye gerek kalmıyor.
 */
export function VenueProvider({ children }: { children: React.ReactNode }) {
  const { venue, loading } = useActiveVenue();

  useEffect(() => {
    const root = document.documentElement;
    if (venue.primary_color) {
      root.style.setProperty("--color-alaz-orange", venue.primary_color);
    } else {
      root.style.removeProperty("--color-alaz-orange");
    }
  }, [venue.primary_color]);

  return (
    <VenueContext.Provider value={{ venue, loading }}>
      {children}
    </VenueContext.Provider>
  );
}
