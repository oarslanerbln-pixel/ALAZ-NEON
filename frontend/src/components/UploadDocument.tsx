"use client";

import { useState } from "react";
import { Camera, Upload, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function UploadDocument() {
  const [isScanning, setIsScanning] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleUpload = () => {
    setIsScanning(true);
    setIsComplete(false);

    // Mock OCR işlemi - gerçekte Tesseract.js entegre edilecek
    setTimeout(() => {
      setIsScanning(false);
      setIsComplete(true);
    }, 3000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleUpload();
    }
  };

  return (
    <section
      className="w-full bg-gray-900 border-2 border-gray-600 rounded-xl p-6 mb-8 shadow-lg"
      aria-labelledby="upload-heading"
    >
      <h2 id="upload-heading" className="text-2xl font-bold mb-6 text-center text-white">
        Tıbbi Rapor Yükle
      </h2>

      {!isScanning && !isComplete && (
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <div
            role="button"
            tabIndex={0}
            onClick={handleUpload}
            onKeyDown={handleKeyDown}
            className="flex-1 flex flex-col items-center justify-center p-8 bg-blue-700 hover:bg-blue-600 text-white rounded-xl border-4 border-blue-900 focus-ring cursor-pointer transition-colors"
            aria-label="Kamera ile fotoğraf çekerek yükle"
          >
            <Camera size={48} className="mb-4" aria-hidden="true" />
            <span className="text-xl font-bold">Fotoğraf Çek</span>
          </div>

          <div
            role="button"
            tabIndex={0}
            onClick={handleUpload}
            onKeyDown={handleKeyDown}
            className="flex-1 flex flex-col items-center justify-center p-8 bg-gray-700 hover:bg-gray-600 text-white rounded-xl border-4 border-gray-800 focus-ring cursor-pointer transition-colors"
            aria-label="Dosyalardan rapor yükle"
          >
            <Upload size={48} className="mb-4" aria-hidden="true" />
            <span className="text-xl font-bold">Dosya Yükle</span>
          </div>
        </div>
      )}

      <AnimatePresence>
        {isScanning && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center justify-center p-8"
            role="alert"
            aria-live="assertive"
          >
            <div className="w-16 h-16 border-8 border-yellow-400 border-t-transparent rounded-full animate-spin mb-6" aria-hidden="true"></div>
            <p className="text-2xl font-bold text-yellow-400">Raporunuz taranıyor...</p>
            <p className="text-gray-300 mt-2 text-center">Bu işlem birkaç saniye sürebilir, lütfen bekleyin.</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center p-8 bg-green-900/30 rounded-xl border-2 border-green-500"
            role="status"
            aria-live="polite"
          >
            <CheckCircle size={64} className="text-green-500 mb-4" aria-hidden="true" />
            <p className="text-2xl font-bold text-green-400 text-center">Tarama Tamamlandı!</p>
            <p className="text-white mt-2 mb-6 text-center">Rapor özeti hazırlanıyor...</p>

            <button
              onClick={() => setIsComplete(false)}
              className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg focus-ring transition-colors"
            >
              Yeni Rapor Yükle
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
