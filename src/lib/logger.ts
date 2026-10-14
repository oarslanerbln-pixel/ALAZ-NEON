/**
 * Uygulama günlüğü (docs/roadmap.md, 2.4). `console.*` yerine kullanılır;
 * ESLint `no-console` kuralı bunu zorunlu kılar.
 *
 * Eskiden 87 `console.error/warn` çağrısı vardı ve hiçbiri bize ulaşmıyordu:
 * mekanda bir TV'de ödül dağıtımı başarısız olsa yalnızca o TV'nin
 * konsolunda bir satır kalıyordu. Şimdi:
 *  - `error`: konsola yazar ve hatayı kapsam etiketiyle izlemeye gönderir.
 *    Geçici ağ durumları (bağlantı koptu, zaman aşımı) gönderilmez; mekan
 *    Wi-Fi'ında bunlar olağan ve Firestore kendisi yeniden dener. Bir
 *    kapsamdan oturum başına en fazla `MAX_REPORTS_PER_SCOPE` hata gider,
 *    döngüye giren bir hata ücretsiz kotayı tüketmesin.
 *  - `warn`: yalnızca konsol (beklenen, kurtarılmış durumlar: ses dosyası
 *    yok → synth'e düşüldü gibi).
 */
import { captureException } from "./monitoring";

/** Firestore'un kendi yeniden denediği / kullanıcının ağına bağlı kodlar. */
const TRANSIENT_CODES = new Set(["unavailable", "deadline-exceeded", "cancelled"]);
const MAX_REPORTS_PER_SCOPE = 5;

const reportsByScope = new Map<string, number>();

function errorCode(value: unknown): string | undefined {
  const code = (value as { code?: unknown } | null)?.code;
  return typeof code === "string" ? code : undefined;
}

export function isTransientError(value: unknown): boolean {
  const code = errorCode(value);
  if (code && TRANSIENT_CODES.has(code.replace(/^firestore\//, ""))) return true;
  // Tarayıcının fetch/ağ hataları ("Failed to fetch", "NetworkError …").
  return value instanceof TypeError && /fetch|network/i.test(value.message);
}

/** Argümanlardan raporlanacak hatayı seçer: ilk Error ya da `code` taşıyan nesne. */
function pickError(args: unknown[]): unknown {
  return args.find((a) => a instanceof Error || errorCode(a) !== undefined);
}

export interface Logger {
  error: (...args: unknown[]) => void;
  warn: (...args: unknown[]) => void;
}

/**
 * Kapsamlı bir günlükçü üretir. Yöntemler ok fonksiyonu: `.catch(log.error)`
 * gibi geri çağırma olarak verilebilir.
 */
export function createLogger(scope: string): Logger {
  return {
    error: (...args) => {
      // eslint-disable-next-line no-console -- günlüğün tek konsol çıkışı
      console.error(`[${scope}]`, ...args);

      const error = pickError(args);
      if (isTransientError(error)) return;
      const sent = reportsByScope.get(scope) ?? 0;
      if (sent >= MAX_REPORTS_PER_SCOPE) return;
      reportsByScope.set(scope, sent + 1);

      const message = args.filter((a) => typeof a === "string").join(" ");
      const code = errorCode(error);
      captureException(error ?? new Error(message || scope), {
        tags: { scope, ...(code ? { code } : {}) },
        ...(message ? { extra: { message } } : {}),
      });
    },
    warn: (...args) => {
      // eslint-disable-next-line no-console -- günlüğün tek konsol çıkışı
      console.warn(`[${scope}]`, ...args);
    },
  };
}

/** Yalnızca testler için: kapsam sayaçlarını sıfırlar. */
export function resetLoggerForTests(): void {
  reportsByScope.clear();
}
