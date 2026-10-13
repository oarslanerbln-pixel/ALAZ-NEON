export type SupportedLanguage = "tr" | "en" | "ar";

const translations = {
  tr: {
    "app.title": "MediSade",
    "upload.scan": "Raporunuz taranıyor...",
    "upload.title": "Tıbbi Rapor Yükle",
    "upload.button": "Dosya Seç",
    "medication.title": "İlaç Dashboard",
    "medication.taken": "Alındı",
    "medication.notTaken": "Alınmadı",
  },
  en: {
    "app.title": "MediSade",
    "upload.scan": "Scanning your report...",
    "upload.title": "Upload Medical Report",
    "upload.button": "Select File",
    "medication.title": "Medication Dashboard",
    "medication.taken": "Taken",
    "medication.notTaken": "Not Taken",
  },
  ar: {
    "app.title": "MediSade",
    "upload.scan": "جاري مسح تقريرك...",
    "upload.title": "تحميل تقرير طبي",
    "upload.button": "اختر ملف",
    "medication.title": "لوحة الأدوية",
    "medication.taken": "تم الأخذ",
    "medication.notTaken": "لم يتم الأخذ",
  }
};

type TranslationKey = keyof typeof translations["tr"];

export function t(key: TranslationKey, lang: SupportedLanguage = "tr"): string {
  return translations[lang][key] || translations["tr"][key] || key;
}
