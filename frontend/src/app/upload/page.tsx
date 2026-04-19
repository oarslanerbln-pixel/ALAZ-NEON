"use client";

import { useState } from "react";
import { Camera, Upload, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function UploadPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleUpload = () => {
    setIsScanning(true);
    // Simulate OCR and API delay
    setTimeout(() => {
      setIsScanning(false);
      setResult("Raporunuz başarıyla taranıp özetlendi. (Özet içeriği burada yer alacak)");
    }, 3000);
  };

  return (
    <div className="flex flex-col items-center p-6 space-y-8 max-w-2xl mx-auto w-full">
      <h1 className="text-3xl font-bold border-b-2 border-white pb-2 w-full text-center">
        Tıbbi Rapor Yükle
      </h1>

      {!isScanning && !result && (
        <div className="flex flex-col w-full space-y-6">
          <button
            onClick={handleUpload}
            className="flex items-center justify-center p-8 border-4 border-dashed border-blue-500 rounded-2xl bg-gray-900 hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400 transition-all group"
            aria-label="Kamera ile fotoğraf çek"
          >
            <div className="flex flex-col items-center space-y-4">
              <Camera className="w-16 h-16 text-blue-400 group-hover:text-blue-300" />
              <span className="text-xl font-bold text-white">Fotoğraf Çek</span>
            </div>
          </button>

          <button
            onClick={handleUpload}
            className="flex items-center justify-center p-8 border-4 border-dashed border-green-500 rounded-2xl bg-gray-900 hover:bg-gray-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400 transition-all group"
            aria-label="Galeriden dosya yükle"
          >
            <div className="flex flex-col items-center space-y-4">
              <Upload className="w-16 h-16 text-green-400 group-hover:text-green-300" />
              <span className="text-xl font-bold text-white">Dosya Yükle</span>
            </div>
          </button>
        </div>
      )}

      <AnimatePresence>
        {isScanning && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center p-12 bg-gray-900 rounded-2xl border-2 border-blue-500 w-full"
            role="alert"
            aria-live="assertive"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            >
              <FileText className="w-20 h-20 text-blue-400" />
            </motion.div>
            <h2 className="text-2xl font-bold mt-6 text-center">Raporunuz taranıyor...</h2>
            <p className="text-lg text-gray-300 mt-2 text-center">Lütfen bekleyin, bu işlem biraz sürebilir.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {result && (
        <div className="w-full bg-gray-900 p-6 rounded-2xl border-2 border-green-500" role="region" aria-label="Tarama Sonucu">
          <h2 className="text-2xl font-bold mb-4 text-green-400">Sonuç</h2>
          <p className="text-lg leading-relaxed">{result}</p>
          <button
            onClick={() => setResult(null)}
            className="mt-8 w-full bg-white text-black font-bold py-4 px-6 rounded-xl text-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400 hover:bg-gray-200"
          >
            Yeni Rapor Yükle
          </button>
        </div>
      )}
    </div>
  );
}
