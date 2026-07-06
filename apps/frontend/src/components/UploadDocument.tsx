"use client";

import { useState } from 'react';
import { Camera, Upload, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Tesseract from 'tesseract.js';

export default function UploadDocument() {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [language, setLanguage] = useState<'tr' | 'en' | 'ar'>('tr');

  const handleSimulateScan = () => {
    setIsScanning(true);
    // Tesseract.js skeleton
    // const worker = await Tesseract.createWorker('tur');
    setTimeout(() => {
      setIsScanning(false);
      setResult("1. Durumunuz Nedir?\n\n2. Doktorunuz Ne Demek İstiyor?\n\n3. Dikkat Etmeniz Gerekenler");
    }, 3000);
  };

  return (
    <div className="flex flex-col gap-6 items-center w-full">
      <div className="flex gap-4 w-full justify-center">
        <button
          onClick={() => setLanguage('tr')}
          className={`px-6 py-3 font-bold rounded-xl border-4 focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none ${language === 'tr' ? 'bg-yellow-400 text-black border-yellow-400' : 'bg-black text-white border-white hover:bg-gray-800'}`}
        >TR</button>
        <button
          onClick={() => setLanguage('en')}
          className={`px-6 py-3 font-bold rounded-xl border-4 focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none ${language === 'en' ? 'bg-yellow-400 text-black border-yellow-400' : 'bg-black text-white border-white hover:bg-gray-800'}`}
        >EN</button>
        <button
          onClick={() => setLanguage('ar')}
          className={`px-6 py-3 font-bold rounded-xl border-4 focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none ${language === 'ar' ? 'bg-yellow-400 text-black border-yellow-400' : 'bg-black text-white border-white hover:bg-gray-800'}`}
        >AR</button>
      </div>
      <div className="grid grid-cols-2 gap-4 w-full">
        <button
          onClick={handleSimulateScan}
          disabled={isScanning}
          className="flex flex-col items-center justify-center p-6 bg-black rounded-xl border-4 border-dashed border-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none transition-colors"
          aria-label="Kamera ile çek"
        >
          <Camera size={32} className="mb-2 text-white" />
          <span className="font-bold text-white">Fotoğraf Çek</span>
        </button>
        <button
          onClick={handleSimulateScan}
          disabled={isScanning}
          className="flex flex-col items-center justify-center p-6 bg-black rounded-xl border-4 border-dashed border-white hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none transition-colors"
          aria-label="Dosya yükle"
        >
          <Upload size={32} className="mb-2 text-white" />
          <span className="font-bold text-white">Dosya Seç</span>
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
            <Loader2 size={48} className="animate-spin text-yellow-400" />
            <p className="text-xl font-bold text-center text-yellow-400">Raporunuz taranıyor...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {result && (
        <div role="status" aria-live="polite" className="w-full bg-black border-4 border-white p-6 rounded-xl mt-4">
          <h2 className="text-2xl font-bold mb-4 text-yellow-400">Sonuç</h2>
          <p className="whitespace-pre-line text-white">{result}</p>
          <div className="mt-6 p-4 border-t-2 border-dashed border-white text-yellow-400 font-bold text-sm text-center">
            Bu bir tıbbi tavsiye değildir, yalnızca dil sadeleştirme aracıdır. Lütfen doktorunuza danışın.
          </div>
        </div>
      )}
    </div>
  );
}
