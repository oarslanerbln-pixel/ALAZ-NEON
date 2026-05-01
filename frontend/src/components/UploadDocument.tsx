"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Upload } from "lucide-react";

export default function UploadDocument() {
  const [isScanning, setIsScanning] = useState(false);

  const handleUpload = () => {
    setIsScanning(true);
    // Simulate OCR processing
    setTimeout(() => {
      setIsScanning(false);
      alert("Taranan metin: Örnek Tıbbi Metin");
    }, 3000);
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 border-2 border-yellow-400 rounded-xl my-6 bg-black">
      <h2 className="text-2xl font-bold mb-6 text-yellow-400">Rapor Yükle / Çek</h2>

      <div className="flex gap-4 mb-8 w-full max-w-md">
        <button
          onClick={handleUpload}
          className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-yellow-400 rounded-lg hover:bg-yellow-900 transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400"
          aria-label="Kamerayı açarak belge tara"
        >
          <Camera size={48} className="mb-2 text-yellow-400" />
          <span className="text-lg font-bold">Kamera</span>
        </button>

        <button
          onClick={handleUpload}
          className="flex-1 flex flex-col items-center justify-center p-6 border-2 border-dashed border-yellow-400 rounded-lg hover:bg-yellow-900 transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400"
          aria-label="Dosya seçerek yükle"
        >
          <Upload size={48} className="mb-2 text-yellow-400" />
          <span className="text-lg font-bold">Dosya Seç</span>
        </button>
      </div>

      <AnimatePresence>
        {isScanning && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center"
            role="alert"
            aria-live="assertive"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full mb-4"
              aria-hidden="true"
            />
            <p className="text-xl font-bold text-yellow-400">Raporunuz taranıyor...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
