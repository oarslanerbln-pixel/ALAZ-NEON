"use client";

import { useState } from 'react';
import { Camera, Upload, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UploadDocument() {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [language, setLanguage] = useState<'tr' | 'en' | 'ar'>('tr');

  const handleSimulateScan = () => {
    setIsScanning(true);
    setResult(null);
    setTimeout(() => {
      setIsScanning(false);
      let simulatedResult = "";
      if (language === 'tr') {
        simulatedResult = "Simüle edilmiş özet:\n1. Durumunuz Nedir?\n2. Doktorunuz Ne Demek İstiyor?\n3. Dikkat Etmeniz Gerekenler";
      } else if (language === 'en') {
        simulatedResult = "Simulated summary:\n1. What is your condition?\n2. What does your doctor mean?\n3. Things you should pay attention to";
      } else if (language === 'ar') {
        simulatedResult = "ملخص محاكى:\n1. ما هي حالتك؟\n2. ماذا يعني طبيبك؟\n3. أشياء يجب الانتباه إليها";
      }
      setResult(simulatedResult);
    }, 3000);
  };

  return (
    <div className="flex flex-col gap-6 items-center w-full">
      <div className="w-full flex flex-col gap-2">
        <span className="font-bold text-gray-300">Özet Dili / Summary Language / لغة التلخيص</span>
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setLanguage('tr')}
            className={`p-3 rounded-lg font-bold transition-colors focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none ${language === 'tr' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            aria-pressed={language === 'tr'}
          >
            Türkçe
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`p-3 rounded-lg font-bold transition-colors focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none ${language === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            aria-pressed={language === 'en'}
          >
            English
          </button>
          <button
            onClick={() => setLanguage('ar')}
            className={`p-3 rounded-lg font-bold transition-colors focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none ${language === 'ar' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
            aria-pressed={language === 'ar'}
          >
            العربية
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full">
        <button
          onClick={handleSimulateScan}
          disabled={isScanning}
          className="flex flex-col items-center justify-center p-6 bg-gray-800 rounded-xl border-2 border-dashed border-gray-600 hover:bg-gray-700 disabled:opacity-50 transition-colors focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none"
          aria-label="Kamera ile fotoğraf çek"
        >
          <Camera size={32} className="mb-2" />
          <span className="font-bold">Fotoğraf Çek</span>
        </button>
        <button
          onClick={handleSimulateScan}
          disabled={isScanning}
          className="flex flex-col items-center justify-center p-6 bg-gray-800 rounded-xl border-2 border-dashed border-gray-600 hover:bg-gray-700 disabled:opacity-50 transition-colors focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none"
          aria-label="Cihazdan dosya seç"
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
            <p className="text-xl font-bold text-center">Raporunuz taranıyor...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {result && (
        <div className="w-full bg-gray-800 p-6 rounded-xl mt-4" role="alert" aria-live="assertive">
          <h2 className="text-2xl font-bold mb-4 text-yellow-400">Sonuç</h2>
          <p className="whitespace-pre-line text-xl leading-relaxed">{result}</p>
        </div>
      )}
    </div>
  );
}
