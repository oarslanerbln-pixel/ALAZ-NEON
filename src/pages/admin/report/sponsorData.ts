import { collection, getDocs, query, where } from "firebase/firestore";

import { db } from "../../../lib/firebase";
import type { AdImpressionRecord } from "../../../lib/sponsorReport";

/** Mekanın aralıktaki sponsor gösterim kayıtları (docs/roadmap.md, 3.3). */
export async function loadAdImpressions(venueId: string, start: number, end: number): Promise<AdImpressionRecord[]> {
  const snap = await getDocs(
    query(
      collection(db, "ad_impressions"),
      where("venue_id", "==", venueId),
      where("created_at", ">=", start),
      where("created_at", "<=", end),
    ),
  );
  return snap.docs.map((d) => d.data() as AdImpressionRecord);
}
