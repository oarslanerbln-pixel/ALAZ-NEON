"use client";

import { useState, useRef } from "react";
import { Camera, Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function UploadDocument() {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Simulate OCR scanning logic for skeleton
    setIsScanning(true);
    setResult(null);

    setTimeout(() => {
      setIsScanning(false);
      setResult("Bu alan raporunuzun metinleştirilmiş halidir. Gerçek OCR entegrasyonu ilerleyen aşamalarda yapılacaktır.");
    }, 3000);
  };

  return (
    <section className="border-4 border-yellow-400 p-6 rounded-2xl flex flex-col items-center gap-6" aria-labelledby="upload-heading">
      <h2 id="upload-heading" className="text-3xl font-bold text-center">
        Yeni Rapor Ekle
      </h2>

      <p className="text-xl text-center">
        Kameranızla raporunuzun fotoğrafını çekin veya galeriden seçin.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 w-full">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex-1 bg-yellow-400 text-black font-bold py-6 px-8 rounded-xl text-2xl flex items-center justify-center gap-4 hover:bg-yellow-300 focus-visible:outline-4 focus-visible:outline-white focus-visible:outline-offset-4"
          aria-label="Kamerayı Aç veya Fotoğraf Seç"
        >
          <Camera size={40} />
          Fotoğraf Çek / Seç
        </button>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
          aria-hidden="true"
        />
      </div>

      <AnimatePresence>
        {isScanning && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="w-full bg-blue-900 text-white p-6 rounded-xl border-4 border-white font-bold text-2xl text-center"
            role="alert"
            aria-live="assertive"
          >
            <div className="flex items-center justify-center gap-4">
              <Upload className="animate-bounce" size={40} />
              Raporunuz taranıyor... Lütfen bekleyin.
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {result && (
        <div
          className="w-full mt-4 p-6 border-4 border-yellow-400 rounded-xl"
          role="region"
          aria-live="polite"
        >
          <h3 className="text-2xl font-bold mb-4">Tarama Sonucu (Ön İzleme)</h3>
          <p className="text-xl leading-relaxed">{result}</p>
        </div>
      )}
    </section>
  );
}
