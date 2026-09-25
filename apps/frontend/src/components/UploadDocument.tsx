"use client";

import { useState } from "react";
import Tesseract from "tesseract.js";
import { t } from "@/lib/i18n";
import { Camera } from "lucide-react";

export default function UploadDocument() {
  const [isScanning, setIsScanning] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setSummary(null);

    try {
      // Simulate reading/scanning
      const result = await Tesseract.recognize(file, 'tur', {
        logger: m => console.log(m) // for dev/debug
      });

      const rawText = result.data.text;

      // LLM API Stub
      // System prompt: "Tıbbi metni 70 yaşındaki birinin anlayacağı sadelikte 3 başlıkta özetle: 1. Durumunuz Nedir? 2. Doktorunuz Ne Demek İstiyor? 3. Dikkat Etmeniz Gerekenler."

      console.log("Raw OCR Text:", rawText);
      console.log("Using system prompt for simplification...");

      // Simulate LLM delay and response
      await new Promise(resolve => setTimeout(resolve, 2000));
      setSummary(`ÖZET SONUCU:\n\n1. Durumunuz Nedir?\nBelgeleriniz incelendi.\n\n2. Doktorunuz Ne Demek İstiyor?\nHer şey yolunda gözüküyor.\n\n3. Dikkat Etmeniz Gerekenler\nİlaçlarınızı düzenli alın.`);

    } catch (error) {
      console.error("OCR Failed:", error);
      setSummary("Okuma sırasında bir hata oluştu.");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 border-4 border-[#ffff00] p-6 rounded-xl mt-8">
      <h2 className="text-3xl font-bold">Rapor Yükle / Tara</h2>

      <label className="flex flex-col items-center justify-center p-8 border-4 border-dashed border-[#00ffff] rounded-xl cursor-pointer hover:bg-[#111111] transition-colors focus-within:ring-4 focus-within:ring-[#00ffff]">
        <Camera size={64} className="text-[#00ffff] mb-4" />
        <span className="text-2xl font-bold text-[#00ffff]">{t("upload_button")}</span>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          onChange={handleFileUpload}
        />
      </label>

      {isScanning && (
        <div className="flex flex-col items-center gap-4 mt-4 p-4 border-2 border-[#ffff00] rounded-lg">
          <div className="w-12 h-12 border-4 border-[#00ffff] border-t-transparent rounded-full animate-spin"></div>
          <span className="text-2xl font-bold animate-pulse">{t("scanning")}</span>
        </div>
      )}

      {summary && (
        <div className="mt-4 p-6 bg-[#111111] border-2 border-[#00ffff] rounded-xl whitespace-pre-wrap text-xl leading-relaxed">
          {summary}
        </div>
      )}
    </div>
  );
}
