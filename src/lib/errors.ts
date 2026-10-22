/**
 * `catch (err: any)` yerine kullanılan güvenli hata mesajı çıkarıcı.
 * TypeScript'te catch parametresi `unknown` olmalı; bu yardımcı
 * her tipten okunabilir bir mesaj üretir.
 */
export function errorMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  if (typeof err === "string") return err;
  if (err && typeof err === "object" && "message" in err) {
    return String((err as { message: unknown }).message);
  }
  return String(err);
}

/**
 * Firestore "already-exists" hatası mı.
 *
 * `addDoc` belgeyi "yoksa oluştur" koşuluyla, istemcide üretilen rastgele
 * kimlikle yazar. Yazım sunucuya ulaşıp onayı yolda kaybolunca (kafe
 * wifi'si) SDK yazımı yeni akışta yeniden gönderir ve sunucu "zaten var"
 * der. Kimlik rastgele olduğu için bu, aynı yazımın ilk denemesinin kayda
 * geçtiği anlamına gelir: çağıran taraf başarı saymalı.
 */
export function isAlreadyExists(err: unknown): boolean {
  return typeof err === "object" && err !== null && (err as { code?: unknown }).code === "already-exists";
}
