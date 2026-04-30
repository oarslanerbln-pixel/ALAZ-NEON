"use client";

import React, { useState, useRef } from "react";
import { Camera, Upload, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function UploadDocument() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      startScanMock();
    }
  };

  const handleCameraClick = () => {
    // In a real app, this might use navigator.mediaDevices.getUserMedia
    // For this skeleton, we'll just trigger the file input
    fileInputRef.current?.click();
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const startScanMock = () => {
    setIsScanning(true);
    setScanComplete(false);

    // Mock scanning delay
    setTimeout(() => {
      setIsScanning(false);
      setScanComplete(true);
    }, 3000);
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 border-2 border-yellow-400 rounded-lg bg-black text-yellow-400 my-8">
      <h2 className="text-2xl font-bold mb-6 text-center border-b-2 border-yellow-400 pb-2">Rapor Yükle</h2>

      {/* Hidden File Input */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        ref={fileInputRef}
        onChange={handleFileChange}
        aria-label="Tıbbi rapor fotoğrafı yükle"
      />

      <div className="grid grid-cols-1 gap-6 mb-6">
        <button
          onClick={handleCameraClick}
          className="flex flex-col items-center justify-center p-8 border-4 border-yellow-400 rounded-xl hover:bg-yellow-400 hover:text-black transition-colors focus:outline-none focus:ring-4 focus:ring-yellow-200"
          aria-label="Kamera ile fotoğraf çek"
          disabled={isScanning}
        >
          <Camera size={64} className="mb-4" />
          <span className="text-xl font-bold">Fotoğraf Çek</span>
        </button>

        <button
          onClick={handleUploadClick}
          className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-yellow-400 rounded-xl hover:bg-yellow-900 transition-colors focus:outline-none focus:ring-4 focus:ring-yellow-200"
          aria-label="Galeriden fotoğraf seç"
          disabled={isScanning}
        >
          <Upload size={48} className="mb-2" />
          <span className="text-lg font-bold">Galeriden Seç</span>
        </button>
      </div>

      <AnimatePresence>
        {isScanning && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex flex-col items-center justify-center p-4 border-2 border-yellow-400 rounded bg-yellow-900/50"
            role="alert"
            aria-live="assertive"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="mb-4"
            >
              <div className="w-16 h-16 border-4 border-black border-t-yellow-400 rounded-full" />
            </motion.div>
            <p className="text-xl font-bold text-center">Raporunuz taranıyor... Lütfen bekleyin.</p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {scanComplete && !isScanning && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center justify-center p-4 border-2 border-green-500 text-green-500 rounded bg-green-900/30"
            role="status"
            aria-live="polite"
          >
            <CheckCircle size={48} className="mb-2" />
            <p className="text-xl font-bold text-center">Tarama Tamamlandı!</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
