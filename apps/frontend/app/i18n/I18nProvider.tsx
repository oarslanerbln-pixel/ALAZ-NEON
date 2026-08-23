"use client";

import React, { useEffect, useState } from "react";
import i18next from "i18next";
import { I18nextProvider, initReactI18next } from "react-i18next";

i18next.use(initReactI18next).init({
  resources: {
    tr: {
      translation: {
        "upload_document": "Belge Yükle",
        "scanning": "Raporunuz taranıyor...",
        "medications": "İlaçlar",
        "taken": "Alındı",
      }
    },
    en: {
      translation: {
        "upload_document": "Upload Document",
        "scanning": "Scanning your report...",
        "medications": "Medications",
        "taken": "Taken",
      }
    },
    ar: {
      translation: {
        "upload_document": "تحميل المستند",
        "scanning": "جاري مسح تقريرك...",
        "medications": "الأدوية",
        "taken": "تم أخذها",
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

  if (!mounted) {
    return <>{children}</>;
  }

  return <I18nextProvider i18n={i18next}>{children}</I18nextProvider>;
}
