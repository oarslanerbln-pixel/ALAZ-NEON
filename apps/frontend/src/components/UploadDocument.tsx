"use client";

import { useState, useRef } from 'react';
import { Camera, Upload, Loader2, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Tesseract from 'tesseract.js';

export default function UploadDocument() {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [language, setLanguage] = useState<'tr' | 'en' | 'ar'>('tr');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processImage = async (file: File) => {
    setIsScanning(true);
    setResult(null);
    try {
      // 1. Tesseract.js OCR
      await Tesseract.recognize(file, 'tur');

      // 2. Mock LLM Summarization and Translation
      await new Promise(resolve => setTimeout(resolve, 2000));
      let summary = "";
      if (language === 'en') {
        summary = "1. What is your condition?\n(Mock simplified summary)\n\n2. What does your doctor mean?\n(Mock explanation)\n\n3. What you need to pay attention to\n(Mock advice)";
      } else if (language === 'ar') {
        summary = "1. ما هي حالتك؟\n(ملخص مبسط وهمي)\n\n2. ماذا يقصد طبيبك؟\n(شرح وهمي)\n\n3. ما يجب الانتباه إليه\n(نصيحة وهمية)";
      } else {
        summary = "1. Durumunuz Nedir?\n(Mock sadeleştirilmiş özet)\n\n2. Doktorunuz Ne Demek İstiyor?\n(Mock açıklama)\n\n3. Dikkat Etmeniz Gerekenler\n(Mock tavsiye)";
      }
      setResult(summary);
    } catch (_error) {
      setResult("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImage(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col gap-6 items-center w-full">
      <div className="flex flex-col gap-2 w-full bg-gray-800 p-4 rounded-xl">
        <div className="flex items-center gap-2 mb-2 text-yellow-400">
           <Globe size={24} />
           <span className="font-bold">Dil Seçimi</span>
        </div>
        <div className="flex gap-2">
          <button
             onClick={() => setLanguage('tr')}
             className={`flex-1 py-3 rounded-lg font-bold text-lg border-2 focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none transition-colors ${language === 'tr' ? 'bg-blue-600 border-blue-400 text-white' : 'bg-gray-700 border-gray-600 text-gray-300'}`}
          >
            Türkçe
          </button>
          <button
             onClick={() => setLanguage('en')}
             className={`flex-1 py-3 rounded-lg font-bold text-lg border-2 focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none transition-colors ${language === 'en' ? 'bg-blue-600 border-blue-400 text-white' : 'bg-gray-700 border-gray-600 text-gray-300'}`}
          >
            English
          </button>
          <button
             onClick={() => setLanguage('ar')}
             className={`flex-1 py-3 rounded-lg font-bold text-lg border-2 focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none transition-colors ${language === 'ar' ? 'bg-blue-600 border-blue-400 text-white' : 'bg-gray-700 border-gray-600 text-gray-300'}`}
          >
            العربية
          </button>
        </div>
      </div>

      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="grid grid-cols-2 gap-4 w-full">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isScanning}
          className="flex flex-col items-center justify-center p-6 bg-gray-800 rounded-xl border-2 border-dashed border-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none"
          aria-label="Kamera ile çek"
        >
          <Camera size={32} className="mb-2" />
          <span className="font-bold">Fotoğraf Çek</span>
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isScanning}
          className="flex flex-col items-center justify-center p-6 bg-gray-800 rounded-xl border-2 border-dashed border-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none"
          aria-label="Dosya yükle"
        >
          <Upload size={32} className="mb-2" />
          <span className="font-bold">Dosya Seç</span>
        </button>
      </div>

      <div role="status" aria-live="polite" className="w-full">
        <AnimatePresence>
          {isScanning && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 p-8 bg-blue-900 rounded-xl w-full"
            >
              <Loader2 size={48} className="animate-spin text-blue-300" />
              <p className="text-xl font-bold text-center">Raporunuz taranıyor...</p>
            </motion.div>
          )}
        </AnimatePresence>

        {result && !isScanning && (
          <div className="w-full bg-gray-800 p-6 rounded-xl mt-4 border-2 border-gray-600">
            <h2 className="text-2xl font-bold mb-4 text-yellow-400">Sonuç</h2>
            <p className="whitespace-pre-line text-xl leading-relaxed mb-6">{result}</p>
            <div className="p-4 bg-gray-900 border-t border-gray-700 rounded-b-lg">
              <p className="text-sm text-yellow-400 font-bold text-center">
                Bu bir tıbbi tavsiye değildir, yalnızca dil sadeleştirme aracıdır. Lütfen doktorunuza danışın.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
