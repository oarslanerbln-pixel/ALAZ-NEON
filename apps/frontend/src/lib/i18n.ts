export type Locale = 'tr' | 'en' | 'ar';

const translations: Record<Locale, Record<string, string>> = {
  tr: {
    scan_report: "Raporu Tara",
    upload_report: "Rapor Yükle",
    scanning: "Raporunuz taranıyor...",
    medication_taken: "Alındı",
    medication_dashboard: "İlaç Takibi",
  },
  en: {
    scan_report: "Scan Report",
    upload_report: "Upload Report",
    scanning: "Scanning your report...",
    medication_taken: "Taken",
    medication_dashboard: "Medication Dashboard",
  },
  ar: {
    scan_report: "مسح التقرير",
    upload_report: "تحميل التقرير",
    scanning: "جاري مسح تقريرك...",
    medication_taken: "تم أخذه",
    medication_dashboard: "لوحة الأدوية",
  }
};

export function t(key: string, locale: Locale = 'tr'): string {
  return translations[locale]?.[key] || key;
}
