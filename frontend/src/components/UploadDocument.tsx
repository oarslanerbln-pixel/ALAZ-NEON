"use client";

import { useState } from "react";
import { Camera, Upload, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Tesseract from "tesseract.js";

export default function UploadDocument() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setError(null);
    setResult(null);

    try {
      // Ephemeral OCR processing, image is not sent to server
      const { data: { text } } = await Tesseract.recognize(
        file,
        'tur+eng',
        { logger: m => console.log(m) }
      );

      setResult(text);
    } catch (err) {
      console.error(err);
      setError("Rapor okunurken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <section className="w-full max-w-2xl mx-auto flex flex-col gap-6 p-4 rounded-xl border-2 border-yellow-500 bg-gray-950 shadow-lg">
      <h2 className="text-2xl font-bold border-b-2 border-yellow-700 pb-2">Yeni Rapor Yükle</h2>

      <div className="flex flex-col sm:flex-row gap-4">
        <label
          className="flex-1 flex flex-col items-center justify-center p-8 rounded-xl border-4 border-dashed border-yellow-600 hover:bg-yellow-900/30 cursor-pointer focus-within:ring-4 focus-within:ring-yellow-400 transition-colors"
          htmlFor="camera-upload"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              document.getElementById('camera-upload')?.click();
            }
          }}
        >
          <Camera className="w-16 h-16 mb-4 text-yellow-500" aria-hidden="true" />
          <span className="text-xl font-bold text-center">Fotoğraf Çek</span>
          <input
            id="camera-upload"
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            onChange={handleFileUpload}
          />
        </label>

        <label
          className="flex-1 flex flex-col items-center justify-center p-8 rounded-xl border-4 border-dashed border-yellow-600 hover:bg-yellow-900/30 cursor-pointer focus-within:ring-4 focus-within:ring-yellow-400 transition-colors"
          htmlFor="file-upload"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              document.getElementById('file-upload')?.click();
            }
          }}
        >
          <Upload className="w-16 h-16 mb-4 text-yellow-500" aria-hidden="true" />
          <span className="text-xl font-bold text-center">Dosya Seç</span>
          <input
            id="file-upload"
            type="file"
            accept="image/*,.pdf"
            className="sr-only"
            onChange={handleFileUpload}
          />
        </label>
      </div>

      <AnimatePresence mode="wait">
        {isProcessing && (
          <motion.div
            key="processing"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-center gap-4 p-4 bg-yellow-900/50 rounded-lg border-2 border-yellow-500 mt-4"
            role="alert"
            aria-live="assertive"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="w-8 h-8 rounded-full border-4 border-yellow-400 border-t-transparent"
            />
            <span className="text-xl font-bold">Raporunuz taranıyor, lütfen bekleyin...</span>
          </motion.div>
        )}

        {error && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 p-4 bg-red-950 border-2 border-red-500 rounded-lg mt-4 text-red-400"
            role="alert"
            aria-live="assertive"
          >
            <AlertCircle className="w-8 h-8 flex-shrink-0" />
            <span className="text-lg font-bold">{error}</span>
          </motion.div>
        )}

        {result && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-6 bg-gray-900 border-2 border-green-500 rounded-lg mt-4"
            role="region"
            aria-label="Tarama Sonucu"
          >
            <div className="flex items-center gap-2 mb-4 text-green-400">
              <CheckCircle2 className="w-8 h-8" />
              <h3 className="text-2xl font-bold">Tarama Başarılı!</h3>
            </div>
            <p className="text-lg font-medium mb-4">
              Aşağıdaki metin yapay zeka tarafından 3 başlıkta özetlenecektir:
            </p>
            <div className="p-4 bg-black rounded border border-gray-700 max-h-60 overflow-y-auto">
              <p className="whitespace-pre-wrap font-mono text-sm opacity-80">{result}</p>
            </div>

            <button className="mt-6 w-full py-4 bg-yellow-500 hover:bg-yellow-400 text-black text-xl font-bold rounded-xl transition-colors focus:ring-4 focus:ring-yellow-300">
              Anlaşılır Özeti Getir
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
