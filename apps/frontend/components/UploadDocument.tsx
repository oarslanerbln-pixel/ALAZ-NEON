'use client';

import React, { useState, useRef } from 'react';
import Tesseract from 'tesseract.js';
import { motion, AnimatePresence } from 'framer-motion';
import { Camera, Upload, FileText, Loader2, AlertCircle } from 'lucide-react';

export default function UploadDocument() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setScanResult(null);
    setError(null);

    try {
      const result = await Tesseract.recognize(
        file,
        'eng+tur', // Support both English and Turkish for robust OCR
        {
          logger: m => console.log(m),
        }
      );

      setScanResult(result.data.text);
    } catch (err) {
      console.error(err);
      setError('Belge okunamadı. Lütfen daha net bir fotoğraf yükleyin.');
    } finally {
      setIsScanning(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
    <div className="w-full max-w-2xl mx-auto p-4 bg-[var(--card-bg)] rounded-xl border-2 border-[var(--border)] shadow-lg">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Belge Yükle</h2>
        <p className="text-lg opacity-90">Tıbbi raporunuzun fotoğrafını çekin veya yükleyin.</p>
      </div>

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileUpload}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <button
          onClick={() => triggerFileInput(true)}
          disabled={isScanning}
          className="flex flex-col items-center justify-center p-6 bg-[var(--interactive)] text-black rounded-xl hover:bg-[var(--interactive-hover)] transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400 disabled:opacity-50"
          aria-label="Kamera ile fotoğraf çek"
        >
          <Camera size={48} className="mb-2" />
          <span className="text-xl font-bold">Fotoğraf Çek</span>
        </button>

        <button
          onClick={() => triggerFileInput(false)}
          disabled={isScanning}
          className="flex flex-col items-center justify-center p-6 border-4 border-[var(--interactive)] text-[var(--interactive)] rounded-xl hover:bg-[#111111] transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400 disabled:opacity-50"
          aria-label="Galeriden fotoğraf yükle"
        >
          <Upload size={48} className="mb-2" />
          <span className="text-xl font-bold">Dosya Seç</span>
        </button>
      </div>

      {/* Persistent wrapper for aria-live status updates */}
      <div role="status" aria-live="polite" className="min-h-[100px] flex flex-col items-center justify-center w-full">
        <AnimatePresence mode="wait">
          {isScanning && (
            <motion.div
              key="scanning"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-col items-center"
            >
              <Loader2 size={64} className="animate-spin text-[var(--interactive)] mb-4" />
              <p className="text-xl font-bold text-[var(--interactive)] animate-pulse">
                Raporunuz taranıyor...
              </p>
            </motion.div>
          )}

          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center p-4 bg-red-900 border-2 border-red-500 rounded-lg text-white"
            >
              <AlertCircle size={32} className="mr-3 shrink-0" />
              <p className="text-lg font-bold">{error}</p>
            </motion.div>
          )}

          {scanResult && !isScanning && (
            <motion.div
              key="result"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="w-full"
            >
              <div className="flex items-center mb-3 text-[var(--interactive)]">
                <FileText size={28} className="mr-2" />
                <h3 className="text-xl font-bold">Taranan Metin:</h3>
              </div>
              <div className="bg-black p-4 rounded-lg border border-[var(--border)] max-h-60 overflow-y-auto">
                <p className="text-base whitespace-pre-wrap">{scanResult}</p>
              </div>
              <div className="mt-4 p-4 border-2 border-dashed border-[var(--interactive)] rounded-lg text-center">
                <p className="text-lg font-bold">
                  (LLM Özeti ve Sadeleştirme Entegrasyonu buraya gelecek)
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
