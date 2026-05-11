"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Tesseract from "tesseract.js";

export function UploadDocument() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState("");

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setExtractedText("");

    try {
      const result = await Tesseract.recognize(file, "tur", {
        logger: (m) => console.log(m),
      });
      setExtractedText(result.data.text);
    } catch (error) {
      console.error(error);
      setExtractedText("Okuma sırasında bir hata oluştu.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="border-4 border-black p-6 bg-white text-black my-8 rounded-xl">
      <h2 className="text-3xl font-bold mb-6">Yeni Rapor Yükle / Fotoğraf Çek</h2>

      <div className="mb-6">
        <label
          htmlFor="report-upload"
          className="block text-2xl mb-2 font-bold cursor-pointer bg-blue-600 text-white p-4 text-center rounded-xl hover:bg-blue-800"
        >
          Kamerayı Aç veya Dosya Seç
        </label>
        <input
          id="report-upload"
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleImageUpload}
          className="sr-only"
        />
      </div>

      <AnimatePresence>
        {isProcessing && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-2xl font-bold text-center p-4 bg-yellow-400 border-4 border-black rounded-xl mb-6"
            role="alert"
            aria-live="assertive"
          >
            Raporunuz taranıyor... Lütfen bekleyin.
          </motion.div>
        )}
      </AnimatePresence>

      {extractedText && (
        <div className="border-4 border-black p-4 bg-gray-100 rounded-xl">
          <h3 className="text-2xl font-bold mb-4">Okunan Metin:</h3>
          <p className="text-xl whitespace-pre-wrap">{extractedText}</p>
        </div>
      )}
    </div>
  );
}
