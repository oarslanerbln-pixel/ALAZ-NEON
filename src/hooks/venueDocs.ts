import { collection, getDocs, query, where, type QueryConstraint, type QueryDocumentSnapshot } from "firebase/firestore";

import { db } from "../lib/firebase";
import { DEFAULT_VENUE_ID } from "../lib/venues";

/**
 * Mekana süzülmüş belge okuma (docs/design/3.1-cok-mekan.md).
 *
 * Kurallar sorguyu süzmez, sorgunun kendisi `venue_id ==` taşımalı; yoksa
 * başka mekanın personeli için sorgu toptan reddedilir.
 *
 * Geçiş (aşama A): `venue_id` taşımayan eski kayıt `default` mekanındır. Bu
 * yüzden `default` için ikinci, süzgeçsiz bir sorgu da atılır ve yalnızca
 * mekansız kayıtlar alınır. Global personel kuralı kalkınca (aşama C) o
 * sorgu reddedilir; geri doldurma yapılmış olacağı için kayıp olmaz.
 */
export async function loadVenueDocs(
  name: string,
  venueId: string,
  ...constraints: QueryConstraint[]
): Promise<QueryDocumentSnapshot[]> {
  const scoped = getDocs(query(collection(db, name), where("venue_id", "==", venueId), ...constraints));
  if (venueId !== DEFAULT_VENUE_ID) return (await scoped).docs;

  const legacy = getDocs(query(collection(db, name), ...constraints))
    .then((snap) => snap.docs.filter((d) => d.data().venue_id === undefined))
    .catch(() => [] as QueryDocumentSnapshot[]);
  const [current, old] = await Promise.all([scoped, legacy]);
  return [...current.docs, ...old];
}
