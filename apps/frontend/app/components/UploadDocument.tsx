"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Camera } from "lucide-react";
import Tesseract from "tesseract.js";

export default function UploadDocument() {
  const { t } = useTranslation();
  const [isScanning, setIsScanning] = useState(false);
  const [resultText, setResultText] = useState("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    try {
      const result = await Tesseract.recognize(file, "tur");
      setResultText(result.data.text);
      // In real MVP, this text would go to LLM API here
    } catch (err) {
      console.error(err);
      setResultText("Okuma hatası oluştu.");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="border-4 border-foreground p-6 my-4">
      <h2 className="text-2xl font-bold mb-4">{t("upload_document")}</h2>

      <label
        className="flex items-center justify-center p-8 border-4 border-dashed border-foreground cursor-pointer hover:bg-interactive-hover focus-within:ring-4 focus-within:ring-interactive"
        tabIndex={0}
      >
        <div className="flex flex-col items-center">
          <Camera size={48} className="mb-2" />
          <span className="text-xl font-bold">{t("upload_document")}</span>
        </div>
        <input
          type="file"
          accept="image/*,application/pdf"
          className="hidden"
          onChange={handleFileUpload}
        />
      </label>

      {/* Persistent wrapper for aria-live */}
      <div role="status" aria-live="polite" className="mt-4 min-h-[50px]">
        {isScanning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xl font-bold text-interactive"
          >
            {t("scanning")}
          </motion.div>
        )}
        {!isScanning && resultText && (
          <div className="mt-4 border-2 border-interactive p-4">
            <h3 className="text-xl font-bold mb-2">OCR Sonucu:</h3>
            <p className="whitespace-pre-wrap">{resultText}</p>
          </div>
        )}
      </div>
    </div>
  );
}
