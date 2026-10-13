import { increment } from "firebase/firestore";

/**
 * Oyuncu skorlarının tek yazım kapısı.
 *
 * İki skor var:
 *  - `total_score`: o anki OYUNUN skoru — oyunların çoğu başlarken sıfırlıyor.
 *  - `night_score`: GECE boyunca birikir; TV ana ekranındaki "gecenin
 *    liderleri" listesi buna bakar.
 *
 * Eskiden `night_score`'a katılım anındaki 0 dışında hiçbir yer yazmıyordu:
 * TV ana ekranı gece boyu herkese "0 Puan" gösteriyordu. Puan veren her yol
 * artık buradan geçiyor ve kazanılan puan iki skora birlikte ekleniyor.
 *
 * Yalnızca host yazar (firestore.rules: oyuncu `night_score`'a dokunamaz).
 */

/** Kazanılan puanı iki skora birlikte ekleyen alanlar. */
export function pointsFields(points: number) {
  const p = Math.max(0, Math.round(points));
  return { total_score: increment(p), night_score: increment(p) };
}

/** Mutlak skor yazımında gecelik skora eklenecek artış (azalış sayılmaz). */
export function nightScoreDelta(prevTotal: number | undefined, nextTotal: number): number {
  return Math.max(0, Math.round(nextTotal - (prevTotal ?? 0)));
}

/**
 * Oyun skorunu mutlak değerle yazan eski yollar için (quiz, arena, sensör,
 * bomba): yeni toplam + gecelik skora yalnızca artış kadar ekleme.
 * Sıfırlama (`nextTotal` < önceki) gecelik skoru düşürmez.
 */
export function totalScoreFields(prevTotal: number | undefined, nextTotal: number) {
  const delta = nightScoreDelta(prevTotal, nextTotal);
  return delta > 0 ? { total_score: nextTotal, night_score: increment(delta) } : { total_score: nextTotal };
}
