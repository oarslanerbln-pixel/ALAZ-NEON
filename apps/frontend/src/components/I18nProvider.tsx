"use client";

import { useEffect, useState } from "react";
import i18next from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";

i18next.use(initReactI18next).init({
  resources: {
    en: {
      translation: {
        "disclaimer": "This is not medical advice, only a language simplification tool. Please consult your doctor.",
        "scanning": "Scanning your report...",
        "taken": "Taken"
      }
    },
    tr: {
      translation: {
        "disclaimer": "Bu bir tıbbi tavsiye değildir, yalnızca dil sadeleştirme aracıdır. Lütfen doktorunuza danışın.",
        "scanning": "Raporunuz taranıyor...",
        "taken": "Alındı"
      }
    },
    ar: {
      translation: {
        "disclaimer": "هذه ليست نصيحة طبية، بل مجرد أداة لتبسيط اللغة. يرجى استشارة طبيبك.",
        "scanning": "جاري مسح تقريرك...",
        "taken": "تم الأخذ"
      }
    }
  },
  lng: "tr",
  fallbackLng: "tr",
  interpolation: {
    escapeValue: false
  }
});

export default function I18nProvider({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return <>{children}</>;

  return <I18nextProvider i18n={i18next}>{children}</I18nextProvider>;
}
