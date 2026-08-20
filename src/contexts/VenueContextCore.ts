import { createContext, useContext } from "react";
import { DEFAULT_VENUE_CONFIG, type VenueConfig } from "../types/database";

export interface VenueContextValue {
  venue: VenueConfig;
  loading: boolean;
}

export const VenueContext = createContext<VenueContextValue>({
  venue: DEFAULT_VENUE_CONFIG,
  loading: true,
});

export function useVenue(): VenueContextValue {
  return useContext(VenueContext);
}
