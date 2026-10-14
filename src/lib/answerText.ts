/**
 * Oyuncu cevabı metnini puanlamadan ve TV'de göstermeden önce temizler
 * (docs/roadmap.md, 2.9 — Sentinel'in yerine).
 *
 * Eski "Sentinel" iki şey yapıyordu, ikisi de yanlıştı:
 *  - Cevabı HTML-kaçışlıyordu. React zaten kaçışladığı için TV'de
 *    "Ankara'da" → "Ankara&#x27;da" görünüyor, puanlamaya da bozulmuş metin
 *    gidiyordu.
 *  - "İnsanüstü yazma hızı" için oyuncuyu sessizce banlıyordu, ama cevabı
 *    değil yalnızca toplam uzunluğunu (`"X".repeat(n)`) görüyordu ve gönderim
 *    zamanını istemci belirliyor: gerçek bir sinyal yoktu.
 * Hileye karşı asıl sınır Firestore kuralları (kimlik, oda durumu, alan
 * kümesi). Burada kalan iş, kuralların denetleyemediği metin içeriği: kural
 * dili haritadaki her değerin uzunluğunu sınırlayamıyor, kurcalanmış bir
 * istemci tek bir cevaba kilobaytlarca metin yazıp TV düzenini bozabiliyor.
 */

/** Oyuncu kumandasındaki giriş sınırı ile aynı (PlayerPlaying). */
export const MAX_ANSWER_LENGTH = 40;

// Kontrol karakterleri, sıfır genişlikli ve yön değiştiren (bidi) karakterler:
// ekranda görünmeyen ama eşleşmeyi bozan ya da metni ters çeviren işaretler.
// eslint-disable-next-line no-control-regex -- kontrol karakterlerini silmek bu ifadenin amacı
const INVISIBLE = /[\u0000-\u001F\u007F-\u009F\u00AD\u200B-\u200F\u2028-\u202E\u2060-\u2064\uFEFF]/g;

export function cleanAnswerText(value: unknown): string {
  if (typeof value !== "string") return "";
  return Array.from(
    value.normalize("NFC").replace(INVISIBLE, "").replace(/\s+/g, " ").trim(),
  )
    .slice(0, MAX_ANSWER_LENGTH)
    .join("")
    .trimEnd();
}

/** Bir cevap dokümanının `data` haritasını temizler (anahtarlar korunur). */
export function cleanAnswerData(data: unknown): Record<string, string> {
  if (!data || typeof data !== "object") return {};
  return Object.fromEntries(
    Object.entries(data as Record<string, unknown>).map(([key, value]) => [key, cleanAnswerText(value)]),
  );
}
