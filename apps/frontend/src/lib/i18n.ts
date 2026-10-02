export type Language = 'TR' | 'EN' | 'AR';

const translations: Record<Language, Record<string, string>> = {
  TR: {
    'medication.title': 'İlaçlarım',
    'medication.taken': 'Alındı',
    'upload.title': 'Belge Yükle',
    'upload.button': 'Fotoğraf Çek / Yükle',
    'upload.scanning': 'Raporunuz taranıyor...',
    'upload.summary.1': '1. Durumunuz Nedir?',
    'upload.summary.2': '2. Doktorunuz Ne Demek İstiyor?',
    'upload.summary.3': '3. Dikkat Etmeniz Gerekenler.',
  },
  EN: {
    'medication.title': 'My Medications',
    'medication.taken': 'Taken',
    'upload.title': 'Upload Document',
    'upload.button': 'Take Photo / Upload',
    'upload.scanning': 'Scanning your report...',
    'upload.summary.1': '1. What is your condition?',
    'upload.summary.2': '2. What does your doctor mean?',
    'upload.summary.3': '3. What you should pay attention to.',
  },
  AR: {
    'medication.title': 'أدويتي',
    'medication.taken': 'تم الأخذ',
    'upload.title': 'تحميل مستند',
    'upload.button': 'التقاط صورة / تحميل',
    'upload.scanning': 'جاري مسح التقرير...',
    'upload.summary.1': '1. ما هي حالتك؟',
    'upload.summary.2': '2. ماذا يعني طبيبك؟',
    'upload.summary.3': '3. ما يجب الانتباه إليه.',
  },
};

export function t(key: string, lang: Language): string {
  return translations[lang]?.[key] || key;
}
