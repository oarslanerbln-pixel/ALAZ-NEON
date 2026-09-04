import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          "Bu bir tıbbi tavsiye değildir, yalnızca dil sadeleştirme aracıdır. Lütfen doktorunuza danışın.": "This is not medical advice, just a language simplification tool. Please consult your doctor.",
          "Durumunuz Nedir?": "What is your condition?",
          "Doktorunuz Ne Demek İstiyor?": "What does your doctor mean?",
          "Dikkat Etmeniz Gerekenler": "What you need to pay attention to",
          "Raporunuz taranıyor...": "Scanning your report...",
          "Alındı": "Taken"
        }
      },
      ar: {
        translation: {
          "Bu bir tıbbi tavsiye değildir, yalnızca dil sadeleştirme aracıdır. Lütfen doktorunuza danışın.": "هذه ليست نصيحة طبية، مجرد أداة لتبسيط اللغة. يرجى استشارة طبيبك.",
          "Durumunuz Nedir?": "ما هي حالتك؟",
          "Doktorunuz Ne Demek İstiyor?": "ماذا يعني طبيبك؟",
          "Dikkat Etmeniz Gerekenler": "ما يجب أن تنتبه إليه",
          "Raporunuz taranıyor...": "جاري مسح تقريرك...",
          "Alındı": "تم الأخذ"
        }
      },
      tr: {
        translation: {
          "Bu bir tıbbi tavsiye değildir, yalnızca dil sadeleştirme aracıdır. Lütfen doktorunuza danışın.": "Bu bir tıbbi tavsiye değildir, yalnızca dil sadeleştirme aracıdır. Lütfen doktorunuza danışın.",
          "Durumunuz Nedir?": "Durumunuz Nedir?",
          "Doktorunuz Ne Demek İstiyor?": "Doktorunuz Ne Demek İstiyor?",
          "Dikkat Etmeniz Gerekenler": "Dikkat Etmeniz Gerekenler",
          "Raporunuz taranıyor...": "Raporunuz taranıyor...",
          "Alındı": "Alındı"
        }
      }
    },
    lng: "tr",
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
