"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud } from "lucide-react";

export default function UploadDocument() {
  const [isScanning, setIsScanning] = useState(false);

  const handleUpload = () => {
    setIsScanning(true);
    // Simulate OCR delay
    setTimeout(() => {
      setIsScanning(false);
    }, 3000);
  };

  return (
    <section className="border-2 border-dashed border-gray-600 p-8 rounded-lg text-center bg-gray-900">
      <h2 className="text-xl font-bold mb-4">Tıbbi Evrak Yükle</h2>

      {!isScanning ? (
        <button
          onClick={handleUpload}
          className="bg-white text-black font-bold py-4 px-6 rounded-lg w-full flex items-center justify-center gap-2 hover:bg-gray-200 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          aria-label="Evrak yüklemek için tıklayın"
        >
          <UploadCloud size={24} />
          Evrak Seç veya Fotoğraf Çek
        </button>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="alert"
            aria-live="assertive"
            className="flex flex-col items-center justify-center py-4"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-12 h-12 border-4 border-white border-t-transparent rounded-full mb-4"
            />
            <p className="text-lg font-bold">Raporunuz taranıyor...</p>
          </motion.div>
        </AnimatePresence>
      )}
    </section>
  );
}