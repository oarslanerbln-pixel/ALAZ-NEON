"use client";

import { useState, useRef } from "react";
import { Camera, Upload, Loader2, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function UploadDocument() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCapture = () => {
    // In a real app, this would open camera or file dialog
    // For MVP, we simulate the OCR process
    if (fileInputRef.current) {
        fileInputRef.current.click();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        simulateScan();
    }
  }

  const simulateScan = () => {
    setIsScanning(true);
    setScanResult(null);

    // Simulate OCR processing time
    setTimeout(() => {
      setIsScanning(false);
      setScanResult("Belge başarıyla tarandı ve işleniyor...");
    }, 3000);
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 border-4 border-black rounded-xl bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
      <h2 className="text-2xl font-bold mb-6 text-center border-b-2 border-black pb-2">Belge Yükle / Çek</h2>

      <input
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
      />

      {!isScanning && !scanResult && (
        <div className="flex flex-col gap-4">
          <button
            onClick={handleCapture}
            className="flex items-center justify-center gap-3 w-full p-6 text-xl font-bold bg-white text-black border-4 border-black rounded-lg hover:bg-gray-100 focus:ring-4 focus:ring-black focus:outline-none transition-colors"
            aria-label="Kamera ile Belge Çek"
          >
            <Camera className="w-8 h-8" />
            Fotoğraf Çek
          </button>

          <button
            onClick={handleCapture}
            className="flex items-center justify-center gap-3 w-full p-6 text-xl font-bold bg-white text-black border-4 border-black rounded-lg hover:bg-gray-100 focus:ring-4 focus:ring-black focus:outline-none transition-colors"
            aria-label="Galeriden Belge Yükle"
          >
            <Upload className="w-8 h-8" />
            Dosya Yükle
          </button>
        </div>
      )}

      <AnimatePresence>
        {isScanning && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center p-8 text-center"
            role="alert"
            aria-live="assertive"
          >
            <Loader2 className="w-16 h-16 animate-spin mb-4" />
            <p className="text-2xl font-bold">Raporunuz taranıyor...</p>
            <p className="text-lg mt-2">Lütfen bekleyin.</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {scanResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center p-6 text-center bg-green-100 border-4 border-black rounded-lg"
            role="alert"
            aria-live="assertive"
          >
            <CheckCircle className="w-16 h-16 text-green-700 mb-4" />
            <p className="text-xl font-bold text-green-900">{scanResult}</p>
            <button
              onClick={() => setScanResult(null)}
              className="mt-6 px-6 py-3 bg-black text-white font-bold text-lg rounded border-2 border-transparent hover:bg-gray-800 focus:ring-4 focus:ring-black focus:ring-offset-2"
            >
              Yeni Belge
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
