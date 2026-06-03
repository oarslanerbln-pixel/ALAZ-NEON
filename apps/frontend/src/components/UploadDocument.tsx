"use client";

import { useState } from 'react';
import { Camera, Upload, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UploadDocument() {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [selectedLang, setSelectedLang] = useState<string>('tr');

  const handleSimulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setResult("Simüle edilmiş özet:\n\n1. Durumunuz Nedir?\n2. Doktorunuz Ne Demek İstiyor?\n3. Dikkat Etmeniz Gerekenler\n\nBu bir tıbbi tavsiye değildir, yalnızca dil sadeleştirme aracıdır. Lütfen doktorunuza danışın.");
    }, 3000);
  };

  return (
    <div className="flex flex-col gap-6 items-center w-full">
      <div className="flex flex-col w-full gap-2">
        <h2 className="text-xl font-bold mb-2">Dil Seçimi</h2>
        <div className="grid grid-cols-3 gap-2 w-full">
          <button
            onClick={() => setSelectedLang('tr')}
            className={`p-4 rounded-xl font-bold text-center border-2 focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none transition-colors ${selectedLang === 'tr' ? 'bg-blue-600 border-blue-400' : 'bg-gray-800 border-gray-600 hover:bg-gray-700'}`}
            aria-pressed={selectedLang === 'tr'}
          >
            Türkçe
          </button>
          <button
            onClick={() => setSelectedLang('en')}
            className={`p-4 rounded-xl font-bold text-center border-2 focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none transition-colors ${selectedLang === 'en' ? 'bg-blue-600 border-blue-400' : 'bg-gray-800 border-gray-600 hover:bg-gray-700'}`}
            aria-pressed={selectedLang === 'en'}
          >
            English
          </button>
          <button
            onClick={() => setSelectedLang('ar')}
            className={`p-4 rounded-xl font-bold text-center border-2 focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none transition-colors ${selectedLang === 'ar' ? 'bg-blue-600 border-blue-400' : 'bg-gray-800 border-gray-600 hover:bg-gray-700'}`}
            aria-pressed={selectedLang === 'ar'}
          >
            العربية
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full">
        <button
          onClick={handleSimulateScan}
          disabled={isScanning}
          className="flex flex-col items-center justify-center p-6 bg-gray-800 rounded-xl border-2 border-dashed border-gray-600 focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none hover:bg-gray-700 disabled:opacity-50 transition-colors"
          aria-label="Kamera ile çek"
        >
          <Camera size={32} className="mb-2" />
          <span className="font-bold">Fotoğraf Çek</span>
        </button>
        <button
          onClick={handleSimulateScan}
          disabled={isScanning}
          className="flex flex-col items-center justify-center p-6 bg-gray-800 rounded-xl border-2 border-dashed border-gray-600 focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none hover:bg-gray-700 disabled:opacity-50 transition-colors"
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
        <div
          className="w-full bg-gray-800 border-2 border-white p-6 rounded-xl mt-4"
          role="status"
          aria-live="polite"
        >
          <h2 className="text-2xl font-bold mb-4 text-yellow-400">Sonuç</h2>
          <p className="whitespace-pre-line font-medium">{result}</p>
        </div>
      )}
    </div>
  );
}
