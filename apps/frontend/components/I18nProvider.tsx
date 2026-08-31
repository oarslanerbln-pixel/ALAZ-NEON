"use client";
import { useEffect, useState } from "react";
import i18n from "i18next";
import { initReactI18next } from "react-i18next";

i18n
  .use(initReactI18next)
  .init({
    resources: {
      tr: { translation: { "scan_report": "Raporunuz taranıyor..." } },
      en: { translation: { "scan_report": "Scanning your report..." } },
      ar: { translation: { "scan_report": "جاري مسح تقريرك..." } }
    },
    lng: "tr",
    fallbackLng: "tr",
    interpolation: { escapeValue: false }
  });

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);
  if (!mounted) return <>{children}</>;
  return <>{children}</>;
}
