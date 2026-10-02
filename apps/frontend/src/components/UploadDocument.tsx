"use client";

import { useState } from "react";
import Tesseract from "tesseract.js";
import { t, Language } from "@/lib/i18n";
import { Camera } from "lucide-react";

export default function UploadDocument() {
  const [lang, setLang] = useState<Language>("TR");
  const [isScanning, setIsScanning] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setSummary(null);

    try {
      // Simulate OCR processing time
      await Tesseract.recognize(file, "tur");

      // Mock LLM Response based on system prompt:
      // "Tıbbi metni 70 yaşındaki birinin anlayacağı sadelikte 3 başlıkta özetle..."
      setTimeout(() => {
        setSummary("mock_ready");
        setIsScanning(false);
      }, 2000);
    } catch (error) {
      console.error("OCR failed", error);
      setIsScanning(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="flex justify-center gap-4 mb-8">
        {(["TR", "EN", "AR"] as Language[]).map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            aria-label={`Select ${l} language`}
            className={`px-6 py-3 font-bold text-xl rounded-lg focus-visible-ring ${
              lang === l ? "bg-yellow-400 text-black" : "bg-black text-yellow-400 border-2 border-yellow-400"
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="text-center">
        <label className="cursor-pointer inline-flex items-center gap-4 px-8 py-6 bg-cyan-500 text-black font-bold text-2xl rounded-xl hover:bg-cyan-400 focus-within:ring-4 focus-within:ring-yellow-400 focus-within:outline-none">
          <Camera size={32} />
          <span>{t("upload.button", lang)}</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
            aria-label={t("upload.button", lang)}
          />
        </label>
      </div>

      {isScanning && (
        <div className="text-center p-8 border-4 border-yellow-400 border-dashed rounded-xl">
          <p className="animate-pulse text-yellow-400 text-3xl font-bold">
            {t("upload.scanning", lang)}
          </p>
        </div>
      )}

      {summary && !isScanning && (
        <div className="p-8 bg-gray-900 border-2 border-cyan-500 rounded-xl space-y-6 text-xl">
          <div>
            <h3 className="font-bold text-2xl text-cyan-400 mb-2">{t("upload.summary.1", lang)}</h3>
            <p>Tansiyonunuz biraz yüksek çıkmış. Endişe edecek bir durum yok ama dikkatli olmalıyız.</p>
          </div>
          <div>
            <h3 className="font-bold text-2xl text-cyan-400 mb-2">{t("upload.summary.2", lang)}</h3>
            <p>Doktorunuz yeni bir tansiyon ilacına başlamanızı ve tuzu azaltmanızı istiyor.</p>
          </div>
          <div>
            <h3 className="font-bold text-2xl text-cyan-400 mb-2">{t("upload.summary.3", lang)}</h3>
            <p>İlaçlarınızı her gün aynı saatte alın. Yemeklerde tuzu kesmeniz çok önemli.</p>
          </div>
        </div>
      )}
    </div>
  );
}
