"use client";

import React, { useState, useRef } from 'react';
import { Camera, Upload, Loader2 } from 'lucide-react';
import Tesseract from 'tesseract.js';
import { motion, AnimatePresence } from 'framer-motion';

export const UploadDocument = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  // const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Show preview
    // const objectUrl = URL.createObjectURL(file);
    // setPreviewUrl(objectUrl);

    // Start scanning
    setIsScanning(true);
    setScanResult(null);

    try {
      const result = await Tesseract.recognize(file, 'tur', {
        logger: m => console.log(m)
      });
      setScanResult(result.data.text);
    } catch (error) {
      console.error("OCR Error:", error);
      setScanResult("Okuma sırasında bir hata oluştu. Lütfen daha net bir fotoğraf yüklemeyi deneyin.");
    } finally {
      setIsScanning(false);
    }
  };

  const triggerFileInput = (capture: boolean) => {
    if (fileInputRef.current) {
      if (capture) {
        fileInputRef.current.setAttribute('capture', 'environment');
      } else {
        fileInputRef.current.removeAttribute('capture');
      }
      fileInputRef.current.click();
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold mb-4">Belge Yükle</h2>

      <div className="flex flex-col sm:flex-row gap-4">
        <button
          onClick={() => triggerFileInput(true)}
          className="flex-1 flex flex-col items-center justify-center p-8 border-4 border-interactive rounded-2xl bg-background text-interactive hover:bg-interactive hover:text-background transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400"
          aria-label="Kamerayı aç ve fotoğraf çek"
        >
          <Camera size={48} className="mb-2" />
          <span className="text-xl font-bold">Fotoğraf Çek</span>
        </button>

        <button
          onClick={() => triggerFileInput(false)}
          className="flex-1 flex flex-col items-center justify-center p-8 border-4 border-foreground rounded-2xl bg-background text-foreground hover:bg-foreground hover:text-background transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400"
          aria-label="Galeriden belge yükle"
        >
          <Upload size={48} className="mb-2" />
          <span className="text-xl font-bold">Galeriden Seç</span>
        </button>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
        aria-hidden="true"
      />

      {/* Persistent wrapper for polite screen reader announcements */}
      <div role="status" aria-live="polite" className="mt-4">
        <AnimatePresence mode="wait">
          {isScanning && (
            <motion.div
              key="scanning"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center p-8 border-4 border-interactive border-dashed rounded-2xl"
            >
              <Loader2 size={64} className="animate-spin text-interactive mb-4" />
              <p className="text-2xl font-bold text-interactive text-center">Raporunuz taranıyor...</p>
              <p className="text-lg mt-2 text-center">Lütfen bekleyin.</p>
            </motion.div>
          )}

          {scanResult && !isScanning && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 border-4 border-foreground rounded-2xl bg-background"
            >
              <h3 className="text-2xl font-bold mb-4 border-b-2 border-foreground pb-2">Tarama Sonucu</h3>
              <p className="whitespace-pre-wrap text-lg">{scanResult}</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
