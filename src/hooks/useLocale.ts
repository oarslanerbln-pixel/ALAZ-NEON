import { useCallback, useSyncExternalStore } from "react";
import { t, getLocale, setLocale, subscribeLocale, type Locale } from "../lib/i18n";

// de → tr → en → de sırayla döner (3 dile çıkınca sabit iki-yönlü toggle
// artık yeterli değildi). Modül seviyesinde: her render'da yeni bir dizi
// oluşturmuyor, useCallback'in bağımlılık listesini de kirletmiyor.
const LOCALE_CYCLE: Locale[] = ["de", "tr", "en"];

/**
 * React hook for reactive locale switching.
 * Returns the current locale, the t() function, and a toggle.
 *
 * useSyncExternalStore kullanıyor çünkü dil, React state'i değil i18n.ts
 * içindeki paylaşılan bir modül değişkeni — bu hook aynı sayfada birden
 * fazla yerde (LanguageSwitcher, HostHeader, PlayerJoin...) BAĞIMSIZ
 * çağrılıyor. Düz bir useState olsaydı bir bileşenin switchLocale çağırması
 * yalnızca kendi yerel state'ini güncellerdi, aynı sayfadaki asıl çevrilen
 * metni basan bileşen bundan habersiz kalırdı (bkz. subscribeLocale'deki not).
 */
export function useLocale() {
  const locale = useSyncExternalStore(subscribeLocale, getLocale, getLocale);

  const switchLocale = useCallback((newLocale: Locale) => {
    setLocale(newLocale);
  }, []);

  const toggleLocale = useCallback(() => {
    const currentIndex = LOCALE_CYCLE.indexOf(locale);
    const next = LOCALE_CYCLE[(currentIndex + 1) % LOCALE_CYCLE.length];
    switchLocale(next);
  }, [locale, switchLocale]);

  return { locale, t, switchLocale, toggleLocale };
}
