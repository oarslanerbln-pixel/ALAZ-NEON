/**
 * HENGAME ARENA — Internationalization (i18n) System
 * Supports: German (de), Turkish (tr), English (en)
 *
 * Sözlükler dil başına ayrı dosyada (`./i18n/{de,tr,en}.ts`). Açılış dili
 * Almanca girişte yükleniyor; Türkçe ve İngilizce yalnızca seçilince ayrı
 * bir parça olarak iniyor (docs/roadmap.md, 2.3). Eskiden üç dilin tamamı
 * (~84 KB) her telefonun ilk yüküne giriyordu.
 */

import { de, type Dictionary } from "./i18n/de";

export type Locale = "tr" | "de" | "en";
export type TranslationKey = keyof Dictionary;
type TranslationValue = string | ((...args: (string | number)[]) => string);

const STORAGE_KEY = "alaz_neon_locale";
const LOCALES: readonly Locale[] = ["de", "tr", "en"];

// ───────── STATE MANAGEMENT ─────────
// Açılış varsayılanı Almanca: bu ürün önce Almanya'daki mekanlara
// pazarlanıyor, host/oyuncu ilk açılışta ekstra tıklama yapmadan kendi
// dilini görmeli. Daha önce ziyaret edip başka bir dil seçmiş kullanıcının
// tercihi localStorage'dan (varsa) önceliklidir.
const DEFAULT_LOCALE: Locale = "de";

const dictionaries: Partial<Record<Locale, Dictionary>> = { de };
const loaders: Record<Exclude<Locale, "de">, () => Promise<Dictionary>> = {
  tr: () => import("./i18n/tr").then((m) => m.tr),
  en: () => import("./i18n/en").then((m) => m.en),
};

/** Sözlüğü (gerekirse) indirir. Aynı dil için tek istek atılır. */
const inFlight = new Map<Locale, Promise<void>>();
export function loadLocale(locale: Locale): Promise<void> {
  if (dictionaries[locale]) return Promise.resolve();
  let pending = inFlight.get(locale);
  if (!pending) {
    pending = loaders[locale as Exclude<Locale, "de">]()
      .then((dictionary) => {
        dictionaries[locale] = dictionary;
      })
      .finally(() => inFlight.delete(locale));
    inFlight.set(locale, pending);
  }
  return pending;
}

function savedLocale(): Locale | null {
  try {
    if (typeof window !== "undefined" && typeof localStorage !== "undefined" && typeof localStorage.getItem === "function") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && (LOCALES as readonly string[]).includes(saved)) return saved as Locale;
    }
  } catch {
    // localStorage access may fail in restricted/test environments
  }
  return null;
}

// Görünen dil yalnızca sözlüğü yüklenmiş bir dil olabilir: t() hiçbir zaman
// eksik sözlüğe bakmaz. Kayıtlı dil henüz inmediyse açılış Almanca başlar
// ve `localeReady` onu yükleyip geçer (main.tsx ilk render'ı bunu bekliyor).
let currentLocale: Locale = DEFAULT_LOCALE;
let requestedLocale: Locale = DEFAULT_LOCALE;

// `LanguageSwitcher` artık host header'dan oyuncu katılım ekranına kadar
// birçok yerde, HER SEFERİNDE KENDİ useLocale() çağrısıyla kullanılıyor.
// Eskiden useLocale() dili düz bir useState ile tutuyordu — bir bileşenin
// switchLocale çağırması yalnızca KENDİ yerel state'ini güncelliyordu,
// aynı sayfadaki BAŞKA bir useLocale() örneği (asıl çevrilen metni basan
// bileşen) bundan habersiz kalıp yeniden render olmuyordu: dil değişiyor
// gibi görünüyor ama ekrandaki metin eskisi kalıyordu. Bu dinleyici listesi
// useLocale()'in useSyncExternalStore ile paylaşılan tek bir kaynağa
// abone olmasını sağlıyor — DatabaseStatus.tsx'teki navigator.onLine
// deseniyle aynı çözüm.
const listeners = new Set<() => void>();

export function subscribeLocale(callback: () => void): () => void {
  listeners.add(callback);
  return () => listeners.delete(callback);
}

export function getLocale(): Locale {
  return currentLocale;
}

function applyLocale(locale: Locale, persist: boolean): void {
  currentLocale = locale;
  try {
    if (persist && typeof window !== "undefined" && typeof localStorage !== "undefined" && typeof localStorage.setItem === "function") {
      localStorage.setItem(STORAGE_KEY, locale);
    }
    if (typeof document !== "undefined") {
      // <html lang> arayüz için kozmetik değil: CSS `text-transform: uppercase`
      // dile göre çalışıyor ve arayüz büyük harf ağırlıklı. Yanlış dilde
      // "Giriş" → "GIRIŞ" (noktasız I) çıkıyor, Türkçede doğrusu "GİRİŞ".
      // index.html varsayılan olarak lang="tr" ile geliyor; açılışta da
      // burada düzeltiliyor.
      document.documentElement.lang = locale;
    }
  } catch {
    // Ignore storage errors
  }
  listeners.forEach((callback) => callback());
}

/**
 * Dili değiştirir. Sözlük yüklüyse anında; değilse indirildikten sonra
 * (o arada ekran eski dilde kalır). Arka arkaya seçimlerde yalnızca en
 * sonuncusu uygulanır. İndirme başarısız olursa dil değişmez.
 */
export function setLocale(locale: Locale): Promise<void> {
  requestedLocale = locale;
  if (dictionaries[locale]) {
    applyLocale(locale, true);
    return Promise.resolve();
  }
  return loadLocale(locale).then(
    () => {
      if (requestedLocale === locale) applyLocale(locale, true);
    },
    () => {
      if (requestedLocale === locale) requestedLocale = currentLocale;
    },
  );
}

/** Kayıtlı dil hazır olduğunda (ya da indirilemezse açılış diliyle) çözülür; reddedilmez. */
export const localeReady: Promise<void> = (() => {
  const saved = savedLocale();
  if (!saved || saved === DEFAULT_LOCALE) {
    applyLocale(DEFAULT_LOCALE, false);
    return Promise.resolve();
  }
  requestedLocale = saved;
  applyLocale(DEFAULT_LOCALE, false);
  return loadLocale(saved).then(
    () => {
      if (requestedLocale === saved) applyLocale(saved, false);
    },
    () => {},
  );
})();

/**
 * Get a translated string by key.
 * Supports both plain strings and function-based translations for interpolation.
 */
export function t(key: TranslationKey, ...args: (string | number)[]): string {
  const dictionary = dictionaries[currentLocale] ?? de;
  const val = (dictionary as Partial<Record<string, TranslationValue>>)[key];
  if (val === undefined) {
    // Kod tabanında `t("bir.anahtar", "Yedek Metin")` deseni yaygın: çağıran
    // taraf ikinci argümanı YEDEK metin sanıyor, oysa o interpolasyon
    // argümanı. Anahtar tanımlıyken zararsız, ama bir yazım hatasında ekrana
    // ham anahtar ("player.unityTitle") basılırdı. Niyete uyuyoruz: anahtar
    // yoksa ve metin bir yedek verilmişse onu döndür.
    const fallback = args[0];
    return typeof fallback === "string" ? fallback : key;
  }

  if (typeof val === "function") {
    return val(...args);
  }
  return val;
}

// Expose for reactive React usage
export const i18n = { t, getLocale, setLocale };
