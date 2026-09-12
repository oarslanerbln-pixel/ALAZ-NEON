import { t } from "./i18n";

/**
 * Odadaki Echo sorusunu gösterilecek metne çevirir.
 *
 * Yeni odalar bir çeviri anahtarı ("echo.q3") saklıyor; bu değişiklikten
 * önce açılmış odalarda düz Türkçe metin duruyor. İkisi de burada
 * karşılanıyor, böylece eski odalar bozulmadan çalışmaya devam ediyor.
 */
export function echoQuestionText(stored: string | null | undefined): string {
  if (!stored) return "";
  return stored.startsWith("echo.q") ? t(stored as Parameters<typeof t>[0]) : stored;
}
