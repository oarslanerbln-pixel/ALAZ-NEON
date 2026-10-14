import { captureException } from "./monitoring";
import { createLogger } from "./logger";

const log = createLogger("yazma");

/**
 * Yazma sözleşmesi ihlali sayılan Firestore hata kodları: kural reddi ya da
 * geçersiz veri. Bunlar bir hata (istemci ile kural ayrışmış), bağlantı
 * kopması gibi geçici durumlar değil.
 */
const CONTRACT_ERROR_CODES = new Set(["permission-denied", "invalid-argument", "failed-precondition"]);

export function isContractViolation(err: unknown): boolean {
  const code = (err as { code?: unknown } | null)?.code;
  return typeof code === "string" && CONTRACT_ERROR_CODES.has(code);
}

/**
 * Bir istemci yazması başarısız olduğunda tek raporlama noktası.
 *
 * Kural/istemci uyuşmazlıkları yıllarca yalnızca tarayıcı konsoluna
 * düşüyordu: overload savuşturması, emoji tepkileri, çark ve unity canlıda
 * sessizce reddedildi ve kimse fark etmedi. Sözleşme ihlali artık Sentry'ye
 * yazmanın adıyla gidiyor (DSN yoksa no-op; bkz. lib/monitoring.ts).
 */
export function reportWriteError(write: string, err: unknown): void {
  // Konsol çıkışı her durumda; izlemeye yalnızca sözleşme ihlali gider.
  // Bağlantı kopması gibi durumları Firestore kendisi yeniden deniyor.
  log.warn(`${write} başarısız:`, err);
  if (isContractViolation(err)) {
    captureException(err, { tags: { write, code: String((err as { code: string }).code) } });
  }
}
