'use client';

import React, { useState } from 'react';
import { Camera, Upload, Loader2, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UploadDocument() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      startScanning();
    }
  };

  const handleCameraCapture = () => {
    startScanning();
  };

  const [language, setLanguage] = useState<'tr' | 'en' | 'ar'>('tr');

  const startScanning = () => {
    setIsScanning(true);
    setScanResult(null);

    // Simulate OCR and LLM processing
    setTimeout(() => {
      setIsScanning(false);
      setScanResult(
        "1. Durumunuz Nedir?\nKan tahlillerinize göre hafif bir kansızlık (anemi) durumunuz var.\n\n2. Doktorunuz Ne Demek İstiyor?\nVücudunuzda yeterli demir bulunmuyor, bu yüzden kendinizi yorgun hissediyor olabilirsiniz.\n\n3. Dikkat Etmeniz Gerekenler?\nDoktorunuzun yazdığı demir haplarını her gün düzenli olarak tok karnına almayı unutmayın. Kırmızı et ve ıspanak gibi demir yönünden zengin gıdalar tüketin."
      );
    }, 3000);
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-yellow-400 text-center mb-4">Evrak Yükle veya Çek</h2>

      <div className="flex justify-center gap-2 mb-2">
        {(['tr', 'en', 'ar'] as const).map((lang) => (
          <button
            key={lang}
            onClick={() => setLanguage(lang)}
            className={`px-4 py-2 rounded-lg font-bold uppercase transition-colors ${language === lang ? 'bg-cyan-400 text-black' : 'bg-transparent text-cyan-400 border-2 border-cyan-400'}`}
          >
            {lang}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4">
        <label
          htmlFor="file-upload"
          className="flex items-center justify-center gap-4 bg-transparent border-4 border-cyan-400 text-cyan-400 p-6 rounded-2xl cursor-pointer hover:bg-cyan-950 transition-colors focus-within:outline-none focus-within:ring-4 focus-within:ring-yellow-400"
        >
          <Upload size={32} />
          <span className="text-xl font-bold">Fotoğraf Yükle</span>
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            className="sr-only"
            onChange={handleUpload}
          />
        </label>

        <button
          onClick={handleCameraCapture}
          className="flex items-center justify-center gap-4 bg-transparent border-4 border-cyan-400 text-cyan-400 p-6 rounded-2xl cursor-pointer hover:bg-cyan-950 transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400"
        >
          <Camera size={32} />
          <span className="text-xl font-bold">Kamerayı Aç</span>
        </button>
      </div>

      <div className="mt-8 min-h-[200px]" aria-live="polite" role="status">
        <AnimatePresence mode="wait">
          {isScanning && (
            <motion.div
              key="scanning"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center gap-4 p-8 border-4 border-yellow-400 rounded-2xl bg-black"
            >
              <Loader2 size={48} className="animate-spin text-cyan-400" />
              <p className="text-2xl font-bold text-yellow-400 text-center">
                Raporunuz taranıyor...
              </p>
            </motion.div>
          )}

          {scanResult && !isScanning && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 border-4 border-cyan-400 rounded-2xl bg-black flex flex-col gap-4"
            >
              <div className="flex items-center gap-2 text-cyan-400 mb-2">
                <FileText size={24} />
                <h3 className="text-2xl font-bold">Özet Sonucunuz</h3>
              </div>
              <div className="text-yellow-400 whitespace-pre-wrap text-lg leading-relaxed font-medium">
                {scanResult}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
