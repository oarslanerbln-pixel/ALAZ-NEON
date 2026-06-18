"use client";

import { useState } from 'react';
import { Camera, Upload, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UploadDocument() {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [lang, setLang] = useState<'tr' | 'en' | 'ar'>('tr');

  const handleSimulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      if (lang === 'en') {
        setResult("Simulated summary:\n1. What is your condition?\n2. What does your doctor mean?\n3. What you need to pay attention to");
      } else if (lang === 'ar') {
        setResult("ملخص محاكى:\n1. ما هي حالتك؟\n2. ماذا يقصد طبيبك؟\n3. ما يجب الانتباه إليه");
      } else {
        setResult("Simüle edilmiş özet:\n1. Durumunuz Nedir?\n2. Doktorunuz Ne Demek İstiyor?\n3. Dikkat Etmeniz Gerekenler");
      }
    }, 3000);
  };

  return (
    <div className="flex flex-col gap-6 items-center w-full">
      <div className="flex justify-center gap-4 w-full mb-2">
        {(['tr', 'en', 'ar'] as const).map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={`px-4 py-2 font-bold rounded-lg border-2 transition-colors focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none ${lang === l ? 'bg-blue-600 border-blue-400' : 'bg-gray-800 border-gray-600'}`}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4 w-full">
        <button
          onClick={handleSimulateScan}
          disabled={isScanning}
          className="flex flex-col items-center justify-center p-6 bg-gray-800 rounded-xl border-2 border-dashed border-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none"
          aria-label="Kamera ile çek"
        >
          <Camera size={32} className="mb-2" />
          <span className="font-bold">Fotoğraf Çek</span>
        </button>
        <button
          onClick={handleSimulateScan}
          disabled={isScanning}
          className="flex flex-col items-center justify-center p-6 bg-gray-800 rounded-xl border-2 border-dashed border-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none"
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
        <div role="status" aria-live="polite" className="w-full bg-gray-800 p-6 rounded-xl mt-4">
          <h2 className="text-2xl font-bold mb-4 text-yellow-400">Sonuç</h2>
          <p className="whitespace-pre-line text-lg mb-6">{result}</p>
          <p className="text-sm text-yellow-400 font-bold border-t border-gray-700 pt-4">
            Bu bir tıbbi tavsiye değildir, yalnızca dil sadeleştirme aracıdır. Lütfen doktorunuza danışın.
          </p>
        </div>
      )}
    </div>
  );
}
