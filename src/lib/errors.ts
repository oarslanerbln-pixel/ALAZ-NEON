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
