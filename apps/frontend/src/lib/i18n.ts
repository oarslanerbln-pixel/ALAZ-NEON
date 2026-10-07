export type Locale = "tr" | "en" | "ar";

const translations = {
  tr: {
    disclaimer: "Bu bir tıbbi tavsiye değildir, yalnızca dil sadeleştirme aracıdır. Lütfen doktorunuza danışın.",
    scanning: "Raporunuz taranıyor...",
    scanButton: "Belge Tara",
    medicationTaken: "Alındı",
    medicationTitle: "İlaç Takibi",
    cameraUploadTitle: "Kamera / Evrak Yükleme",
    selectLanguage: "Dil Seçimi"
  },
  en: {
    disclaimer: "This is not medical advice, only a language simplification tool. Please consult your doctor.",
    scanning: "Scanning your report...",
    scanButton: "Scan Document",
    medicationTaken: "Taken",
    medicationTitle: "Medication Tracking",
    cameraUploadTitle: "Camera / Document Upload",
    selectLanguage: "Select Language"
  },
  ar: {
    disclaimer: "هذه ليست نصيحة طبية، مجرد أداة لتبسيط اللغة. يرجى استشارة طبيبك.",
    scanning: "جاري مسح تقريرك...",
    scanButton: "مسح المستند",
    medicationTaken: "تم الأخذ",
    medicationTitle: "تتبع الأدوية",
    cameraUploadTitle: "الكاميرا / تحميل المستند",
    selectLanguage: "اختر اللغة"
  }
};

export function t(key: keyof typeof translations["tr"], locale: Locale = "tr") {
  return translations[locale][key] || translations["tr"][key];
}
