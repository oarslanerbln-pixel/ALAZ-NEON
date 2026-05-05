"use client";

import { useState } from "react";
import { Camera, Upload, Loader2 } from "lucide-react";

export function UploadDocument() {
  const [isScanning, setIsScanning] = useState(false);

  const handleUpload = () => {
    setIsScanning(true);
    // Simulate OCR scanning
    setTimeout(() => {
      setIsScanning(false);
      alert("Taranan metin işleniyor...");
    }, 3000);
  };

  return (
    <div className="flex flex-col gap-4 p-4 border-2 border-yellow-400 rounded-xl bg-gray-900">
      <p className="text-lg">Tıbbi raporunuzun fotoğrafını çekin veya yükleyin.</p>

      {isScanning ? (
        <div className="flex flex-col items-center justify-center p-8 gap-4" role="alert" aria-live="assertive">
          <Loader2 className="w-12 h-12 animate-spin text-yellow-400" aria-hidden="true" />
          <p className="text-xl font-bold">Raporunuz taranıyor...</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 sm:flex-row">
          <button
            onClick={handleUpload}
            className="flex-1 flex items-center justify-center gap-2 bg-yellow-400 text-black p-4 rounded-lg font-bold text-lg hover:bg-yellow-300 focus-visible:outline-4 focus-visible:outline-white"
            aria-label="Kamerayı açarak rapor fotoğrafı çek"
          >
            <Camera className="w-6 h-6" aria-hidden="true" />
            <span>Kamera</span>
          </button>
          <button
            onClick={handleUpload}
            className="flex-1 flex items-center justify-center gap-2 border-2 border-yellow-400 text-yellow-400 p-4 rounded-lg font-bold text-lg hover:bg-gray-800 focus-visible:outline-4 focus-visible:outline-white"
            aria-label="Cihazdan rapor dosyası yükle"
          >
            <Upload className="w-6 h-6" aria-hidden="true" />
            <span>Yükle</span>
          </button>
        </div>
      )}
    </div>
  );
}
