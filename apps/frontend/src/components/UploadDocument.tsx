"use client";

import React, { useState, useRef } from "react";
import { Camera } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function UploadDocument() {
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsScanning(true);
      // Simulate scanning process
      setTimeout(() => {
        setIsScanning(false);
        alert("Tarama tamamlandı (Simülasyon)");
      }, 3000);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="flex flex-col items-center w-full max-w-md mx-auto p-4 space-y-6">
      <h2 className="text-2xl font-bold text-yellow-400 text-center">Tıbbi Evrak Yükle</h2>

      <p className="text-lg text-center font-semibold">
        Raporunuzu taramak için fotoğraf çekin veya seçin.
      </p>

      <input
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
        aria-label="Tıbbi evrak yükle veya fotoğraf çek"
      />

      <button
        type="button"
        onClick={handleButtonClick}
        disabled={isScanning}
        className="w-full flex items-center justify-center space-x-4 bg-yellow-400 text-black py-6 rounded-2xl text-xl font-extrabold focus-visible-high-contrast hover:bg-yellow-300 disabled:opacity-50 transition-colors"
        aria-busy={isScanning}
      >
        <Camera size={32} aria-hidden="true" />
        <span>Kamera ile Çek / Seç</span>
      </button>

      <AnimatePresence>
        {isScanning && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center space-y-4"
            role="alert"
            aria-live="assertive"
          >
            <div className="w-16 h-16 border-8 border-yellow-400 border-t-black rounded-full animate-spin" />
            <p className="text-xl font-bold animate-pulse">Raporunuz taranıyor...</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
