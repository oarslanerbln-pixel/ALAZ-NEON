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
      <div className="w-full">
        <h2 className="text-xl font-bold mb-3">Dil Seçin / Select Language</h2>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => setLanguage('tr')}
            className={`p-4 text-xl font-bold rounded-xl border-4 transition-colors focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none ${language === 'tr' ? 'bg-black text-yellow-400 border-yellow-400' : 'bg-gray-800 text-white border-gray-600 hover:bg-gray-700'}`}
          >
            Türkçe (Turkish)
          </button>
          <button
            onClick={() => setLanguage('en')}
            className={`p-4 text-xl font-bold rounded-xl border-4 transition-colors focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none ${language === 'en' ? 'bg-black text-yellow-400 border-yellow-400' : 'bg-gray-800 text-white border-gray-600 hover:bg-gray-700'}`}
          >
            English (İngilizce)
          </button>
          <button
            onClick={() => setLanguage('ar')}
            className={`p-4 text-xl font-bold rounded-xl border-4 transition-colors focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none ${language === 'ar' ? 'bg-black text-yellow-400 border-yellow-400' : 'bg-gray-800 text-white border-gray-600 hover:bg-gray-700'}`}
          >
            العربية (Arabic)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full">
        <button
          onClick={handleSimulateScan}
          disabled={isScanning}
          className="flex flex-col items-center justify-center p-6 bg-gray-800 rounded-xl border-4 border-dashed border-gray-600 hover:bg-gray-700 disabled:opacity-50 transition-colors focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none"
          aria-label="Kamera ile çek"
        >
          <Camera size={40} className="mb-2" />
          <span className="font-bold text-xl">Fotoğraf Çek</span>
        </button>
        <button
          onClick={handleSimulateScan}
          disabled={isScanning}
          className="flex flex-col items-center justify-center p-6 bg-gray-800 rounded-xl border-4 border-dashed border-gray-600 hover:bg-gray-700 disabled:opacity-50 transition-colors focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none"
          aria-label="Dosya yükle"
        >
          <Upload size={40} className="mb-2" />
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
        <div className="w-full bg-black border-4 border-yellow-400 p-6 rounded-xl mt-4">
          <h2 className="text-3xl font-bold mb-6 text-yellow-400">Sonuç</h2>
          <div className="text-xl whitespace-pre-line leading-relaxed mb-6">{result}</div>
          <div className="mt-6 p-4 bg-gray-900 border-2 border-yellow-400 rounded-lg">
            <p className="text-lg font-bold text-yellow-400 text-center">
              Bu bir tıbbi tavsiye değildir, yalnızca dil sadeleştirme aracıdır. Lütfen doktorunuza danışın.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
