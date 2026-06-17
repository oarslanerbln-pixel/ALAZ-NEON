"use client";

import { useState } from 'react';
import { Camera, Upload, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UploadDocument() {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [language, setLanguage] = useState<string>('tr');

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
          className="flex flex-col items-center justify-center p-6 bg-gray-800 text-white rounded-xl border-4 border-dashed border-gray-500 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none transition-colors"
          aria-label="Kamera ile çek"
        >
          <Camera size={48} className="mb-4" />
          <span className="text-xl font-bold">Fotoğraf Çek</span>
        </button>
        <button
          onClick={handleSimulateScan}
          disabled={isScanning}
          className="flex flex-col items-center justify-center p-6 bg-gray-800 text-white rounded-xl border-4 border-dashed border-gray-500 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none transition-colors"
          aria-label="Dosya yükle"
        >
          <Upload size={48} className="mb-4" />
          <span className="text-xl font-bold">Dosya Seç</span>
        </button>
      </div>

      <div className="flex flex-col w-full gap-2 mt-4 mb-2">
        <span className="text-xl font-bold text-yellow-400">Özet Dili Seçin:</span>
        <div className="grid grid-cols-3 gap-4">
          <button
            onClick={() => setLanguage('tr')}
            className={`p-4 text-xl font-bold rounded-xl border-4 focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none ${language === 'tr' ? 'bg-blue-600 border-blue-400 text-white' : 'bg-gray-800 border-gray-600 text-gray-300'}`}
          >Türkçe</button>
          <button
            onClick={() => setLanguage('en')}
            className={`p-4 text-xl font-bold rounded-xl border-4 focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none ${language === 'en' ? 'bg-blue-600 border-blue-400 text-white' : 'bg-gray-800 border-gray-600 text-gray-300'}`}
          >English</button>
          <button
            onClick={() => setLanguage('ar')}
            className={`p-4 text-xl font-bold rounded-xl border-4 focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none ${language === 'ar' ? 'bg-blue-600 border-blue-400 text-white' : 'bg-gray-800 border-gray-600 text-gray-300'}`}
          >العربية</button>
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
        <div className="w-full bg-gray-800 p-6 rounded-xl mt-4">
          <h2 className="text-2xl font-bold mb-4 text-yellow-400">Sonuç</h2>
          <p className="whitespace-pre-line">{result}</p>
        </div>
      )}
    </div>
  );
}
