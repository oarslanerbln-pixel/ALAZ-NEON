"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createWorker } from "tesseract.js";

export default function UploadDocument() {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedText, setScannedText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setScannedText("");

    try {
      const worker = await createWorker("tur");
      const { data: { text } } = await worker.recognize(file);
      setScannedText(text);
      await worker.terminate();
    } catch (error) {
      console.error("OCR Error:", error);
      setScannedText("Okuma sırasında bir hata oluştu.");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-4 w-full max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Rapor Yükle / Fotoğraf Çek</h2>

      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleUpload}
        className="hidden"
        ref={fileInputRef}
        id="camera-input"
      />

      <label
        htmlFor="camera-input"
        className="cursor-pointer bg-yellow-400 text-black py-4 px-8 rounded-2xl font-bold text-xl hover:bg-yellow-300 focus-visible:outline-4 focus-visible:outline-yellow-500 transition-colors w-full text-center"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
      >
        Kamerayı Aç / Seç
      </label>

      <AnimatePresence>
        {isScanning && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-yellow-400 font-bold text-xl mt-4"
            role="alert"
            aria-live="assertive"
          >
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
              Raporunuz taranıyor...
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {scannedText && !isScanning && (
        <div className="w-full mt-6 p-4 border-2 border-yellow-400 rounded-lg bg-black">
          <h3 className="font-bold text-xl mb-2 border-b border-yellow-400/30 pb-2">Okunan Metin:</h3>
          <p className="whitespace-pre-wrap">{scannedText}</p>
        </div>
      )}
    </div>
  );
}
