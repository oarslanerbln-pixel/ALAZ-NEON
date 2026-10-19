type Locale = 'tr' | 'en' | 'ar';

export const translations = {
  tr: {
    'scanning': 'Raporunuz taranıyor...',
    'meds_title': 'İlaç Dashboard',
    'taken': 'Alındı',
    'disclaimer': 'Bu bir tıbbi tavsiye değildir, yalnızca dil sadeleştirme aracıdır. Lütfen doktorunuza danışın.',
    'summary_1': '1. Durumunuz Nedir?',
    'summary_2': '2. Doktorunuz Ne Demek İstiyor?',
    'summary_3': '3. Dikkat Etmeniz Gerekenler.',
  },
  en: {
    'scanning': 'Scanning your report...',
    'meds_title': 'Medication Dashboard',
    'taken': 'Taken',
    'disclaimer': 'This is not medical advice, just a language simplification tool. Please consult your doctor.',
    'summary_1': '1. What is your condition?',
    'summary_2': '2. What does your doctor mean?',
    'summary_3': '3. Things you should pay attention to.',
  },
  ar: {
    'scanning': 'جاري مسح تقريرك...',
    'meds_title': 'لوحة الأدوية',
    'taken': 'تم أخذها',
    'disclaimer': 'هذه ليست نصيحة طبية، مجرد أداة لتبسيط اللغة. يرجى استشارة طبيبك.',
    'summary_1': '1. ما هي حالتك؟',
    'summary_2': '2. ماذا يعني طبيبك؟',
    'summary_3': '3. أشياء يجب الانتباه إليها.',
  }
};

export let currentLocale: Locale = 'tr';

export function setLocale(locale: Locale) {
  currentLocale = locale;
}

export function t(key: keyof typeof translations['tr']) {
  return translations[currentLocale][key];
}
