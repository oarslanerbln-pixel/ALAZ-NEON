/**
 * Oda dokümanındaki oyuncu sayacının (`rooms.player_count`) yeni değeri.
 *
 * Lobideki her telefon eskiden yalnızca bu sayıyı göstermek için odanın
 * bütün `players` sorgusunu dinliyordu. Her oyuncunun canlılık sinyali o
 * dinleyicilerin hepsine birer okuma olarak düşüyordu: okuma sayısı oyuncu
 * sayısının karesiyle büyüyor, 30 kişilik bir lobi Spark'ın günlük
 * kotasını dakikalar içinde bitiriyordu (bkz. docs/roadmap.md, M1). Artık
 * sayıyı yalnızca host yazıyor ve yalnızca katılım/ayrılmada değişiyor.
 *
 * `null` → yazmaya gerek yok. Oyuncu listesi henüz yüklenmediyse yazılmıyor:
 * boş başlangıç listesi bir an için "0 oyuncu" yazdırırdı.
 */
export function playerCountUpdate(
  stored: number | undefined,
  actual: number,
  playersLoaded: boolean,
): number | null {
  if (!playersLoaded) return null;
  return stored === actual ? null : actual;
}
