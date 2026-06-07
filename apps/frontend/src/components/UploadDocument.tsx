"use client";

import { useState } from 'react';
import { Camera, Upload, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UploadDocument() {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const [language, setLanguage] = useState<"TR" | "EN" | "AR">("TR");

  const handleSimulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setResult("Simüle edilmiş özet:\n1. Durumunuz Nedir?\n(Durumunuz hakkında bilgi...)\n\n2. Doktorunuz Ne Demek İstiyor?\n(Doktorun tavsiyeleri...)\n\n3. Dikkat Etmeniz Gerekenler\n(Önemli uyarılar...)");
    }, 3000);
  };

  return (
    <div className="flex flex-col gap-6 items-center w-full">
      <div className="w-full flex gap-2 justify-center mb-2">
        <button
          onClick={() => setLanguage("TR")}
          className={`px-4 py-2 font-bold rounded-lg transition-colors focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none ${language === "TR" ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
        >
          TR
        </button>
        <button
          onClick={() => setLanguage("EN")}
          className={`px-4 py-2 font-bold rounded-lg transition-colors focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none ${language === "EN" ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
        >
          EN
        </button>
        <button
          onClick={() => setLanguage("AR")}
          className={`px-4 py-2 font-bold rounded-lg transition-colors focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none ${language === "AR" ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'}`}
        >
          AR
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full">
        <button
          onClick={handleSimulateScan}
          disabled={isScanning}
          className="flex flex-col items-center justify-center p-6 bg-gray-800 rounded-xl border-2 border-dashed border-gray-500 hover:bg-gray-700 disabled:opacity-50 transition-colors focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none"
          aria-label="Kamera ile çek"
        >
          <Camera size={32} className="mb-2 text-white" />
          <span className="font-bold text-white">Fotoğraf Çek</span>
        </button>
        <button
          onClick={handleSimulateScan}
          disabled={isScanning}
          className="flex flex-col items-center justify-center p-6 bg-gray-800 rounded-xl border-2 border-dashed border-gray-500 hover:bg-gray-700 disabled:opacity-50 transition-colors focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none"
          aria-label="Dosya yükle"
        >
          <Upload size={32} className="mb-2 text-white" />
          <span className="font-bold text-white">Dosya Seç</span>
        </button>
      </div>

      <div aria-live="polite" className="w-full">
        <AnimatePresence>
          {isScanning && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 p-8 bg-black border-2 border-yellow-400 rounded-xl w-full"
              role="alert"
            >
              <Loader2 size={48} className="animate-spin text-yellow-400" />
              <p className="text-xl font-bold text-center text-white">Raporunuz taranıyor...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {result && (
        <div className="w-full bg-gray-800 p-6 rounded-xl mt-4 border-2 border-gray-600">
          <h2 className="text-2xl font-bold mb-4 text-yellow-400">Sonuç</h2>
          <p className="whitespace-pre-line text-white mb-6">{result}</p>
          <div className="mt-4 pt-4 border-t border-gray-700">
             <p className="text-sm font-bold text-yellow-400">
               Bu bir tıbbi tavsiye değildir, yalnızca dil sadeleştirme aracıdır. Lütfen doktorunuza danışın.
             </p>
          </div>
        </div>
      )}
    </div>
  );
}
