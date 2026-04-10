"use client";

import { useState, useRef } from "react";
import { Camera, Upload, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function UploadDocument() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSimulatedUpload = () => {
    setIsScanning(true);
    setScanComplete(false);

    // Simulate OCR processing time
    setTimeout(() => {
      setIsScanning(false);
      setScanComplete(true);
    }, 3000);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <p className="text-xl">
        Kameranızı kullanarak tıbbi raporunuzu çekin veya bir fotoğraf yükleyin.
      </p>

      {/* Hidden file input for accessibility, triggered by custom UI */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        ref={fileInputRef}
        onChange={handleSimulatedUpload}
        id="document-upload"
        aria-hidden="true"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          role="button"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center p-8 border-4 border-yellow-400 rounded-xl bg-black hover:bg-gray-900 cursor-pointer focus-ring transition-colors"
          aria-label="Kamera ile rapor fotoğrafı çek"
        >
          <Camera size={64} className="text-yellow-400 mb-4" aria-hidden="true" />
          <span className="text-2xl font-bold text-center text-yellow-400">Fotoğraf Çek</span>
        </div>

        <div
          role="button"
          tabIndex={0}
          onKeyDown={handleKeyDown}
          onClick={() => fileInputRef.current?.click()}
          className="flex flex-col items-center justify-center p-8 border-4 border-cyan-400 rounded-xl bg-black hover:bg-gray-900 cursor-pointer focus-ring transition-colors"
          aria-label="Galeriden rapor fotoğrafı yükle"
        >
          <Upload size={64} className="text-cyan-400 mb-4" aria-hidden="true" />
          <span className="text-2xl font-bold text-center text-cyan-400">Dosya Yükle</span>
        </div>
      </div>

      <div aria-live="assertive" className="mt-4">
        <AnimatePresence>
          {isScanning && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-center gap-4 p-6 bg-gray-900 border-2 border-yellow-400 rounded-xl"
            >
              <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin" aria-hidden="true"></div>
              <p className="text-2xl font-bold text-yellow-400">Raporunuz taranıyor... Lütfen bekleyin.</p>
            </motion.div>
          )}
        </AnimatePresence>

        {scanComplete && !isScanning && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-start gap-4 p-6 bg-green-900 border-2 border-green-400 rounded-xl mt-4"
          >
            <FileText size={32} className="text-green-400 shrink-0 mt-1" aria-hidden="true" />
            <div>
              <h3 className="text-2xl font-bold text-green-400 mb-2">Tarama Başarılı!</h3>
              <p className="text-xl">Metin başarıyla sadeleştirildi. (Buraya sadeleştirilmiş sonuçlar gelecektir.)</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
