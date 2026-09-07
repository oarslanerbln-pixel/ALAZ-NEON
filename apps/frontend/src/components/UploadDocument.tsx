"use client";

import { useState } from "react";
import { Camera, Upload, Loader2, ChevronDown } from "lucide-react";
import Tesseract from "tesseract.js";
import { motion, AnimatePresence } from "framer-motion";

export function UploadDocument() {
  const [isScanning, setIsScanning] = useState(false);
  const [resultText, setResultText] = useState("");
  const [summary, setSummary] = useState<{ durum: string; doktor: string; dikkat: string } | null>(null);
  const [language, setLanguage] = useState<"tr" | "en" | "ar">("tr");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setResultText("");
    setSummary(null);

    try {
      const result = await Tesseract.recognize(file, "tur+eng", {
        logger: (m) => console.log(m),
      });

      const text = result.data.text;
      setResultText(text); // Saved to resultText for actual API usage later

      // Simulate LLM Processing with different languages based on selection
      setTimeout(() => {
        let durum = "Raporunuzda bazı değerleriniz normalden biraz yüksek çıkmış.";
        let doktor = "Doktorunuz, bu değerleri düşürmek için diyetinize dikkat etmenizi öneriyor.";
        let dikkat = "Lütfen düzenli ilaçlarınızı aksatmayın ve bol su için.";

        if (language === "en") {
          durum = "Some values in your report are slightly higher than normal.";
          doktor = "Your doctor recommends paying attention to your diet to lower these values.";
          dikkat = "Please take your regular medications without interruption and drink plenty of water.";
        } else if (language === "ar") {
          durum = "بعض القيم في تقريرك أعلى قليلاً من الطبيعي.";
          doktor = "يوصي طبيبك بالاهتمام بنظامك الغذائي لخفض هذه القيم.";
          dikkat = "يرجى تناول أدويتك بانتظام وشرب الكثير من الماء.";
        }

        setSummary({ durum, doktor, dikkat });
        setIsScanning(false);
      }, 2000);

    } catch (error) {
      console.error("OCR Error:", error);
      setIsScanning(false);
      setResultText("Okuma sırasında bir hata oluştu.");
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 max-w-xl mx-auto w-full">
      <div className="flex justify-end mb-2">
        <div className="relative inline-flex items-center">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value as "tr" | "en" | "ar")}
            className="appearance-none bg-black border-2 border-[#00ffff] text-[#00ffff] text-lg font-bold py-2 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#00ffff] cursor-pointer"
            aria-label="Dil Seçimi"
          >
            <option value="tr">Türkçe</option>
            <option value="en">English</option>
            <option value="ar">العربية</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#00ffff]">
            <ChevronDown className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="flex gap-4">
        <label className="flex-1 flex flex-col items-center justify-center p-8 border-4 border-[#00ffff] rounded-2xl cursor-pointer hover:bg-[#00ffff]/10 transition-colors focus-within:ring-4 focus-within:ring-yellow-400">
          <Camera className="w-12 h-12 text-[#00ffff] mb-4" aria-hidden="true" />
          <span className="text-xl font-bold text-[#00ffff] text-center">Fotoğraf Çek</span>
          <input type="file" accept="image/*" capture="environment" className="sr-only" onChange={handleFileUpload} aria-label="Kameradan fotoğraf çek" />
        </label>

        <label className="flex-1 flex flex-col items-center justify-center p-8 border-4 border-[#00ffff] rounded-2xl cursor-pointer hover:bg-[#00ffff]/10 transition-colors focus-within:ring-4 focus-within:ring-yellow-400">
          <Upload className="w-12 h-12 text-[#00ffff] mb-4" aria-hidden="true" />
          <span className="text-xl font-bold text-[#00ffff] text-center">Dosya Yükle</span>
          <input type="file" accept="image/*" className="sr-only" onChange={handleFileUpload} aria-label="Galeriden dosya yükle" />
        </label>
      </div>

      <AnimatePresence>
        {isScanning && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-center gap-4 p-6 bg-yellow-400/20 rounded-xl"
          >
            <Loader2 className="w-8 h-8 text-[#ffff00] animate-spin" />
            <span className="text-xl font-bold">Raporunuz taranıyor...</span>
          </motion.div>
        )}

        {resultText === "Okuma sırasında bir hata oluştu." && !isScanning && (
           <div className="p-4 bg-red-900 border-2 border-red-500 rounded-xl">
             <p className="text-white text-lg font-bold">{resultText}</p>
           </div>
        )}

        {summary && !isScanning && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-black border-2 border-[#00ffff] rounded-xl p-6">
              <h3 className="text-2xl font-bold text-[#00ffff] mb-4 border-b-2 border-[#00ffff] pb-2">
                {language === "tr" ? "1. Durumunuz Nedir?" : language === "en" ? "1. What is your condition?" : "1. ما هي حالتك؟"}
              </h3>
              <p className="text-lg leading-relaxed">{summary.durum}</p>
            </div>

            <div className="bg-black border-2 border-[#00ffff] rounded-xl p-6">
              <h3 className="text-2xl font-bold text-[#00ffff] mb-4 border-b-2 border-[#00ffff] pb-2">
                {language === "tr" ? "2. Doktorunuz Ne Demek İstiyor?" : language === "en" ? "2. What does your doctor mean?" : "2. ماذا يقصد طبيبك؟"}
              </h3>
              <p className="text-lg leading-relaxed">{summary.doktor}</p>
            </div>

            <div className="bg-black border-2 border-[#00ffff] rounded-xl p-6">
              <h3 className="text-2xl font-bold text-[#00ffff] mb-4 border-b-2 border-[#00ffff] pb-2">
                 {language === "tr" ? "3. Dikkat Etmeniz Gerekenler" : language === "en" ? "3. Things to pay attention to" : "3. أشياء يجب الانتباه إليها"}
              </h3>
              <p className="text-lg leading-relaxed">{summary.dikkat}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
