"use client";

import { useState } from 'react';
import { Camera, Upload, Loader2, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UploadDocument() {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [language, setLanguage] = useState('tr');

  const handleSimulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      let langText = "";
      if (language === 'tr') langText = "Türkçe (Simüle edilmiş özet):\n1. Durumunuz Nedir?\n2. Doktorunuz Ne Demek İstiyor?\n3. Dikkat Etmeniz Gerekenler";
      if (language === 'en') langText = "English (Simulated Summary):\n1. What is your condition?\n2. What does your doctor mean?\n3. Things to pay attention to";
      if (language === 'ar') langText = "العربية (ملخص محاكاة):\n1. ما هي حالتك؟\n2. ماذا يقصد طبيبك؟\n3. أشياء يجب الانتباه إليها";

      setResult(langText);
    }, 3000);
  };

  return (
    <div className="flex flex-col gap-6 items-center w-full">
      <div className="grid grid-cols-2 gap-4 w-full">
        <button
          onClick={handleSimulateScan}
          disabled={isScanning}
          className="flex flex-col items-center justify-center p-6 bg-gray-800 rounded-xl border-2 border-dashed border-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400"
          aria-label="Kamera ile çek"
        >
          <Camera size={32} className="mb-2" />
          <span className="font-bold">Fotoğraf Çek</span>
        </button>
        <button
          onClick={handleSimulateScan}
          disabled={isScanning}
          className="flex flex-col items-center justify-center p-6 bg-gray-800 rounded-xl border-2 border-dashed border-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400"
          aria-label="Dosya yükle"
        >
          <Upload size={32} className="mb-2" />
          <span className="font-bold">Dosya Seç</span>
        </button>
      </div>

      <div className="flex flex-col gap-2 w-full mt-4">
        <h3 className="font-bold flex items-center gap-2"><Globe size={20}/> Dil Seçimi / Language / لغة</h3>
        <div className="flex gap-4 w-full">
          <button
            onClick={() => setLanguage('tr')}
            className={`flex-1 p-4 rounded-xl border-2 font-bold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400 ${language === 'tr' ? 'bg-blue-600 border-blue-400 text-white' : 'bg-gray-800 border-gray-600'}`}
          >
            TR
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`flex-1 p-4 rounded-xl border-2 font-bold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400 ${language === 'en' ? 'bg-blue-600 border-blue-400 text-white' : 'bg-gray-800 border-gray-600'}`}
          >
            EN
          </button>
          <button
            onClick={() => setLanguage('ar')}
            className={`flex-1 p-4 rounded-xl border-2 font-bold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400 ${language === 'ar' ? 'bg-blue-600 border-blue-400 text-white' : 'bg-gray-800 border-gray-600'}`}
          >
            AR
          </button>
        </div>
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
            <p className="text-xl font-bold text-center">Raporunuz taranıyor...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {result && (
        <div className="w-full bg-gray-800 p-6 rounded-xl mt-4" role="status" aria-live="polite">
          <h2 className="text-2xl font-bold mb-4 text-yellow-400">Sonuç</h2>
          <p className="whitespace-pre-line text-lg">{result}</p>
          <div className="mt-6 p-4 bg-gray-900 border border-gray-700 rounded-lg text-yellow-400 font-bold text-base text-center">
            Bu bir tıbbi tavsiye değildir, yalnızca dil sadeleştirme aracıdır. Lütfen doktorunuza danışın.
          </div>
        </div>
      )}
    </div>
  );
}
