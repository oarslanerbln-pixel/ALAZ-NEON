"use client";

import { useState } from 'react';
import { Camera, Upload, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UploadDocument() {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const [language, setLanguage] = useState<'TR' | 'EN' | 'AR'>('TR');

  const handleSimulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setResult("1. Durumunuz Nedir?\nSimüle edilmiş tıbbi durum.\n\n2. Doktorunuz Ne Demek İstiyor?\nDoktorunuzun açıklaması.\n\n3. Dikkat Etmeniz Gerekenler\nDikkat etmeniz gereken hususlar.\n\nBu bir tıbbi tavsiye değildir, yalnızca dil sadeleştirme aracıdır. Lütfen doktorunuza danışın.");
    }, 3000);
  };

  return (
    <div className="flex flex-col gap-6 items-center w-full">
      <div className="flex gap-2 w-full justify-center bg-gray-800 p-2 rounded-xl">
        {(['TR', 'EN', 'AR'] as const).map((lang) => (
          <button
            key={lang}
            onClick={() => setLanguage(lang)}
            aria-pressed={language === lang}
            className={`flex-1 py-3 px-4 rounded-lg font-bold text-center transition-colors focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none ${
              language === lang ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            {lang}
          </button>
        ))}
      </div>

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
        <div className="w-full bg-gray-800 p-6 rounded-xl mt-4">
          <h2 className="text-2xl font-bold mb-4 text-yellow-400">Sonuç</h2>
          <p className="whitespace-pre-line">{result}</p>
        </div>
      )}
    </div>
  );
}
