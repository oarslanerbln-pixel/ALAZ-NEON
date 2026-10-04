/**
 * Emulator yardımcıları: durum sıfırlama, personel hesabı ve veri okuma.
 *
 * Firestore'a `Authorization: Bearer owner` ile gidilir: emulator bu jetonla
 * güvenlik kurallarını atlar. Yalnızca test hazırlığı ve doğrulama için;
 * uygulamanın kendisi her zaman kurallardan geçer.
 */
export const PROJECT_ID = "demo-hengame";
const FIRESTORE = "http://127.0.0.1:8080";
const AUTH = "http://127.0.0.1:9099";
const API_KEY = "demo-api-key";
const DOCS = `${FIRESTORE}/v1/projects/${PROJECT_ID}/databases/(default)/documents`;
const OWNER = { Authorization: "Bearer owner" };

async function ok(res: Response, what: string): Promise<Response> {
  if (!res.ok) throw new Error(`${what}: ${res.status} ${await res.text()}`);
  return res;
}

export async function resetEmulators(): Promise<void> {
  await ok(
    await fetch(`${FIRESTORE}/emulator/v1/projects/${PROJECT_ID}/databases/(default)/documents`, {
      method: "DELETE",
    }),
    "Firestore sıfırlanamadı",
  );
  await ok(
    await fetch(`${AUTH}/emulator/v1/projects/${PROJECT_ID}/accounts`, { method: "DELETE" }),
    "Auth sıfırlanamadı",
  );
}

/** E-posta/şifre hesabı açar ve staff/{uid} kaydını (Console'daki adımın karşılığı) yazar. */
export async function createStaffAccount(email: string, password: string): Promise<string> {
  const res = await ok(
    await fetch(`${AUTH}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    }),
    "Personel hesabı açılamadı",
  );
  const { localId } = (await res.json()) as { localId: string };
  await ok(
    await fetch(`${DOCS}/staff?documentId=${localId}`, {
      method: "POST",
      headers: { ...OWNER, "Content-Type": "application/json" },
      body: JSON.stringify({ fields: { added_at: { integerValue: String(Date.now()) } } }),
    }),
    "staff kaydı yazılamadı",
  );
  return localId;
}

type FirestoreValue =
  | { stringValue: string }
  | { integerValue: string }
  | { doubleValue: number }
  | { booleanValue: boolean }
  | { nullValue: null }
  | { mapValue: { fields?: Record<string, FirestoreValue> } }
  | { arrayValue: { values?: FirestoreValue[] } }
  | { timestampValue: string };

function decode(value: FirestoreValue): unknown {
  if ("stringValue" in value) return value.stringValue;
  if ("integerValue" in value) return Number(value.integerValue);
  if ("doubleValue" in value) return value.doubleValue;
  if ("booleanValue" in value) return value.booleanValue;
  if ("nullValue" in value) return null;
  if ("timestampValue" in value) return value.timestampValue;
  if ("arrayValue" in value) return (value.arrayValue.values ?? []).map(decode);
  return Object.fromEntries(
    Object.entries(value.mapValue.fields ?? {}).map(([k, v]) => [k, decode(v)]),
  );
}

/** Bir dokümanı kurallardan bağımsız okur; yoksa null. */
export async function readDoc(path: string): Promise<Record<string, unknown> | null> {
  const res = await fetch(`${DOCS}/${path}`, { headers: OWNER });
  if (res.status === 404) return null;
  await ok(res, `${path} okunamadı`);
  const body = (await res.json()) as { fields?: Record<string, FirestoreValue> };
  return Object.fromEntries(
    Object.entries(body.fields ?? {}).map(([k, v]) => [k, decode(v)]),
  );
}

/** `collection` içinde `field == value` olan dokümanlar (kimlik `id` alanında). */
export async function queryDocs(
  collection: string,
  field: string,
  value: string,
): Promise<Record<string, unknown>[]> {
  const res = await ok(
    await fetch(`${DOCS}:runQuery`, {
      method: "POST",
      headers: { ...OWNER, "Content-Type": "application/json" },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: collection }],
          where: { fieldFilter: { field: { fieldPath: field }, op: "EQUAL", value: { stringValue: value } } },
        },
      }),
    }),
    `${collection} sorgulanamadı`,
  );
  const rows = (await res.json()) as { document?: { name: string; fields?: Record<string, FirestoreValue> } }[];
  return rows
    .filter((row) => row.document)
    .map(({ document }) => ({
      id: document!.name.split("/").pop(),
      ...Object.fromEntries(Object.entries(document!.fields ?? {}).map(([k, v]) => [k, decode(v)])),
    }));
}
