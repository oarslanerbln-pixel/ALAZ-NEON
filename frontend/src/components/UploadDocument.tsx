"use client";

import { useState } from "react";
import { Camera, Upload, Loader2, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function UploadDocument() {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleUpload = () => {
    // Ephemeral processing: file is not saved to server
    setIsScanning(true);
    setResult(null);

    // Mock Tesseract.js processing
    setTimeout(() => {
      setIsScanning(false);
      setResult("Örnek OCR Sonucu: Metin başarıyla okundu.");
    }, 3000);
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-8 bg-black text-white w-full max-w-md mx-auto rounded-xl border-4 border-yellow-300">
      <h2 className="text-3xl font-bold text-yellow-300 text-center">Rapor Yükle / Çek</h2>

      {!isScanning && !result && (
        <div className="flex flex-col w-full space-y-4">
          <button
            onClick={handleUpload}
            className="flex items-center justify-center p-6 bg-yellow-300 text-black rounded-xl font-bold text-2xl hover:bg-yellow-400 focus-visible:ring-4 focus-visible:ring-white transition-all w-full"
            aria-label="Kamerayı açarak raporunuzun fotoğrafını çekin"
          >
            <Camera className="w-10 h-10 mr-4" aria-hidden="true" />
            Fotoğraf Çek
          </button>

          <button
            onClick={handleUpload}
            className="flex items-center justify-center p-6 bg-gray-800 text-yellow-300 border-4 border-yellow-300 rounded-xl font-bold text-2xl hover:bg-gray-700 focus-visible:ring-4 focus-visible:ring-white transition-all w-full"
            aria-label="Galeriden rapor görseli yükleyin"
          >
            <Upload className="w-10 h-10 mr-4" aria-hidden="true" />
            Galeri'den Seç
          </button>
        </div>
      )}

      <AnimatePresence>
        {isScanning && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center space-y-4 p-8 bg-gray-900 rounded-xl w-full border-4 border-yellow-300"
            role="alert"
            aria-live="assertive"
          >
            <Loader2 className="w-16 h-16 animate-spin text-yellow-300" aria-hidden="true" />
            <p className="text-2xl font-bold text-yellow-300 text-center animate-pulse">
              Raporunuz taranıyor...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {result && (
        <div className="w-full flex flex-col space-y-4" role="region" aria-label="Tarama Sonucu">
          <div className="p-6 bg-gray-900 border-4 border-green-400 rounded-xl">
             <div className="flex items-center mb-4 text-green-400">
                 <FileText className="w-8 h-8 mr-2" aria-hidden="true" />
                 <h3 className="text-2xl font-bold">Tarama Başarılı</h3>
             </div>
             <p className="text-xl text-white leading-relaxed">{result}</p>
          </div>
          <button
            onClick={() => setResult(null)}
            className="p-4 bg-yellow-300 text-black font-bold text-xl rounded-xl w-full hover:bg-yellow-400 focus-visible:ring-4 focus-visible:ring-white"
          >
            Yeni Rapor Tara
          </button>
        </div>
      )}
    </div>
  );
}
