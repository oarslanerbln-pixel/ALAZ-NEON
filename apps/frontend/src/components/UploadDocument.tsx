"use client";

import React, { useState, useRef } from 'react';
import { Camera, Upload, Loader2, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Tesseract from 'tesseract.js';

export default function UploadDocument() {
  const [isScanning, setIsScanning] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [language, setLanguage] = useState<'tr' | 'en' | 'ar'>('tr');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setSummary(null);

    try {
      // Simulate OCR and LLM processing
      // In a real implementation, this would use Tesseract.js directly or send to backend
      const result = await Tesseract.recognize(file, 'tur', {
        logger: m => console.log(m)
      });

      console.log("OCR Result length:", result.data.text.length);

      // Mock LLM Response for MVP
      setTimeout(() => {
        setSummary(`
1. Durumunuz Nedir?
Tansiyonunuz biraz yüksek ölçülmüş. Doktorunuz bunun için bir ilaç yazmış.

2. Doktorunuz Ne Demek İstiyor?
Günlük hayatınızda tuza dikkat etmeniz ve düzenli yürüyüş yapmanız gerekiyor.

3. Dikkat Etmeniz Gerekenler
İlacınızı her sabah aç karnına aynı saatte içmeyi unutmayın.
        `.trim());
        setIsScanning(false);
      }, 2000);

    } catch (error) {
      console.error("Error during scanning:", error);
      setIsScanning(false);
      alert("Okuma işlemi başarısız oldu. Lütfen daha net bir fotoğraf çekin.");
    }
  };

  const handleTranslate = (lang: 'tr' | 'en' | 'ar') => {
    setLanguage(lang);
    // In a real implementation, this would call a translation API
    if (lang === 'en') {
      setSummary(`
1. What is your condition?
Your blood pressure was measured a bit high. Your doctor prescribed a medication for this.

2. What does your doctor mean?
You need to pay attention to your salt intake and take regular walks.

3. What to pay attention to
Do not forget to take your medicine every morning on an empty stomach at the same time.
      `.trim());
    } else if (lang === 'ar') {
        setSummary(`
1. ما هي حالتك؟
تم قياس ضغط دمك مرتفعًا قليلاً. وصف طبيبك دواءً لذلك.

2. ماذا يعني طبيبك؟
تحتاج إلى الانتباه إلى تناول الملح والقيام بنزهات منتظمة.

3. ما يجب الانتباه إليه
لا تنس تناول دوائك كل صباح على معدة فارغة في نفس الوقت.
        `.trim());
    } else {
        setSummary(`
1. Durumunuz Nedir?
Tansiyonunuz biraz yüksek ölçülmüş. Doktorunuz bunun için bir ilaç yazmış.

2. Doktorunuz Ne Demek İstiyor?
Günlük hayatınızda tuza dikkat etmeniz ve düzenli yürüyüş yapmanız gerekiyor.

3. Dikkat Etmeniz Gerekenler
İlacınızı her sabah aç karnına aynı saatte içmeyi unutmayın.
        `.trim());
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto">
      {/* File Inputs - Hidden */}
      <input
        type="file"
        accept="image/*"
        capture="environment"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        aria-hidden="true"
      />

      {/* Upload/Camera Buttons */}
      {!isScanning && !summary && (
        <div className="flex flex-col gap-4">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-4 bg-blue-600 hover:bg-blue-700 text-white p-8 rounded-2xl text-2xl font-bold transition-colors focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none"
          >
            <Camera size={40} />
            Fotoğraf Çek
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full flex items-center justify-center gap-4 bg-gray-800 hover:bg-gray-700 text-white p-6 rounded-2xl text-xl font-bold transition-colors focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none"
          >
            <Upload size={32} />
            Galeriden Seç
          </button>
        </div>
      )}

      {/* Scanning Animation */}
      <AnimatePresence>
        {isScanning && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col items-center justify-center p-12 bg-gray-900 rounded-2xl border border-gray-800"
            role="alert"
            aria-live="assertive"
          >
            <Loader2 size={64} className="text-blue-500 animate-spin mb-6" />
            <h2 className="text-2xl font-bold text-white text-center">Raporunuz taranıyor...</h2>
            <p className="text-gray-400 text-lg mt-4 text-center">Bu işlem birkaç saniye sürebilir.</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {summary && !isScanning && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col gap-6"
          >
            {/* Translate Controls */}
            <div className="flex bg-gray-900 p-2 rounded-xl gap-2 border border-gray-800">
              <div className="flex items-center justify-center p-2 text-gray-400">
                <Globe size={24} />
              </div>
              <button
                onClick={() => handleTranslate('tr')}
                className={`flex-1 py-3 text-lg font-bold rounded-lg transition-colors focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none ${language === 'tr' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                TR
              </button>
              <button
                onClick={() => handleTranslate('en')}
                className={`flex-1 py-3 text-lg font-bold rounded-lg transition-colors focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none ${language === 'en' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                EN
              </button>
              <button
                onClick={() => handleTranslate('ar')}
                className={`flex-1 py-3 text-lg font-bold rounded-lg transition-colors focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none ${language === 'ar' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
              >
                AR
              </button>
            </div>

            {/* Summary Content */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg">
              <h2 className="text-3xl font-bold text-white mb-6 border-b border-gray-800 pb-4">Rapor Özeti</h2>
              <div className="text-white text-lg leading-relaxed whitespace-pre-wrap">
                {summary}
              </div>
            </div>

            {/* Actions */}
            <button
              onClick={() => {
                setSummary(null);
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="w-full py-4 bg-gray-800 hover:bg-gray-700 text-white rounded-xl text-xl font-bold transition-colors focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none"
            >
              Yeni Rapor Tara
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
