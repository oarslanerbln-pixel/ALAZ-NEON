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
      setResult("Simüle edilmiş özet:\n1. Durumunuz Nedir?\n2. Doktorunuz Ne Demek İstiyor?\n3. Dikkat Etmeniz Gerekenler");
    }, 3000);
  };

  return (
    <div className="flex flex-col gap-6 items-center w-full">
      <div className="grid grid-cols-2 gap-4 w-full">
        <button
          onClick={handleSimulateScan}
          disabled={isScanning}
          className="flex flex-col items-center justify-center p-6 bg-gray-800 rounded-xl border-2 border-dashed border-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none transition-colors"
          aria-label="Kamera ile çek"
        >
          <Camera size={32} className="mb-2" />
          <span className="font-bold">Fotoğraf Çek</span>
        </button>
        <button
          onClick={handleSimulateScan}
          disabled={isScanning}
          className="flex flex-col items-center justify-center p-6 bg-gray-800 rounded-xl border-2 border-dashed border-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none transition-colors"
          aria-label="Dosya yükle"
        >
          <Upload size={32} className="mb-2" />
          <span className="font-bold">Dosya Seç</span>
        </button>
      </div>

      <div className="w-full flex flex-col gap-2 bg-gray-900 p-4 rounded-xl border border-gray-700">
        <div className="flex items-center gap-2 mb-2 text-gray-300">
          <Globe size={20} />
          <span className="font-bold">Özet Dili / Language</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {['tr', 'en', 'ar'].map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              disabled={isScanning}
              className={`py-3 px-2 rounded-lg font-bold text-center border-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none ${
                language === lang
                  ? 'bg-blue-900 border-blue-500 text-white'
                  : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
              }`}
            >
              {lang === 'tr' ? 'Türkçe' : lang === 'en' ? 'English' : 'العربية'}
            </button>
          ))}
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
        <div
          className="w-full bg-gray-800 p-6 rounded-xl mt-4 border-2 border-gray-600"
          role="status"
          aria-live="polite"
        >
          <h2 className="text-2xl font-bold mb-4 text-yellow-400">Sonuç</h2>
          <p className="whitespace-pre-line text-lg mb-6">{result}</p>

          <div className="mt-4 pt-4 border-t border-gray-600 bg-red-900/30 p-4 rounded-lg">
            <p className="text-sm font-bold text-red-300">
              Bu bir tıbbi tavsiye değildir, yalnızca dil sadeleştirme aracıdır. Lütfen doktorunuza danışın.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
