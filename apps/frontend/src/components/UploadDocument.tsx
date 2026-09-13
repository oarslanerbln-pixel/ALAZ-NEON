"use client";

import { useState } from "react";
import { Camera, Upload, Loader2 } from "lucide-react";

export default function UploadDocument() {
  const [isScanning, setIsScanning] = useState(false);

  const handleSimulateScan = () => {
    setIsScanning(true);
    // Simulate OCR processing time
    setTimeout(() => {
      setIsScanning(false);
      alert("Simüle edilmiş OCR sonucu: Tarama tamamlandı.");
    }, 3000);
  };

  return (
    <div className="flex flex-col items-center gap-8 p-6 border-4 border-[--color-interactive] rounded-xl max-w-2xl mx-auto mt-10">
      <h2 className="text-3xl font-bold mb-4">Rapor Yükle / Fotoğraf Çek</h2>

      {isScanning ? (
        <div className="flex flex-col items-center gap-4 py-12" aria-live="polite">
          <Loader2 className="w-20 h-20 animate-spin text-[--color-interactive]" />
          <p className="text-2xl font-bold animate-pulse">Raporunuz taranıyor...</p>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-6 w-full">
          <button
            onClick={handleSimulateScan}
            className="flex-1 flex flex-col items-center gap-4 p-8 border-4 border-[--color-interactive] hover:bg-gray-800 transition-colors rounded-xl text-[--color-interactive]"
            aria-label="Kamera ile fotoğraf çek"
          >
            <Camera className="w-16 h-16" />
            <span className="text-2xl font-bold">Fotoğraf Çek</span>
          </button>

          <button
            onClick={handleSimulateScan}
            className="flex-1 flex flex-col items-center gap-4 p-8 border-4 border-[--color-interactive] hover:bg-gray-800 transition-colors rounded-xl text-[--color-interactive]"
            aria-label="Galeriden dosya yükle"
          >
            <Upload className="w-16 h-16" />
            <span className="text-2xl font-bold">Dosya Yükle</span>
          </button>
        </div>
      )}

      <p className="text-lg mt-6 bg-gray-900 p-4 rounded-lg border-2 border-yellow-400">
        <strong>Gizlilik Notu:</strong> Evraklarınız sadece bu cihazda (ephemeral) işlenir, sunucularımızda asla saklanmaz.
      </p>
    </div>
  );
}
