"use client";

import { useState, useRef } from "react";
import Tesseract from "tesseract.js";
import { Camera, Upload, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function UploadDocument() {
  const [isScanning, setIsScanning] = useState(false);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleScan = async (file: File) => {
    setIsScanning(true);
    setExtractedText(null);
    try {
      const result = await Tesseract.recognize(file, "tur");
      setExtractedText(result.data.text);
    } catch (error) {
      console.error("OCR Error:", error);
      alert("Metin tarama sırasında bir hata oluştu.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleScan(file);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-6">
      <div className="flex gap-4 w-full">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 flex flex-col items-center justify-center p-6 border-4 border-cyan-400 rounded-2xl hover:bg-cyan-900 transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400"
          aria-label="Kamera ile çek veya Fotoğraf yükle"
        >
          <Camera className="w-12 h-12 text-cyan-400 mb-2" />
          <Upload className="w-8 h-8 text-cyan-400 absolute opacity-0" />
          <span className="text-xl font-bold text-center">Belge Yükle</span>
        </button>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      <AnimatePresence>
        {isScanning && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex flex-col items-center gap-4 p-8 bg-zinc-900 rounded-2xl border-2 border-yellow-400"
          >
            <Loader2 className="w-16 h-16 text-cyan-400 animate-spin" />
            <h2 className="text-2xl font-bold animate-pulse text-yellow-400">Raporunuz taranıyor...</h2>
            <p className="text-lg text-center">Lütfen bekleyin, metin ayrıştırılıyor.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {extractedText && (
        <div className="p-6 bg-zinc-900 rounded-2xl border-2 border-cyan-400">
          <h3 className="text-2xl font-bold mb-4 text-cyan-400">Taranan Metin:</h3>
          <p className="whitespace-pre-wrap text-lg leading-relaxed">{extractedText}</p>
        </div>
      )}
    </div>
  );
}
