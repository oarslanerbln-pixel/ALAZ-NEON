"use client";

import { useState } from "react";
import { Camera, Upload, Loader2 } from "lucide-react";

export function UploadDocument() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);

  // Mocking the OCR upload process
  const handleUpload = () => {
    setIsScanning(true);
    setScanResult(null);

    // Simulate OCR processing time
    setTimeout(() => {
      setIsScanning(false);
      setScanResult("Özetlenecek rapor metni başarıyla tarandı.");
    }, 3000);
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 border-4 border-[#00ffff] rounded-2xl bg-black max-w-md mx-auto w-full my-8">
      <h2 className="text-2xl font-bold text-[#ffff00] mb-6">Rapor Yükle / Çek</h2>

      {!isScanning && !scanResult && (
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <button
            onClick={handleUpload}
            className="flex-1 flex flex-col items-center justify-center p-6 bg-[#111] hover:bg-[#222] border-2 border-[#00ffff] rounded-xl text-[#00ffff] high-contrast-focus transition-colors"
            aria-label="Fotoğraf Çek"
          >
            <Camera size={48} className="mb-2" />
            <span className="font-bold text-lg">Kamera</span>
          </button>

          <button
            onClick={handleUpload}
            className="flex-1 flex flex-col items-center justify-center p-6 bg-[#111] hover:bg-[#222] border-2 border-[#00ffff] rounded-xl text-[#00ffff] high-contrast-focus transition-colors"
            aria-label="Dosya Yükle"
          >
            <Upload size={48} className="mb-2" />
            <span className="font-bold text-lg">Yükle</span>
          </button>
        </div>
      )}

      {isScanning && (
        <div className="flex flex-col items-center justify-center py-8">
          <Loader2 size={64} className="animate-spin text-[#00ffff] mb-4" />
          <p className="text-xl font-bold text-[#ffff00] animate-pulse">
            Raporunuz taranıyor...
          </p>
        </div>
      )}

      {scanResult && !isScanning && (
        <div className="w-full text-center">
          <div className="p-4 bg-[#111] border-2 border-[#00ffff] rounded-xl mb-4">
            <p className="text-[#ffff00] font-semibold text-lg">{scanResult}</p>
          </div>
          <button
            onClick={() => setScanResult(null)}
            className="w-full py-4 bg-[#00ffff] text-black font-bold text-xl rounded-xl hover:bg-white high-contrast-focus"
          >
            Yeni Rapor Yükle
          </button>
        </div>
      )}
    </div>
  );
}
