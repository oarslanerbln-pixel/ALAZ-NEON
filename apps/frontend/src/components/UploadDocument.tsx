"use client";

import { useState } from 'react';
import { Camera, Upload, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UploadDocument() {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [language, setLanguage] = useState<"tr" | "en" | "ar">("tr");

  const handleSimulateScan = () => {
    setIsScanning(true);
    setResult(null);
    setTimeout(() => {
      setIsScanning(false);
      setResult("Simüle edilmiş özet:\n1. Durumunuz Nedir?\nHer şey yolunda görünüyor.\n\n2. Doktorunuz Ne Demek İstiyor?\nKan değerleriniz normal.\n\n3. Dikkat Etmeniz Gerekenler\nİlaçlarınızı düzenli kullanın.");
    }, 3000);
  };

  return (
    <div className="flex flex-col gap-6 items-center w-full">
      <div className="w-full flex justify-between gap-2 bg-gray-900 p-2 rounded-xl">
        <button onClick={() => setLanguage("tr")} className={`flex-1 p-3 rounded-lg font-bold focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none ${language === "tr" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}>Türkçe</button>
        <button onClick={() => setLanguage("en")} className={`flex-1 p-3 rounded-lg font-bold focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none ${language === "en" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}>English</button>
        <button onClick={() => setLanguage("ar")} className={`flex-1 p-3 rounded-lg font-bold focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none ${language === "ar" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}>العربية</button>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full">
        <button
          onClick={handleSimulateScan}
          disabled={isScanning}
          className="flex flex-col items-center justify-center p-6 bg-gray-800 rounded-xl border-2 border-dashed border-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none transition-colors"
          aria-label="Kamera ile çek"
        >
          <Camera size={48} className="mb-2 text-yellow-400" />
          <span className="font-bold text-lg text-yellow-400">Fotoğraf Çek</span>
        </button>
        <button
          onClick={handleSimulateScan}
          disabled={isScanning}
          className="flex flex-col items-center justify-center p-6 bg-gray-800 rounded-xl border-2 border-dashed border-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none transition-colors"
          aria-label="Dosya yükle"
        >
          <Upload size={48} className="mb-2 text-yellow-400" />
          <span className="font-bold text-lg text-yellow-400">Dosya Seç</span>
        </button>
      </div>

      <div role="status" aria-live="polite" className="w-full">
        <AnimatePresence>
          {isScanning && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 p-8 bg-blue-900 rounded-xl w-full"
            >
              <Loader2 size={48} className="animate-spin text-blue-300" />
              <p className="text-xl font-bold text-center text-white">Raporunuz taranıyor...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {result && (
          <div className="w-full bg-gray-800 p-6 rounded-xl mt-4">
            <h2 className="text-2xl font-bold mb-4 text-yellow-400">Sonuç Özeti</h2>
            <p className="whitespace-pre-line text-lg">{result}</p>
            <div className="mt-6 p-4 bg-gray-900 border border-gray-700 rounded-lg text-sm text-yellow-400 font-bold">
              Bu bir tıbbi tavsiye değildir, yalnızca dil sadeleştirme aracıdır. Lütfen doktorunuza danışın.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
