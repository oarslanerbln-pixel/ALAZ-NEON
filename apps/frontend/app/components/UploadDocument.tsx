"use client";

import { useState, useRef } from "react";
import { Camera, Upload, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function UploadDocument() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImage(file);
    }
  };

  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  const processImage = (file: File) => {
    setIsScanning(true);
    setScanResult(null);

    // Mock OCR process
    setTimeout(() => {
      setIsScanning(false);
      setScanResult(
        "Sağlık turizmi ve mülteciler için bu özeti anında İngilizce veya Arapça'ya çeviren bir dil seçeneği (i18n) ekle."
      );
    }, 3000);
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-6">
      <h2 className="text-2xl font-bold text-center mb-6">Tıbbi Evrak Yükle</h2>

      <div className="grid grid-cols-2 gap-4">
        <motion.div
          role="button"
          tabIndex={0}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          className="flex flex-col items-center justify-center p-6 bg-neutral-800 rounded-2xl border-2 border-neutral-700 hover:border-yellow-400 focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none cursor-pointer transition-colors"
        >
          <Camera size={48} className="mb-2 text-white" />
          <span className="text-lg font-medium">Fotoğraf Çek</span>
        </motion.div>

        <motion.div
          role="button"
          tabIndex={0}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          className="flex flex-col items-center justify-center p-6 bg-neutral-800 rounded-2xl border-2 border-neutral-700 hover:border-yellow-400 focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none cursor-pointer transition-colors"
        >
          <Upload size={48} className="mb-2 text-white" />
          <span className="text-lg font-medium">Dosya Seç</span>
        </motion.div>
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept="image/*"
        className="hidden"
        aria-hidden="true"
      />

      <div role="status" aria-live="polite" className="min-h-[100px]">
        <AnimatePresence mode="wait">
          {isScanning && (
            <motion.div
              key="scanning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center p-8 bg-neutral-900 rounded-2xl border border-neutral-800"
            >
              <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-xl font-medium">Raporunuz taranıyor...</p>
            </motion.div>
          )}

          {scanResult && !isScanning && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-neutral-900 p-6 rounded-2xl border border-neutral-800"
            >
              <div className="flex items-center gap-2 mb-4 text-yellow-400">
                <AlertCircle size={24} />
                <h3 className="text-xl font-bold">Özet Sonucu</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <h4 className="text-lg font-bold mb-2">1. Durumunuz Nedir?</h4>
                  <p className="text-base text-neutral-300">Test durumu açıklaması.</p>
                </div>
                <div>
                  <h4 className="text-lg font-bold mb-2">2. Doktorunuz Ne Demek İstiyor?</h4>
                  <p className="text-base text-neutral-300">Test doktor açıklaması.</p>
                </div>
                <div>
                  <h4 className="text-lg font-bold mb-2">3. Dikkat Etmeniz Gerekenler</h4>
                  <p className="text-base text-neutral-300">Test dikkat açıklaması.</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
