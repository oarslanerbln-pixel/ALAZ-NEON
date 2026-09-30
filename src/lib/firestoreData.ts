/**
 * Firestore'a yazılacak veriyle ilgili saf yardımcılar.
 */

/**
 * Değeri `undefined` olan alanları atar (sığ).
 *
 * Firestore SDK'sı `ignoreUndefinedProperties` açık değilse `undefined`
 * içeren bir yazmayı AĞ İSTEĞİ YAPMADAN, senkron olarak reddediyor
 * ("Unsupported field value: undefined"). `Partial<Room>` tipindeki güncelleme
 * nesneleri bunu davet ediyor: Kelime Arenası'nda ikinci tura geçiş
 * `tutorial_step: undefined` taşıdığı için her seferinde reddediliyor ve TV
 * hata ekranına düşüyordu. Alanı silmek isteyen çağıran `deleteField()`
 * kullanmalı; `undefined` "bu alana dokunma" demek.
 */
export function withoutUndefined<T extends object>(fields: T): Partial<T> {
  return Object.fromEntries(
    Object.entries(fields).filter(([, value]) => value !== undefined),
  ) as Partial<T>;
}

/** Tek bir `writeBatch` en fazla bu kadar işlem taşıyabiliyor. */
export const FIRESTORE_BATCH_LIMIT = 500;

/** Diziyi en fazla `size` elemanlı parçalara böler. */
export function chunk<T>(items: readonly T[], size: number): T[][] {
  if (size < 1) throw new RangeError("chunk size must be >= 1");
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}
