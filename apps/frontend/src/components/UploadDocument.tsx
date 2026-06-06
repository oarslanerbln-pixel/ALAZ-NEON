"use client";

import { useState } from 'react';
import { Camera, Upload, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UploadDocument() {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [lang, setLang] = useState('tr');

  const handleSimulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      let summary = "";
      if (lang === 'tr') {
        summary = "Simüle edilmiş özet (Türkçe):\n1. Durumunuz Nedir?\nKan tahlilleriniz genel olarak normal.\n2. Doktorunuz Ne Demek İstiyor?\nEndişe edecek bir durum yok.\n3. Dikkat Etmeniz Gerekenler\nDüzenli beslenmeye devam edin.";
      } else if (lang === 'en') {
        summary = "Simulated summary (English):\n1. Durumunuz Nedir? (What is your condition?)\nYour blood tests are generally normal.\n2. Doktorunuz Ne Demek İstiyor? (What does your doctor mean?)\nThere is nothing to worry about.\n3. Dikkat Etmeniz Gerekenler (What you need to pay attention to)\nContinue your healthy diet.";
      } else if (lang === 'ar') {
        summary = "Simulated summary (Arabic):\n1. Durumunuz Nedir? (ما هي حالتك؟)\nتحاليل الدم الخاصة بك طبيعية بشكل عام.\n2. Doktorunuz Ne Demek İstiyor? (ماذا يقصد طبيبك؟)\nلا يوجد ما يدعو للقلق.\n3. Dikkat Etmeniz Gerekenler (ما يجب الانتباه إليه)\nاستمر في نظامك الغذائي الصحي.";
      }
      setResult(summary);
    }, 3000);
  };

  return (
    <div className="flex flex-col gap-6 items-center w-full">
      <div className="flex w-full gap-2 mb-2">
        <button
          onClick={() => setLang('tr')}
          className={`flex-1 p-3 rounded-lg font-bold border-2 focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none transition-colors ${lang === 'tr' ? 'bg-blue-600 border-blue-400' : 'bg-gray-800 border-gray-600 hover:bg-gray-700'}`}
        >
          Türkçe
        </button>
        <button
          onClick={() => setLang('en')}
          className={`flex-1 p-3 rounded-lg font-bold border-2 focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none transition-colors ${lang === 'en' ? 'bg-blue-600 border-blue-400' : 'bg-gray-800 border-gray-600 hover:bg-gray-700'}`}
        >
          English
        </button>
        <button
          onClick={() => setLang('ar')}
          className={`flex-1 p-3 rounded-lg font-bold border-2 focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none transition-colors ${lang === 'ar' ? 'bg-blue-600 border-blue-400' : 'bg-gray-800 border-gray-600 hover:bg-gray-700'}`}
        >
          العربية
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full">
        <button
          onClick={handleSimulateScan}
          disabled={isScanning}
          className="flex flex-col items-center justify-center p-6 bg-gray-800 rounded-xl border-2 border-dashed border-gray-600 hover:bg-gray-700 disabled:opacity-50 transition-colors focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none"
          aria-label="Kamera ile çek"
        >
          <Camera size={32} className="mb-2" />
          <span className="font-bold">Fotoğraf Çek</span>
        </button>
        <button
          onClick={handleSimulateScan}
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
          <p className="whitespace-pre-line mb-6">{result}</p>
          <div className="p-4 bg-gray-900 border border-gray-700 rounded-lg">
            <p className="text-sm text-yellow-400 font-bold text-center">
              Bu bir tıbbi tavsiye değildir, yalnızca dil sadeleştirme aracıdır. Lütfen doktorunuza danışın.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
