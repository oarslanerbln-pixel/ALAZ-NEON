"use client";

import { useState } from 'react';
import { Camera, Upload, Loader2, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const TRANSLATIONS: Record<string, string> = {
  tr: "1. Durumunuz Nedir?\nKan değerlerinizde hafif bir enfeksiyon belirtisi var.\n\n2. Doktorunuz Ne Demek İstiyor?\nVücudunuz bir mikropla savaşıyor, bu yüzden yorgun hissedebilirsiniz. Endişelenecek büyük bir durum yok.\n\n3. Dikkat Etmeniz Gerekenler\nİlaçlarınızı düzenli kullanın, bol su için ve iyice dinlenin.",
  en: "1. What is Your Condition?\nThere is a slight sign of infection in your blood test results.\n\n2. What Does Your Doctor Mean?\nYour body is fighting a bug, which is why you might feel tired. Nothing to worry about.\n\n3. What You Should Pay Attention To\nTake your medication regularly, drink plenty of water, and get lots of rest.",
  ar: "1. ما هي حالتك؟\nهناك علامة خفيفة على وجود عدوى في نتائج فحص الدم.\n\n2. ماذا يقصد طبيبك؟\nجسمك يحارب ميكروبًا، ولهذا قد تشعر بالتعب. لا يوجد ما يدعو للقلق.\n\n3. ما يجب الانتباه إليه\nتناول أدويتك بانتظام، واشرب الكثير من الماء، واحصل على قسط وافر من الراحة."
};

export default function UploadDocument() {
  const [isScanning, setIsScanning] = useState(false);
  const [resultLanguage, setResultLanguage] = useState<string | null>(null);

  const handleSimulateScan = () => {
    setIsScanning(true);
    setResultLanguage(null);
    setTimeout(() => {
      setIsScanning(false);
      setResultLanguage('tr');
    }, 3000);
  };

  return (
    <div className="flex flex-col gap-6 items-center w-full">
      <div className="grid grid-cols-2 gap-4 w-full">
        <button
          onClick={handleSimulateScan}
          disabled={isScanning}
          className="flex flex-col items-center justify-center p-6 bg-gray-800 rounded-xl border-2 border-dashed border-gray-600 hover:bg-gray-700 disabled:opacity-50 transition-colors focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none"
          aria-label="Kamera ile çek"
        >
          <Camera size={32} className="mb-2" />
          <span className="font-bold">Fotoğraf Çek</span>
        </button>
        <button
          onClick={handleSimulateScan}
          disabled={isScanning}
          className="flex flex-col items-center justify-center p-6 bg-gray-800 rounded-xl border-2 border-dashed border-gray-600 hover:bg-gray-700 disabled:opacity-50 transition-colors focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none"
          aria-label="Dosya yükle"
        >
          <Upload size={32} className="mb-2" />
          <span className="font-bold">Dosya Seç</span>
        </button>
      </div>

      <AnimatePresence>
        {isScanning && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4 p-8 bg-blue-900 rounded-xl w-full"
            role="alert"
            aria-live="assertive"
          >
            <Loader2 size={48} className="animate-spin text-blue-300" />
            <p className="text-xl font-bold text-center text-white">Raporunuz taranıyor...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {resultLanguage && (
        <div className="w-full bg-gray-800 p-6 rounded-xl mt-4 border border-gray-700">
          <div className="flex flex-col gap-4 mb-6 pb-6 border-b border-gray-700">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Globe size={24} className="text-blue-400" />
              Dili Değiştir (Language / اللغة)
            </h2>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setResultLanguage('tr')}
                className={`px-4 py-3 rounded-lg font-bold transition-colors focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none border-2 ${resultLanguage === 'tr' ? 'bg-blue-600 border-blue-400 text-white' : 'bg-gray-700 border-gray-600 hover:bg-gray-600'}`}
                aria-pressed={resultLanguage === 'tr'}
              >
                Türkçe
              </button>
              <button
                onClick={() => setResultLanguage('en')}
                className={`px-4 py-3 rounded-lg font-bold transition-colors focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none border-2 ${resultLanguage === 'en' ? 'bg-blue-600 border-blue-400 text-white' : 'bg-gray-700 border-gray-600 hover:bg-gray-600'}`}
                aria-pressed={resultLanguage === 'en'}
              >
                English
              </button>
              <button
                onClick={() => setResultLanguage('ar')}
                className={`px-4 py-3 rounded-lg font-bold transition-colors focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none border-2 ${resultLanguage === 'ar' ? 'bg-blue-600 border-blue-400 text-white' : 'bg-gray-700 border-gray-600 hover:bg-gray-600'}`}
                aria-pressed={resultLanguage === 'ar'}
              >
                العربية
              </button>
            </div>
          </div>

          <h2 className="text-2xl font-bold mb-4 text-yellow-400">Sonuç Özeti</h2>
          <div className="whitespace-pre-line text-lg leading-relaxed text-gray-100 font-medium">
            {TRANSLATIONS[resultLanguage]}
          </div>

          <div className="mt-8 p-4 bg-gray-900 border-l-4 border-yellow-500 rounded text-base text-gray-300 font-bold" role="note">
            Bu bir tıbbi tavsiye değildir, yalnızca dil sadeleştirme aracıdır. Lütfen doktorunuza danışın.
          </div>
        </div>
      )}
    </div>
  );
}
