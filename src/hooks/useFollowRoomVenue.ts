import { useEffect } from "react";

import { useVenue } from "../contexts/VenueContextCore";
import { venueIdOf } from "../lib/venues";
import type { Room } from "../types/database";

/**
 * Odaya bağlı ekran (TV oyunu, misafir telefonu) markayı, ödülü ve sponsor
 * reklamlarını odanın mekanından alır, cihazda seçili mekandan değil
 * (docs/design/3.1-cok-mekan.md). Ekrandan çıkınca seçili mekana dönülür.
 */
export function useFollowRoomVenue(room: Pick<Room, "venue_id"> | null | undefined): void {
  const { followRoomVenue } = useVenue();
  const venueId = room ? venueIdOf(room) : null;

  useEffect(() => {
    followRoomVenue(venueId);
  }, [venueId, followRoomVenue]);

  useEffect(() => () => followRoomVenue(null), [followRoomVenue]);
}
