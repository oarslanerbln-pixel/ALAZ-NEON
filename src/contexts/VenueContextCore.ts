import { createContext, useContext } from "react";
import { DEFAULT_VENUE_CONFIG, type VenueConfig } from "../types/database";
import { DEFAULT_VENUE_ID } from "../lib/venues";

export interface VenueContextValue {
  /** Etkin mekanın ayarları; `venue.id` mekan kimliği. */
  venue: VenueConfig;
  loading: boolean;
  /**
   * Ayarlar hâlâ eski tek belgeden (`app_config/active_venue`) geliyor:
   * `venues/default` henüz göç ettirilmedi. Ayar sayfası o belgeye yazar.
   */
  legacy: boolean;
  /** Etkin mekan: odaya bağlı ekranda odanın mekanı, değilse cihazda seçili mekan. */
  venueId: string;
  /** Personelin seçtiği mekan (TV/yönetim); cihazda saklanır. */
  selectVenue: (venueId: string) => void;
  /** Odaya bağlı ekran (TV oyunu, misafir telefonu) odanın mekanını izler; null bırakır. */
  followRoomVenue: (venueId: string | null) => void;
}

export const VenueContext = createContext<VenueContextValue>({
  venue: { ...DEFAULT_VENUE_CONFIG, id: DEFAULT_VENUE_ID },
  loading: true,
  legacy: false,
  venueId: DEFAULT_VENUE_ID,
  selectVenue: () => {},
  followRoomVenue: () => {},
});

export function useVenue(): VenueContextValue {
  return useContext(VenueContext);
}
