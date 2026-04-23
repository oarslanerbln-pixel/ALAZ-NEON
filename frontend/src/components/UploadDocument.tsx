"use client";

import { useState } from "react";
import { Camera } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function UploadDocument() {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpload = () => {
    setIsProcessing(true);
    // Simulate OCR processing time
    setTimeout(() => {
      setIsProcessing(false);
    }, 3000);
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 border-4 border-yellow-400 rounded-xl my-4">
      <h2 className="text-2xl font-bold mb-6 text-center">Rapor Yükle / Fotoğraf Çek</h2>

      <button
        onClick={handleUpload}
        disabled={isProcessing}
        className="flex items-center justify-center gap-4 bg-yellow-400 text-black px-8 py-6 rounded-2xl text-xl font-bold hover:bg-yellow-300 transition-colors focus-visible:outline-4 focus-visible:outline-white disabled:opacity-50"
        aria-label="Kamera ile rapor fotoğrafı çek veya yükle"
      >
        <Camera size={48} />
        <span>Belge Yükle</span>
      </button>

      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-8 p-4 border-2 border-yellow-400 bg-black text-yellow-400 font-bold text-xl rounded-lg"
            role="alert"
            aria-live="assertive"
          >
            <motion.span
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              Raporunuz taranıyor...
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
