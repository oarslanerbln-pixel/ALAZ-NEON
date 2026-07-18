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
      setResult("Özet (" + language + "):\n1. Durumunuz Nedir?\n\n2. Doktorunuz Ne Demek İstiyor?\n\n3. Dikkat Etmeniz Gerekenler\n");
    }, 3000);
  };

  return (
    <div className="flex flex-col gap-6 items-center w-full">
      <div className="flex flex-col w-full gap-2">
        <label className="text-xl font-bold text-white">Dil Seçimi:</label>
        <div className="grid grid-cols-3 gap-2 w-full">
          {(['tr', 'en', 'ar'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`p-4 rounded-xl border-4 text-xl font-bold transition-colors focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none ${
                language === lang ? 'bg-white text-black border-white' : 'bg-black text-white border-white hover:bg-gray-800'
              }`}
            >
              {lang === 'tr' ? 'Türkçe' : lang === 'en' ? 'English' : 'العربية'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full">
        <button
          onClick={handleSimulateScan}
          disabled={isScanning}
          className="flex flex-col items-center justify-center p-6 bg-black text-yellow-400 rounded-xl border-4 border-white hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none"
          aria-label="Kamera ile çek"
        >
          <Camera size={48} className="mb-2" />
          <span className="font-bold text-xl">Fotoğraf Çek</span>
        </button>
        <button
          onClick={handleSimulateScan}
          disabled={isScanning}
          className="flex flex-col items-center justify-center p-6 bg-black text-yellow-400 rounded-xl border-4 border-white hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none"
          aria-label="Dosya yükle"
        >
          <Upload size={48} className="mb-2" />
          <span className="font-bold text-xl">Dosya Seç</span>
        </button>
      </div>

      <AnimatePresence>
        {isScanning && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4 p-8 bg-black border-4 border-yellow-400 rounded-xl w-full"
            role="alert"
            aria-live="assertive"
          >
            <Loader2 size={64} className="animate-spin text-yellow-400" />
            <p className="text-2xl font-bold text-center text-yellow-400">Raporunuz taranıyor...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {result && (
        <div className="w-full bg-black border-4 border-white p-6 rounded-xl mt-4" role="status" aria-live="polite">
          <h2 className="text-3xl font-bold mb-4 text-yellow-400">Sonuç</h2>
          <p className="whitespace-pre-line text-xl font-medium text-white mb-6">{result}</p>
          <div className="p-4 bg-black border-t-2 border-white mt-4 text-center">
             <p className="text-yellow-400 font-bold text-base">
                Bu bir tıbbi tavsiye değildir, yalnızca dil sadeleştirme aracıdır. Lütfen doktorunuza danışın.
             </p>
          </div>
        </div>
      )}
    </div>
  );
}
