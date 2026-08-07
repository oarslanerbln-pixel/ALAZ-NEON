"use client";

import { useState } from 'react';
import { Camera, Upload, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UploadDocument() {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [language, setLanguage] = useState<"tr" | "en" | "ar">("tr");

  const handleSimulateScan = () => {
    setIsScanning(true);
    setResult(null);
    setTimeout(() => {
      setIsScanning(false);
      const baseText = "1. Durumunuz Nedir?\nKan tahlili sonuçlarınız normal görünmektedir.\n\n2. Doktorunuz Ne Demek İstiyor?\nEndişelenecek bir durum yok, sağlığınız iyi.\n\n3. Dikkat Etmeniz Gerekenler\nDüzenli beslenmeye ve egzersiz yapmaya devam edin.";
      const translated = language === "en" ? "1. What is your condition?\nYour blood test results look normal.\n\n2. What does your doctor mean?\nNothing to worry about, you are healthy.\n\n3. Things to pay attention to\nKeep eating healthy and exercising." : language === "ar" ? "1. ما هي حالتك؟\nنتائج فحص الدم تبدو طبيعية.\n\n2. ماذا يقصد طبيبك؟\nلا داعي للقلق، صحتك جيدة.\n\n3. أشياء يجب الانتباه إليها\nاستمر في تناول طعام صحي وممارسة الرياضة." : baseText;
      setResult(`Simüle edilmiş özet:\n\n${translated}\n\nBu bir tıbbi tavsiye değildir, yalnızca dil sadeleştirme aracıdır. Lütfen doktorunuza danışın.`);
    }, 3000);
  };

  return (
    <div className="flex flex-col gap-6 items-center w-full">
      <div className="flex gap-2 w-full justify-center mb-2">
        <button onClick={() => setLanguage("tr")} className={`px-4 py-2 rounded-lg font-bold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400 ${language === "tr" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300"}`}>Türkçe</button>
        <button onClick={() => setLanguage("en")} className={`px-4 py-2 rounded-lg font-bold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400 ${language === "en" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300"}`}>English</button>
        <button onClick={() => setLanguage("ar")} className={`px-4 py-2 rounded-lg font-bold focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400 ${language === "ar" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300"}`}>العربية</button>
      </div>
      <div className="grid grid-cols-2 gap-4 w-full">
        <button
          onClick={handleSimulateScan}
          disabled={isScanning}
          className="flex flex-col items-center justify-center p-6 bg-gray-800 rounded-xl border-2 border-dashed border-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400"
          aria-label="Kamera ile çek"
        >
          <Camera size={32} className="mb-2" />
          <span className="font-bold">Fotoğraf Çek</span>
        </button>
        <button
          onClick={handleSimulateScan}
          disabled={isScanning}
          className="flex flex-col items-center justify-center p-6 bg-gray-800 rounded-xl border-2 border-dashed border-gray-600 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400"
          aria-label="Dosya yükle"
        >
          <Upload size={32} className="mb-2" />
          <span className="font-bold">Dosya Seç</span>
        </button>
      </div>

      <div role="status" aria-live="polite" className="w-full">
        <AnimatePresence mode="wait">
          {isScanning ? (
            <motion.div
              key="scanning"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center gap-4 p-8 bg-blue-900 rounded-xl w-full mt-4"
            >
              <Loader2 size={48} className="animate-spin text-blue-300" />
              <p className="text-xl font-bold text-center">Raporunuz taranıyor...</p>
            </motion.div>
          ) : result ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full bg-gray-800 p-6 rounded-xl mt-4"
            >
              <h2 className="text-2xl font-bold mb-4 text-yellow-400">Sonuç</h2>
              <p className="whitespace-pre-line">{result}</p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </div>
  );
}
