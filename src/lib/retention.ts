import { Timestamp } from "firebase/firestore";

/**
 * Veri saklama süresi.
 *
 * Kod tabanında tek bir `deleteDoc` yok: odalar, oyuncular ve cevaplar
 * sonsuza kadar birikiyordu. Her gece oynayan bir kafede bu hem maliyet
 * hem de oda kodu çakışma olasılığını sürekli büyüten bir yük.
 *
 * Temizlik Firestore'un kendi TTL politikasına bırakılıyor: aşağıdaki
 * `expires_at` alanı dokümana yazılıyor, Google Cloud tarafında bu alan
 * için bir TTL politikası tanımlanınca silme işini Firestore yapıyor.
 * Cloud Functions gerekmiyor — proje Spark (ücretsiz) planında kalabiliyor.
 * Kurulum adımları README'de.
 *
 * 90 gün seçildi çünkü gecelik rapor ekranının en geniş aralığı "bu ay"
 * (~30 gün); daha kısa bir süre raporu sessizce boşaltırdı. Bu sabit tek
 * yerde: işletme daha kısa/uzun bir süre isterse burayı değiştirmek yeterli.
 */
export const DATA_RETENTION_DAYS = 90;

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Yeni yazılan bir dokümanın ne zaman silinebileceğini döndürür.
 *
 * Firestore TTL politikası alanın **Timestamp** tipinde olmasını şart
 * koşuyor; projedeki diğer zaman alanları (created_at, earned_at) düz
 * milisaniye sayısı olduğu için bu alan bilerek farklı tipte.
 */
export function retentionExpiry(now: number = Date.now()): Timestamp {
  return Timestamp.fromMillis(now + DATA_RETENTION_DAYS * DAY_MS);
}
