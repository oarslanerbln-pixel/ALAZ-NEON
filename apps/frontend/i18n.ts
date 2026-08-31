import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  tr: {
    translation: {
      "app_title": "MediSade",
      "scan_report": "Raporunuz taranıyor...",
      "take_medication": "Alındı"
    }
  },
  en: {
    translation: {
      "app_title": "MediSade",
      "scan_report": "Scanning your report...",
      "take_medication": "Taken"
    }
  },
  ar: {
    translation: {
      "app_title": "ميدي ساد",
      "scan_report": "جاري مسح التقرير...",
      "take_medication": "أخذت"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "tr",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
