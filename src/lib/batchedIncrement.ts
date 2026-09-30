/**
 * Hızlı dokunma oyunlarının (Renkler, Spektrum, Birlik) sayaç yazma kuralları.
 *
 * Dokunuşlar yerelde biriktirilip aralıklarla oyuncunun KENDİ dokümanına
 * `increment()` olarak yazılıyor. İki sınır var:
 *
 * - `firestore.rules` → isValidIncrement: tek yazmada en fazla
 *   MAX_CLICKS_PER_WRITE artış. Eskiden birikimin TAMAMI tek seferde
 *   gönderiliyordu; en hevesli oyuncu sınırı aşınca yazma reddediliyor, geri
 *   eklenen birikim bir sonraki denemede daha da büyüyordu — o oyuncunun
 *   o andan sonraki HİÇBİR dokunuşu sayılmıyordu.
 * - Firestore bir dokümana saniyede ~1 sürekli yazmayı kaldırıyor, ücretsiz
 *   plan da günde 20.000 yazma veriyor. Aralık bu yüzden 1 sn'nin altına
 *   inmemeli (Spektrum eskiden neredeyse her dokunuşta yazıyordu).
 */
export const MAX_CLICKS_PER_WRITE = 30;
export const CLICK_FLUSH_INTERVAL_MS = 1000;

/** Bekleyen dokunuşlardan bu yazmada gönderilecek kısmı ve kalanı ayırır. */
export function takeFlushChunk(
  pending: number,
  max: number = MAX_CLICKS_PER_WRITE,
): { flush: number; rest: number } {
  const safe = Math.max(0, Math.floor(pending));
  const flush = Math.min(safe, max);
  return { flush, rest: safe - flush };
}
