/**
 * Firebase Emulator Suite REST yardımcıları. Yalnızca test kurulumunda ve
 * doğrulamada kullanılır; `Bearer owner` emülatörde kuralları atlar (gerçek
 * projede böyle bir anahtar yoktur). Uygulamanın kendisi her zaman
 * güvenlik kurallarına tabi istemci SDK'sıyla konuşur.
 */
export const PROJECT_ID = "demo-hurrem-e2e";
const FIRESTORE = "http://127.0.0.1:8080";
const AUTH = "http://127.0.0.1:9099";
const METER = "http://127.0.0.1:8081";
const DOCS = `${FIRESTORE}/v1/projects/${PROJECT_ID}/databases/(default)/documents`;
const OWNER = { Authorization: "Bearer owner", "Content-Type": "application/json" };

type FsValue =
  | { stringValue: string }
  | { integerValue: string }
  | { doubleValue: number }
  | { booleanValue: boolean }
  | { nullValue: null }
  | { timestampValue: string }
  | { arrayValue: { values?: FsValue[] } }
  | { mapValue: { fields?: Record<string, FsValue> } };

export type Plain = Record<string, unknown>;

function fromFs(v: FsValue): unknown {
  if ("stringValue" in v) return v.stringValue;
  if ("integerValue" in v) return Number(v.integerValue);
  if ("doubleValue" in v) return v.doubleValue;
  if ("booleanValue" in v) return v.booleanValue;
  if ("nullValue" in v) return null;
  if ("timestampValue" in v) return v.timestampValue;
  if ("arrayValue" in v) return (v.arrayValue.values ?? []).map(fromFs);
  if ("mapValue" in v) return fromFields(v.mapValue.fields ?? {});
  return undefined;
}

function fromFields(fields: Record<string, FsValue>): Plain {
  return Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, fromFs(v)]));
}

function toFs(v: unknown): FsValue {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === "string") return { stringValue: v };
  if (typeof v === "boolean") return { booleanValue: v };
  if (typeof v === "number") {
    return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  }
  if (Array.isArray(v)) return { arrayValue: { values: v.map(toFs) } };
  return { mapValue: { fields: toFields(v as Plain) } };
}

function toFields(obj: Plain): Record<string, FsValue> {
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, toFs(v)]));
}

async function ok(res: Response, what: string): Promise<Response> {
  if (!res.ok) throw new Error(`${what}: HTTP ${res.status} ${await res.text()}`);
  return res;
}

export async function clearFirestore(): Promise<void> {
  await ok(await fetch(`${FIRESTORE}/emulator/v1/projects/${PROJECT_ID}/databases/(default)/documents`, { method: "DELETE" }), "clearFirestore");
}

export async function clearAuth(): Promise<void> {
  await ok(await fetch(`${AUTH}/emulator/v1/projects/${PROJECT_ID}/accounts`, { method: "DELETE" }), "clearAuth");
}

/** E-posta/şifre hesabı açar (emülatörde), uid döner. */
export async function createEmailUser(email: string, password: string): Promise<string> {
  const res = await ok(
    await fetch(`${AUTH}/identitytoolkit.googleapis.com/v1/accounts:signUp?key=demo-api-key`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    }),
    "createEmailUser",
  );
  return ((await res.json()) as { localId: string }).localId;
}

export async function adminSet(path: string, data: Plain): Promise<void> {
  await ok(
    await fetch(`${DOCS}/${path}`, { method: "PATCH", headers: OWNER, body: JSON.stringify({ fields: toFields(data) }) }),
    `adminSet ${path}`,
  );
}

/** Yalnızca verilen alanları günceller (adminSet belgenin tamamını değiştirir). */
export async function adminUpdate(path: string, data: Plain): Promise<void> {
  const mask = Object.keys(data)
    .map((k) => `updateMask.fieldPaths=${encodeURIComponent(k)}`)
    .join("&");
  await ok(
    await fetch(`${DOCS}/${path}?${mask}`, { method: "PATCH", headers: OWNER, body: JSON.stringify({ fields: toFields(data) }) }),
    `adminUpdate ${path}`,
  );
}

export async function adminGet(path: string): Promise<Plain | null> {
  const res = await fetch(`${DOCS}/${path}`, { headers: OWNER });
  if (res.status === 404) return null;
  await ok(res, `adminGet ${path}`);
  const body = (await res.json()) as { fields?: Record<string, FsValue> };
  return fromFields(body.fields ?? {});
}

/** Tek alan eşitliğiyle koleksiyon sorgusu (kuralları atlayarak). */
export async function adminQuery(
  collection: string,
  field: string,
  value: string | number,
): Promise<Array<Plain & { _id: string }>> {
  const res = await ok(
    await fetch(`${DOCS}:runQuery`, {
      method: "POST",
      headers: OWNER,
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: collection }],
          where: { fieldFilter: { field: { fieldPath: field }, op: "EQUAL", value: toFs(value) } },
        },
      }),
    }),
    `adminQuery ${collection}`,
  );
  const rows = (await res.json()) as Array<{ document?: { name: string; fields?: Record<string, FsValue> } }>;
  return rows
    .filter((r) => r.document)
    .map((r) => ({ _id: r.document!.name.split("/").pop()!, ...fromFields(r.document!.fields ?? {}) }));
}

export interface MeterStats {
  reads: number;
  removes: number;
  writes: number;
  deletes: number;
  elapsedMs: number;
  /** Onayı düşürülen cevap belgesi; `resent`: SDK onu yeni akışta yeniden gönderdi. */
  droppedAnswer: { name: string | null; resent: boolean };
}

export async function meterReset(): Promise<void> {
  await fetch(`${METER}/__meter/reset`, { method: "POST" });
}

export async function meterRead(): Promise<MeterStats> {
  return (await (await fetch(`${METER}/__meter`)).json()) as MeterStats;
}

/**
 * Bir sonraki cevap yazımı emülatöre ulaşır ama onayı telefona dönmez ve
 * Write akışı kopar (kafe wifi'si). Bkz. e2e/support/firestore-meter.mjs.
 */
export async function meterDropNextAnswerAck(): Promise<void> {
  await fetch(`${METER}/__meter/drop-next-answer-ack`, { method: "POST" });
}
