"use client";

import { useState } from 'react';
import { Camera, Upload, Loader2 } from 'lucide-react';
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
          className="flex flex-col items-center justify-center p-6 bg-black rounded-xl border-4 border-white hover:bg-gray-800 focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Kamera ile çek"
        >
          <Camera size={32} className="mb-2" />
          <span className="font-bold">Fotoğraf Çek</span>
        </button>
        <button
          onClick={handleSimulateScan}
          disabled={isScanning}
          className="flex flex-col items-center justify-center p-6 bg-black rounded-xl border-4 border-white hover:bg-gray-800 focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
        <div className="w-full flex flex-col gap-4 mt-4">
          <div className="flex gap-2 w-full justify-center">
            <button onClick={() => setLanguage('tr')} className={`px-4 py-2 text-xl font-bold rounded-lg border-2 focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none ${language === 'tr' ? 'bg-white text-black border-white' : 'bg-black text-white border-white'}`}>Türkçe</button>
            <button onClick={() => setLanguage('en')} className={`px-4 py-2 text-xl font-bold rounded-lg border-2 focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none ${language === 'en' ? 'bg-white text-black border-white' : 'bg-black text-white border-white'}`}>English</button>
            <button onClick={() => setLanguage('ar')} className={`px-4 py-2 text-xl font-bold rounded-lg border-2 focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none ${language === 'ar' ? 'bg-white text-black border-white' : 'bg-black text-white border-white'}`}>العربية</button>
          </div>
          <div className="w-full bg-black border-4 border-white p-6 rounded-xl" role="status" aria-live="polite">
            <h2 className="text-3xl font-bold mb-4 text-yellow-400">Sonuç</h2>
            <p className="whitespace-pre-line text-2xl">{result}</p>
            <div className="mt-6 p-4 bg-gray-900 border-2 border-yellow-400 rounded-lg">
              <p className="text-lg font-bold text-yellow-400">Bu bir tıbbi tavsiye değildir, yalnızca dil sadeleştirme aracıdır. Lütfen doktorunuza danışın.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
