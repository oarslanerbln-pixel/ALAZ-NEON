"use client";

import { useState } from "react";
import { UploadCloud, FileText, Camera } from "lucide-react";

export default function UploadDocument() {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleUpload = () => {
    setIsScanning(true);
    // Mock processing delay for OCR
    setTimeout(() => {
      setIsScanning(false);
      setResult("OCR Tamamlandı (Örnek Metin)");
    }, 3000);
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 border-4 border-cyan-400 rounded-2xl bg-black max-w-xl mx-auto w-full my-8">
      <h2 className="text-3xl font-bold text-yellow-400 mb-6">Tıbbi Evrak Yükle</h2>

      {!isScanning && !result && (
        <div className="flex flex-col gap-6 w-full">
          <button
            onClick={handleUpload}
            className="flex items-center justify-center gap-4 bg-cyan-600 hover:bg-cyan-500 text-black font-bold text-xl py-6 px-8 rounded-xl w-full transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400"
          >
            <Camera size={36} />
            Fotoğraf Çek
          </button>

          <button
            onClick={handleUpload}
            className="flex items-center justify-center gap-4 border-4 border-yellow-400 text-yellow-400 hover:bg-yellow-900/50 font-bold text-xl py-6 px-8 rounded-xl w-full transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-400"
          >
            <UploadCloud size={36} />
            Galeriden Seç
          </button>
        </div>
      )}

      <div className="w-full" aria-live="polite" role="status">
        {isScanning && (
          <div className="flex flex-col items-center py-8">
            <div className="w-16 h-16 border-8 border-cyan-400 border-t-yellow-400 rounded-full animate-spin mb-4"></div>
            <p className="text-2xl font-bold text-yellow-400 animate-pulse">Raporunuz taranıyor...</p>
          </div>
        )}

        {result && !isScanning && (
          <div className="flex flex-col gap-4 w-full">
            <div className="p-4 border-2 border-yellow-400 rounded-lg">
              <div className="flex items-center gap-2 mb-2 text-cyan-400">
                <FileText size={28} />
                <h3 className="text-2xl font-bold">Tarama Sonucu</h3>
              </div>
              <p className="text-xl leading-relaxed">{result}</p>
            </div>

            <button
              onClick={() => setResult(null)}
              className="mt-4 bg-yellow-500 text-black font-bold text-xl py-4 rounded-xl hover:bg-yellow-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-400"
            >
              Yeni Belge Yükle
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
