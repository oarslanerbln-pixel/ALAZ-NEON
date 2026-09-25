export const translations = {
  tr: {
    "disclaimer": "Bu bir tıbbi tavsiye değildir, yalnızca dil sadeleştirme aracıdır. Lütfen doktorunuza danışın.",
    "scanning": "Raporunuz taranıyor...",
    "taken": "Alındı",
    "upload_button": "Evrak Yükle / Çek"
  },
  en: {
    "disclaimer": "This is not medical advice, only a language simplification tool. Please consult your doctor.",
    "scanning": "Scanning your report...",
    "taken": "Taken",
    "upload_button": "Upload / Take Photo"
  },
  ar: {
    "disclaimer": "هذه ليست نصيحة طبية، بل مجرد أداة لتبسيط اللغة. يرجى استشارة طبيبك.",
    "scanning": "جاري مسح تقريرك...",
    "taken": "تم الأخذ",
    "upload_button": "تحميل / التقاط صورة"
  }
} as const;

export type Locale = keyof typeof translations;
export type TranslationKey = keyof typeof translations["tr"];

let currentLocale: Locale = "tr";

export function setLocale(locale: Locale) {
  currentLocale = locale;
}

export function getLocale() {
  return currentLocale;
}

export function t(key: TranslationKey, fallback?: string): string {
  const trans = translations[currentLocale][key];
  if (!trans && fallback) return fallback;
  if (!trans) return key;
  return trans;
}
