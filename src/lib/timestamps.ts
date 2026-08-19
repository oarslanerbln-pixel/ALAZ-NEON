import { Timestamp } from "firebase/firestore";
import type { FieldValue } from "firebase/firestore";

/**
 * Normalizes the different shapes `Answer.created_at` can take — a resolved
 * Firestore Timestamp, an ISO string (scattegories writes these directly),
 * or a not-yet-committed FieldValue from serverTimestamp() (quiz) — into
 * milliseconds since epoch, so callers can sort/compare without caring which
 * shape they got.
 *
 * A pending FieldValue has no timestamp info available client-side yet, so
 * it's treated as "now" rather than "epoch zero" — falling back to zero
 * would make it look like the oldest answer and wrongly hand it the
 * early-submit bonus.
 */
export function toMillis(
  value: string | Timestamp | FieldValue | undefined | null,
): number {
  if (!value) return 0;
  if (value instanceof Timestamp) return value.toMillis();
  if (typeof value === "string") {
    const parsed = new Date(value).getTime();
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return Date.now();
}
