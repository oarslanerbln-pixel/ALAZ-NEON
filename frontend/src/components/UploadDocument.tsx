"use client";

import { useState } from "react";
import { Camera, Upload, Loader2 } from "lucide-react";

export default function UploadDocument() {
  const [isScanning, setIsScanning] = useState(false);

  const handleUpload = () => {
    setIsScanning(true);
    // Placeholder for actual Tesseract.js OCR and LLM integration
    setTimeout(() => {
      setIsScanning(false);
      alert("Tıbbi metin özeti burada görünecek.");
    }, 3000);
  };

  return (
    <section className="border-4 border-yellow-400 p-6 rounded-xl bg-neutral-900 mb-8">
      <h2 className="text-2xl font-bold mb-6 text-center underline decoration-4 underline-offset-4">Evrak Yükle veya Fotoğraf Çek</h2>

      {isScanning ? (
        <div className="flex flex-col items-center justify-center py-12" role="alert" aria-live="assertive">
          <Loader2 className="w-16 h-16 animate-spin text-yellow-400 mb-4" aria-hidden="true" />
          <p className="text-xl font-bold">Raporunuz taranıyor...</p>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleUpload}
            className="flex-1 flex flex-col items-center justify-center gap-3 p-8 border-4 border-yellow-400 rounded-xl hover:bg-yellow-400 hover:text-black focus:bg-yellow-400 focus:text-black transition-colors focus:outline-none focus:ring-4 focus:ring-white focus:ring-offset-4 focus:ring-offset-black"
            aria-label="Kamerayı açarak evrak fotoğrafı çek"
          >
            <Camera className="w-12 h-12" aria-hidden="true" />
            <span className="text-xl font-bold">Kamera</span>
          </button>

          <button
            onClick={handleUpload}
            className="flex-1 flex flex-col items-center justify-center gap-3 p-8 border-4 border-yellow-400 rounded-xl hover:bg-yellow-400 hover:text-black focus:bg-yellow-400 focus:text-black transition-colors focus:outline-none focus:ring-4 focus:ring-white focus:ring-offset-4 focus:ring-offset-black"
            aria-label="Galeriden veya dosyalardan evrak yükle"
          >
            <Upload className="w-12 h-12" aria-hidden="true" />
            <span className="text-xl font-bold">Dosya Yükle</span>
          </button>
        </div>
      )}
    </section>
  );
}
