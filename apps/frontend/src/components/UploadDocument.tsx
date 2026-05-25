"use client";

import { useState, useRef } from 'react';
import { Camera, Upload, Loader2, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Tesseract from 'tesseract.js';

type Language = 'tr' | 'en' | 'ar';

export default function UploadDocument() {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [language, setLanguage] = useState<Language>('tr');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleScan = async (file: File) => {
    setIsScanning(true);
    setResult(null);

    try {
      const { data: { text } } = await Tesseract.recognize(
        file,
        'eng+tur',
        { logger: m => console.log(m) }
      );

      // In a real implementation, we would send 'text' and 'language' to our LLM API here.
      // For now, we simulate the LLM response based on the OCR result.
      setTimeout(() => {
        setIsScanning(false);
        setResult(`[${language.toUpperCase()}] Simüle edilmiş özet:\n\n1. Durumunuz Nedir?\n[OCR Metni: ${text.substring(0, 50)}...]\n\n2. Doktorunuz Ne Demek İstiyor?\nHer şey yolunda görünüyor.\n\n3. Dikkat Etmeniz Gerekenler\nİlaçlarınızı düzenli alın.`);
      }, 1500);

    } catch (error) {
      console.error(error);
      setIsScanning(false);
      setResult("Bir hata oluştu. Lütfen tekrar deneyin.");
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleScan(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col gap-6 items-center w-full">
      <div className="flex items-center gap-2 bg-gray-800 p-2 rounded-lg w-full">
        <Globe size={24} className="text-gray-400" />
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value as Language)}
          className="bg-transparent border-none text-white font-bold w-full focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none p-2 rounded"
          aria-label="Özet Dili Seçimi"
        >
          <option value="tr">Türkçe (TR)</option>
          <option value="en">English (EN)</option>
          <option value="ar">العربية (AR)</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full">
        <input
          type="file"
          accept="image/*"
          capture="environment"
          ref={cameraInputRef}
          onChange={onFileChange}
          className="hidden"
          aria-hidden="true"
        />
        <button
          onClick={() => cameraInputRef.current?.click()}
          disabled={isScanning}
          className="flex flex-col items-center justify-center p-6 bg-gray-800 rounded-xl border-2 border-dashed border-gray-600 hover:bg-gray-700 disabled:opacity-50 transition-colors focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none"
          aria-label="Kamera ile çek"
        >
          <Camera size={32} className="mb-2" />
          <span className="font-bold">Fotoğraf Çek</span>
        </button>

        <input
          type="file"
          accept="image/*,application/pdf"
          ref={fileInputRef}
          onChange={onFileChange}
          className="hidden"
          aria-hidden="true"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isScanning}
          className="flex flex-col items-center justify-center p-6 bg-gray-800 rounded-xl border-2 border-dashed border-gray-600 hover:bg-gray-700 disabled:opacity-50 transition-colors focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none"
          aria-label="Dosya yükle"
        >
          <Upload size={32} className="mb-2" />
          <span className="font-bold">Dosya Seç</span>
        </button>
      </div>

      <AnimatePresence>
        {isScanning && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4 p-8 bg-blue-900 rounded-xl w-full"
            role="alert"
            aria-live="assertive"
          >
            <Loader2 size={48} className="animate-spin text-blue-300" />
            <p className="text-xl font-bold text-center">Raporunuz taranıyor...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {result && (
        <div className="w-full bg-gray-800 p-6 rounded-xl mt-4">
          <h2 className="text-2xl font-bold mb-4 text-yellow-400">Sonuç</h2>
          <p className="whitespace-pre-line">{result}</p>
        </div>
      )}
    </div>
  );
}
