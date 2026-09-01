"use client";
import { useState } from "react";

export default function UploadDocument() {
  const [isScanning, setIsScanning] = useState(false);

  const handleUpload = () => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 3000);
  };

  return (
    <div className="p-6 border-4 border-[#00ffff] rounded-lg mb-8">
      <h2 className="text-2xl font-bold mb-4">Evrak Yükle / Kamera</h2>
      <button
        onClick={handleUpload}
        className="w-full py-4 text-xl font-bold bg-[#00ffff] text-black rounded hover:opacity-90"
      >
        Fotoğraf Çek veya Yükle
      </button>

      <div aria-live="polite" role="status" className="mt-4 min-h-[2rem]">
        {isScanning && (
          <p className="text-xl font-bold animate-pulse text-[#00ffff]">
            Raporunuz taranıyor...
          </p>
        )}
      </div>
    </div>
  );
}
