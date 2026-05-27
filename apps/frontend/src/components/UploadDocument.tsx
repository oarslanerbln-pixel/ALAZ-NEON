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
    setTimeout(() => {
      setIsScanning(false);
      setResult("Simüle edilmiş özet:\n1. Durumunuz Nedir?\n2. Doktorunuz Ne Demek İstiyor?\n3. Dikkat Etmeniz Gerekenler");
    }, 3000);
  };

  return (
    <div className="flex flex-col gap-6 items-center w-full">
      <fieldset className="w-full">
        <legend className="sr-only">Özet Dili Seçimi</legend>
        <div className="flex gap-2 w-full">
          <button
            type="button"
            onClick={() => setLanguage('tr')}
            aria-pressed={language === 'tr'}
            className={`flex-1 py-3 px-4 font-bold rounded-lg border-2 transition-colors focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none ${language === 'tr' ? 'bg-blue-600 border-blue-400 text-white' : 'bg-gray-800 border-gray-600 hover:bg-gray-700'}`}
          >
            Türkçe
          </button>
          <button
            type="button"
            onClick={() => setLanguage('en')}
            aria-pressed={language === 'en'}
            className={`flex-1 py-3 px-4 font-bold rounded-lg border-2 transition-colors focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none ${language === 'en' ? 'bg-blue-600 border-blue-400 text-white' : 'bg-gray-800 border-gray-600 hover:bg-gray-700'}`}
          >
            English
          </button>
          <button
            type="button"
            onClick={() => setLanguage('ar')}
            aria-pressed={language === 'ar'}
            className={`flex-1 py-3 px-4 font-bold rounded-lg border-2 transition-colors focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none ${language === 'ar' ? 'bg-blue-600 border-blue-400 text-white' : 'bg-gray-800 border-gray-600 hover:bg-gray-700'}`}
          >
            العربية
          </button>
        </div>
      </fieldset>

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
            <p className="text-xl font-bold text-center">Raporunuz taranıyor...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {result && (
        <div className="w-full bg-gray-800 p-6 rounded-xl mt-4" role="status" aria-live="polite">
          <h2 className="text-2xl font-bold mb-4 text-yellow-400">Sonuç</h2>
          <p className="whitespace-pre-line">{result}</p>
        </div>
      )}
    </div>
  );
}
