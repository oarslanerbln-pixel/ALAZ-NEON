"use client";

import { useState } from "react";
import { Upload } from "lucide-react";

export default function UploadDocument() {
  const [isScanning, setIsScanning] = useState(false);
  const [language, setLanguage] = useState("en");

  const handleUpload = () => {
    setIsScanning(true);
    // Simulate OCR scanning process
    setTimeout(() => {
      setIsScanning(false);
    }, 3000);
  };

  return (
    <div className="p-6 border-2 border-[#ffff00] rounded-lg mb-6">
      <h2 className="text-2xl mb-4">Rapor Yükle (Kamera / Dosya)</h2>

      <div className="mb-4">
        <p className="mr-2 mb-2">Özet Dili:</p>
        <div className="flex gap-2">
          <button
            onClick={() => setLanguage("en")}
            className={`border-2 border-[#00ffff] p-3 text-base cursor-pointer flex-1 ${
              language === "en" ? "bg-[#00ffff] text-black" : "bg-black text-[#00ffff]"
            }`}
            aria-label="Özet dili İngilizce olarak seç"
          >
            İngilizce
          </button>
          <button
            onClick={() => setLanguage("ar")}
            className={`border-2 border-[#00ffff] p-3 text-base cursor-pointer flex-1 ${
              language === "ar" ? "bg-[#00ffff] text-black" : "bg-black text-[#00ffff]"
            }`}
            aria-label="Özet dili Arapça olarak seç"
          >
            Arapça
          </button>
        </div>
      </div>

      {isScanning ? (
        <div className="text-xl text-[#00ffff] flex items-center gap-2">
          <span>Raporunuz taranıyor...</span>
          <span className="animate-pulse">⏳</span>
        </div>
      ) : (
        <button
          onClick={handleUpload}
          className="bg-black text-[#00ffff] border-2 border-[#00ffff] p-4 text-xl flex items-center gap-2 cursor-pointer w-full justify-center"
          aria-label="Rapor yüklemek için tıklayın"
        >
          <Upload size={24} />
          <span>Fotoğraf Çek veya Yükle</span>
        </button>
      )}
    </div>
  );
}
