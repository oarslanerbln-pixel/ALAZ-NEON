import { collection, getDocs, query, where } from "firebase/firestore";

import { db } from "../../../lib/firebase";
import { computeVenueKpis, type GameEventRecord, type VenueKpis } from "../../../lib/venueKpis";

/** Firestore `in` sorgusu en fazla 30 değer alır. */
const IN_LIMIT = 30;
/** Geri dönen misafir taraması için üst sınır (sorgu sayısı = sınır / 30). */
const MAX_GUESTS_SCANNED = 300;

/**
 * Raporun KPI verisi (docs/roadmap.md, 3.2): aralıktaki oyun olayları ve
 * misafirlerin daha önceki kayıtları. Oyuncu kayıtları 90 gün tutulduğu için
 * "geri dönen" son 90 gün içinde önceden oynamış demek.
 */
export async function loadVenueKpis(args: {
  start: number;
  end: number;
  nightCount: number;
  guestUids: string[];
}): Promise<VenueKpis> {
  const eventsSnap = await getDocs(
    query(collection(db, "events"), where("created_at", ">=", args.start), where("created_at", "<=", args.end)),
  );
  const events = eventsSnap.docs.map((d) => d.data() as GameEventRecord);

  const unique = [...new Set(args.guestUids.filter(Boolean))].slice(0, MAX_GUESTS_SCANNED);
  const chunks: string[][] = [];
  for (let i = 0; i < unique.length; i += IN_LIMIT) chunks.push(unique.slice(i, i + IN_LIMIT));
  const snaps = await Promise.all(
    chunks.map((chunk) => getDocs(query(collection(db, "players"), where("uid", "in", chunk)))),
  );
  const priorGuestUids = new Set<string>();
  for (const snap of snaps) {
    for (const d of snap.docs) {
      const data = d.data() as { uid?: string; created_at?: number };
      if (data.uid && typeof data.created_at === "number" && data.created_at < args.start) priorGuestUids.add(data.uid);
    }
  }

  return computeVenueKpis({ events, nightCount: args.nightCount, guestUids: args.guestUids, priorGuestUids });
}
