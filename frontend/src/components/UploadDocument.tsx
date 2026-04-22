"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Tesseract from 'tesseract.js';
import { Camera, Upload } from 'lucide-react';

export default function UploadDocument() {
  const [isScanning, setIsScanning] = useState(false);
  const [extractedText, setExtractedText] = useState('');

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setExtractedText('');

    try {
      const result = await Tesseract.recognize(file, 'tur', {
        logger: (m) => console.log(m),
      });
      setExtractedText(result.data.text);
    } catch (error) {
      console.error("OCR Error:", error);
      setExtractedText("Rapor okunurken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-4 border-4 border-hc-text rounded-xl bg-hc-bg w-full max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-hc-accent">Tıbbi Evrak Yükle</h2>

      <div className="flex gap-4 w-full">
        <label className="flex-1 flex flex-col items-center justify-center p-8 border-4 border-dashed border-hc-text hover:border-hc-accent cursor-pointer transition-colors bg-hc-text text-hc-bg rounded-lg">
          <Upload size={48} className="mb-2" />
          <span className="text-xl font-bold">Fotoğraf Seç</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageUpload}
          />
        </label>

        <label className="flex-1 flex flex-col items-center justify-center p-8 border-4 border-dashed border-hc-text hover:border-hc-accent cursor-pointer transition-colors bg-hc-text text-hc-bg rounded-lg">
          <Camera size={48} className="mb-2" />
          <span className="text-xl font-bold">Kamera ile Çek</span>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleImageUpload}
          />
        </label>
      </div>

      {isScanning && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xl font-bold text-hc-accent flex items-center gap-3 p-4 border-2 border-hc-accent rounded w-full justify-center"
          role="alert"
          aria-live="assertive"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-6 h-6 border-4 border-hc-accent border-t-transparent rounded-full"
          />
          Raporunuz taranıyor... Lütfen bekleyin.
        </motion.div>
      )}

      {extractedText && !isScanning && (
        <div className="w-full mt-4 p-4 border-2 border-hc-text rounded">
          <h3 className="text-xl font-bold mb-2">Çıkarılan Metin:</h3>
          <p className="whitespace-pre-wrap">{extractedText}</p>
        </div>
      )}
    </div>
  );
}
