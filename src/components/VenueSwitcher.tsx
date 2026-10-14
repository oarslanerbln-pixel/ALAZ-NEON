import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";

import { db } from "../lib/firebase";
import { useLocale } from "../hooks/useLocale";
import { useVenue } from "../contexts/VenueContextCore";

/** Mekan adları (mekan belgesi herkese açık); okunamayan mekan kimliğiyle görünür. */
function useVenueNames(venues: string[] | undefined): Record<string, string> {
  const [names, setNames] = useState<Record<string, string>>({});
  const key = venues?.join(",") ?? "";

  useEffect(() => {
    if (!key) return;
    let alive = true;
    Promise.all(
      key.split(",").map(async (id) => {
        const snap = await getDoc(doc(db, "venues", id)).catch(() => null);
        const name = snap?.exists() ? snap.data().name : null;
        return [id, typeof name === "string" && name.trim() ? name : id] as const;
      }),
    ).then((entries) => {
      if (alive) setNames(Object.fromEntries(entries));
    });
    return () => {
      alive = false;
    };
  }, [key]);

  return names;
}

/**
 * Birden çok mekanda personel olan hesap için mekan seçimi
 * (docs/design/3.1-cok-mekan.md, D6). Seçim cihazda saklanır; TV her
 * açılışta aynı mekanla gelir. Tek mekanlı hesapta görünmez.
 */
export function VenueSwitcher({ venues }: { venues: string[] | undefined }) {
  const { t } = useLocale();
  const { venueId, selectVenue } = useVenue();
  const names = useVenueNames(venues);

  if (!venues || venues.length === 0) return null;
  const current = venues.includes(venueId);
  if (current && venues.length === 1) return null;

  return (
    <label className="inline-flex items-center gap-2 text-[11px] uppercase tracking-widest text-white/50">
      <span aria-hidden="true">{t("venue.switch")}</span>
      <select
        aria-label={t("venue.switch")}
        value={current ? venueId : ""}
        onChange={(e) => selectVenue(e.target.value)}
        className="bg-black border border-white/20 rounded-lg px-3 py-2 text-white text-sm normal-case tracking-normal"
      >
        {!current && (
          <option value="" disabled>
            {t("venue.choose")}
          </option>
        )}
        {venues.map((id) => (
          <option key={id} value={id}>
            {names[id] ?? id}
          </option>
        ))}
      </select>
    </label>
  );
}
