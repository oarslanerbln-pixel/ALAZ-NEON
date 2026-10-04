import { loadLocale, setLocale, t } from "../../src/lib/i18n";

/**
 * Testler arayüzü kullanıcının gördüğü metinle buluyor (erişilebilir ad,
 * etiket); metinler uygulamanın kendi çeviri sözlüğünden geliyor. Böylece
 * bir çeviri değişince test sessizce yanlış öğeyi aramıyor.
 */
export const LOCALE = "tr" as const;
await loadLocale(LOCALE);
await setLocale(LOCALE);

export { t };

/** Tarayıcı bağlamının dilini sayfa yüklenmeden önce sabitler. */
export const LOCALE_INIT_SCRIPT = `try { localStorage.setItem("alaz_neon_locale", "${LOCALE}"); } catch {}`;
