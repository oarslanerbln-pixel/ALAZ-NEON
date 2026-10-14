export type Locale = "en" | "tr" | "ar";

const translations = {
  tr: {
    "scanning.report": "Raporunuz taranıyor...",
    "disclaimer": "Bu bir tıbbi tavsiye değildir, yalnızca dil sadeleştirme aracıdır. Lütfen doktorunuza danışın.",
    "medication.taken": "Alındı",
    "medication.title": "Günlük İlaçlarınız",
    "upload.title": "Rapor Yükle",
  },
  en: {
    "scanning.report": "Scanning your report...",
    "disclaimer": "This is not medical advice, only a language simplification tool. Please consult your doctor.",
    "medication.taken": "Taken",
    "medication.title": "Daily Medications",
    "upload.title": "Upload Report",
  },
  ar: {
    "scanning.report": "جاري مسح تقريرك...",
    "disclaimer": "هذه ليست نصيحة طبية، بل مجرد أداة لتبسيط اللغة. يرجى استشارة طبيبك.",
    "medication.taken": "تم الأخذ",
    "medication.title": "الأدوية اليومية",
    "upload.title": "تحميل تقرير",
  },
};

let currentLocale: Locale = "tr";

export function setLocale(locale: Locale) {
  currentLocale = locale;
}

export function getLocale(): Locale {
  return currentLocale;
}

export function t(key: keyof typeof translations["tr"]): string {
  return translations[currentLocale][key] || translations["tr"][key] || key;
}
