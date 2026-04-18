"use client";

import React, { useState, useRef } from "react";
import { Camera, Upload, Loader2, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function UploadDocument() {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      simulateScan();
    }
  };

  const simulateScan = () => {
    setIsScanning(true);
    setResult(null);

    // Mock OCR process
    setTimeout(() => {
      setIsScanning(false);
      setResult("Bu bir örnek rapor özetidir:\n\n1. Durumunuz Nedir?\nGenel kan değerleriniz normal.\n\n2. Doktorunuz Ne Demek İstiyor?\nHerhangi bir enfeksiyon bulgusu yok.\n\n3. Dikkat Etmeniz Gerekenler\nBol su içmeye devam edin.");
    }, 3000);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      triggerFileInput();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 bg-zinc-900 border-2 border-zinc-700 rounded-xl shadow-lg mt-8">
      <h2 className="text-2xl font-bold mb-6 text-white text-center">Rapor Yükle</h2>

      <div
        role="button"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        onClick={triggerFileInput}
        className="w-full h-48 border-4 border-dashed border-zinc-500 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white transition-colors"
        aria-label="Kamera ile fotoğraf çek veya dosya yükle"
      >
        <Camera className="w-16 h-16 mb-4 text-zinc-300" aria-hidden="true" />
        <span className="text-lg font-semibold text-zinc-300">Fotoğraf Çek / Yükle</span>
      </div>

      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
      />

      <AnimatePresence>
        {isScanning && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-6 flex flex-col items-center justify-center p-4 bg-blue-900 rounded-lg border-2 border-blue-500"
            role="alert"
            aria-live="assertive"
          >
            <Loader2 className="w-10 h-10 animate-spin text-white mb-2" aria-hidden="true" />
            <p className="text-lg font-bold text-white text-center">Raporunuz taranıyor...</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-zinc-800 rounded-lg border-2 border-green-500"
            role="region"
            aria-live="polite"
            aria-label="Tarama Sonucu"
          >
            <div className="flex items-center mb-4 border-b border-zinc-600 pb-2">
              <FileText className="w-6 h-6 mr-2 text-green-400" aria-hidden="true" />
              <h3 className="text-xl font-bold text-white">Sadeleştirilmiş Özet</h3>
            </div>
            <div className="whitespace-pre-wrap text-zinc-200 text-lg leading-relaxed">
              {result}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
