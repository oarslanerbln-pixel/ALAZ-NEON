import { addDoc, collection } from "firebase/firestore";

import { db } from "../lib/firebase";
import { adImpressionPayload } from "../lib/clientWrites";
import { createLogger } from "../lib/logger";
import type { Room, SponsorAd } from "../types/database";

const log = createLogger("AdImpressions");

/**
 * Sponsor gösterim kaydı (proof-of-play, docs/roadmap.md 3.3). Reklam arasını
 * bekletmez; yazılamazsa yalnızca uyarı düşer.
 */
export function recordAdImpression(args: {
  ad: SponsorAd;
  room: Pick<Room, "id" | "host_uid">;
  startedAt: number;
  shownMs: number;
  plannedMs: number;
  completed: boolean;
  audience: number;
}): void {
  if (!args.room.host_uid) return;
  const payload = adImpressionPayload({
    ad: { id: args.ad.id, sponsor_name: args.ad.sponsor_name, type: args.ad.type },
    roomId: args.room.id,
    hostUid: args.room.host_uid,
    startedAt: args.startedAt,
    shownMs: args.shownMs,
    plannedMs: args.plannedMs,
    completed: args.completed,
    audience: args.audience,
  });
  addDoc(collection(db, "ad_impressions"), payload).catch((err) => log.warn("Gösterim kaydı yazılamadı:", err));
}
