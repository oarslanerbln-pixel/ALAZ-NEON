"use client";

import { useState } from 'react';
import { Camera, Upload, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UploadDocument() {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleSimulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setResult("Simüle edilmiş özet:\n1. Durumunuz Nedir?\n2. Doktorunuz Ne Demek İstiyor?\n3. Dikkat Etmeniz Gerekenler");
    }, 3000);
  };

  const [language, setLanguage] = useState("tr");

  return (
    <div className="flex flex-col gap-6 items-center w-full">
      <div className="flex justify-center gap-2 w-full mb-2">
        <button
          onClick={() => setLanguage("tr")}
          className={`px-4 py-2 font-bold rounded-lg focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none transition-colors ${language === "tr" ? "bg-yellow-400 text-black" : "bg-gray-800 text-white hover:bg-gray-700"}`}
          aria-pressed={language === "tr"}
        >
          Türkçe
        </button>
        <button
          onClick={() => setLanguage("en")}
          className={`px-4 py-2 font-bold rounded-lg focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none transition-colors ${language === "en" ? "bg-yellow-400 text-black" : "bg-gray-800 text-white hover:bg-gray-700"}`}
          aria-pressed={language === "en"}
        >
          English
        </button>
        <button
          onClick={() => setLanguage("ar")}
          className={`px-4 py-2 font-bold rounded-lg focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none transition-colors ${language === "ar" ? "bg-yellow-400 text-black" : "bg-gray-800 text-white hover:bg-gray-700"}`}
          aria-pressed={language === "ar"}
        >
          العربية
        </button>
      </div>

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
        <div className="w-full bg-gray-800 p-6 rounded-xl mt-4" role="status" aria-live="polite">
          <h2 className="text-2xl font-bold mb-4 text-yellow-400">Sonuç</h2>
          <p className="whitespace-pre-line mb-6">{result}</p>
          <div className="mt-4 p-4 bg-gray-900 rounded-lg border border-gray-700 text-yellow-400 text-base font-bold text-center">
            Bu bir tıbbi tavsiye değildir, yalnızca dil sadeleştirme aracıdır. Lütfen doktorunuza danışın.
          </div>
        </div>
      )}
    </div>
  );
}
