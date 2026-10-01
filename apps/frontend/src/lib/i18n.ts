export type Locale = "tr" | "en" | "ar";

export const translations: Record<Locale, Record<string, string>> = {
  tr: {
    "disclaimer": "Bu bir tıbbi tavsiye değildir, yalnızca dil sadeleştirme aracıdır. Lütfen doktorunuza danışın.",
    "upload_title": "Rapor Yükle",
    "upload_scanning": "Raporunuz taranıyor...",
    "medication_title": "İlaçlarım",
    "medication_taken": "Alındı"
  },
  en: {
    "disclaimer": "This is not medical advice, just a language simplification tool. Please consult your doctor.",
    "upload_title": "Upload Report",
    "upload_scanning": "Scanning your report...",
    "medication_title": "My Medications",
    "medication_taken": "Taken"
  },
  ar: {
    "disclaimer": "هذه ليست نصيحة طبية، مجرد أداة لتبسيط اللغة. يرجى استشارة طبيبك.",
    "upload_title": "تحميل التقرير",
    "upload_scanning": "جاري مسح تقريرك...",
    "medication_title": "أدويتي",
    "medication_taken": "تم الأخذ"
  }
};

export function getTranslations(locale: Locale) {
  return translations[locale];
}
