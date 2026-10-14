import { useEffect, useState } from "react";
import { collection, deleteDoc, doc, onSnapshot, setDoc } from "firebase/firestore";

import { db } from "../lib/firebase";
import { venueStaffPayload } from "../lib/clientWrites";
import { createLogger } from "../lib/logger";

const log = createLogger("VenueStaff");

export interface VenueStaffMember {
  uid: string;
  role: "owner" | "staff";
  addedAt: number;
}

/**
 * Mekanın personel listesi (`venues/{v}/staff`, docs/design/3.1-cok-mekan.md).
 * Okuma mekanın personeline açık; ekleme/çıkarma yalnızca sahibe ve yalnızca
 * "staff" rolü için (firestore.rules). `venueId` null iken dinlemez.
 */
export function useVenueStaff(venueId: string | null): VenueStaffMember[] | null {
  const [list, setList] = useState<{ venueId: string; members: VenueStaffMember[] } | null>(null);

  useEffect(() => {
    if (!venueId) return;
    return onSnapshot(
      collection(db, "venues", venueId, "staff"),
      (snap) =>
        setList({
          venueId,
          members: snap.docs
            .map((d) => {
              const data = d.data();
              return {
                uid: d.id,
                role: data.role === "owner" ? ("owner" as const) : ("staff" as const),
                addedAt: typeof data.added_at === "number" ? data.added_at : 0,
              };
            })
            .sort((a, b) => (a.role === b.role ? a.addedAt - b.addedAt : a.role === "owner" ? -1 : 1)),
        }),
      (err) => {
        log.error("Personel listesi okunamadı:", err);
        setList({ venueId, members: [] });
      },
    );
  }, [venueId]);

  return venueId && list?.venueId === venueId ? list.members : null;
}

export function addVenueStaff(venueId: string, uid: string, addedBy: string): Promise<void> {
  return setDoc(doc(db, "venues", venueId, "staff", uid), venueStaffPayload({ uid, role: "staff", addedBy }));
}

export function removeVenueStaff(venueId: string, uid: string): Promise<void> {
  return deleteDoc(doc(db, "venues", venueId, "staff", uid));
}
