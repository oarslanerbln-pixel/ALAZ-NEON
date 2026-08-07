import { useState, useCallback } from "react";
import { t, getLocale, setLocale, type Locale } from "../lib/i18n";

/**
 * React hook for reactive locale switching.
 * Returns the current locale, the t() function, and a toggle.
 */
export function useLocale() {
  const [locale, _setLocale] = useState<Locale>(getLocale());

  const switchLocale = useCallback((newLocale: Locale) => {
    setLocale(newLocale);
    _setLocale(newLocale);
  }, []);

  const toggleLocale = useCallback(() => {
    const next = locale === "tr" ? "de" : "tr";
    switchLocale(next);
  }, [locale, switchLocale]);

  return { locale, t, switchLocale, toggleLocale };
}
