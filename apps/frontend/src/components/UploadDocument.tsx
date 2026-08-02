"use client";

import { useState } from 'react';
import { Camera, Upload, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UploadDocument() {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [language, setLanguage] = useState('TR');

  const handleSimulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      if (language === 'TR') {
        setResult("Simüle edilmiş özet:\n1. Durumunuz Nedir?\n2. Doktorunuz Ne Demek İstiyor?\n3. Dikkat Etmeniz Gerekenler");
      } else if (language === 'EN') {
        setResult("Simulated summary:\n1. What is your condition?\n2. What does your doctor mean?\n3. Things to watch out for");
      } else {
        setResult("ملخص محاكى:\n1. ما هي حالتك؟\n2. ماذا يقصد طبيبك؟\n3. أشياء يجب الانتباه إليها");
      }
    }, 3000);
  };

  return (
    <div className="flex flex-col gap-6 items-center w-full">
      <div className="flex gap-2 w-full mb-2">
         <button onClick={() => setLanguage('TR')} className={`flex-1 py-3 font-bold rounded-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400 ${language === 'TR' ? 'bg-blue-600 text-white' : 'bg-gray-800'}`}>TR</button>
         <button onClick={() => setLanguage('EN')} className={`flex-1 py-3 font-bold rounded-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400 ${language === 'EN' ? 'bg-blue-600 text-white' : 'bg-gray-800'}`}>EN</button>
         <button onClick={() => setLanguage('AR')} className={`flex-1 py-3 font-bold rounded-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400 ${language === 'AR' ? 'bg-blue-600 text-white' : 'bg-gray-800'}`}>AR</button>
      </div>
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

      <div role="status" aria-live="polite" className="w-full">
        {result && (
          <div className="w-full bg-gray-800 p-6 rounded-xl mt-4">
            <h2 className="text-2xl font-bold mb-4 text-yellow-400">Sonuç</h2>
            <p className="whitespace-pre-line mb-6">{result}</p>
            <p className="text-base text-yellow-400 font-bold p-4 bg-gray-900 rounded-lg">
              Bu bir tıbbi tavsiye değildir, yalnızca dil sadeleştirme aracıdır. Lütfen doktorunuza danışın.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
