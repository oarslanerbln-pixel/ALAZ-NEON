/**
 * Yeni sürüm yayınlandıktan sonra açık kalmış bir sekme, artık sunucuda
 * olmayan eski bir chunk'ı istediğinde ne yapılacağı.
 *
 * TV gece boyunca aynı sekmede açık kalıyor; oyunlar tembel yüklendiği için
 * yayın sonrası ilk oyun değişikliğinde "Failed to fetch dynamically imported
 * module" hatasıyla ErrorBoundary ekranına düşüyordu. Sayfayı bir kez
 * yenilemek yeterli: oda durumu Firestore'da, oyuncu/oda kimlikleri
 * localStorage'da duruyor. Chunk gerçekten bozuksa sonsuz yenileme döngüsüne
 * girmemek için pencere başına tek deneme hakkı var.
 */

const KEY = "alaz_stale_chunk_reload_at";
export const STALE_CHUNK_RELOAD_WINDOW_MS = 60_000;

type StorageLike = Pick<Storage, "getItem" | "setItem">;

export function shouldReloadForStaleChunk(getStorage: () => StorageLike, now: number): boolean {
  try {
    const storage = getStorage();
    const last = Number(storage.getItem(KEY) ?? 0);
    if (now - last < STALE_CHUNK_RELOAD_WINDOW_MS) return false;
    storage.setItem(KEY, String(now));
    return true;
  } catch {
    // Depolama kapalıysa (gizli mod, engelli site verisi) döngüyü
    // önleyemeyiz — yenilemeyip hatayı ErrorBoundary'e bırakıyoruz.
    return false;
  }
}
