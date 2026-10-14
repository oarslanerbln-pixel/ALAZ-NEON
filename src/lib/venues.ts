/**
 * Çok mekan (docs/design/3.1-cok-mekan.md). Bu sürümden önce açılmış oda ve
 * ödüllerde mekan yok: hepsi `default` mekana aittir (göçte de öyle yazılır).
 */
export const DEFAULT_VENUE_ID = "default";

/** Mekan kimliği biçimi: küçük harf, rakam ve tire (TV'de ve raporda görünür). */
export const VENUE_ID_PATTERN = /^[a-z0-9][a-z0-9-]{1,39}$/;

export function venueIdOf(record: { venue_id?: string | null } | null | undefined): string {
  return record?.venue_id || DEFAULT_VENUE_ID;
}

/** Firebase Auth kimliği biçimi (personel eklerken elle girilir; yazım hatası erken yakalansın). */
const UID_PATTERN = /^[A-Za-z0-9]{20,128}$/;

export type StaffUidIssue = "invalid" | "self" | "exists";

/** Sahibin girdiği kimlik eklenebilir mi; kural da aynısını reddeder, bu yalnızca anlaşılır mesaj için. */
export function staffUidIssue(uid: string, ownUid: string, existing: readonly string[]): StaffUidIssue | null {
  if (!UID_PATTERN.test(uid)) return "invalid";
  if (uid === ownUid) return "self";
  if (existing.includes(uid)) return "exists";
  return null;
}
