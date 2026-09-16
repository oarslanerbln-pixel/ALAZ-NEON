"use client";

import { useState } from "react";

export default function UploadDocument() {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleUpload = () => {
    setIsScanning(true);
    setResult(null);

    // Simulate OCR and LLM processing
    setTimeout(() => {
      setIsScanning(false);
      setResult("Örnek sadeleştirilmiş rapor sonucu.");
    }, 3000);
  };

  return (
    <div className="p-4 border-2 border-interactive rounded-lg my-6">
      <h2 className="text-2xl font-bold mb-4">Tıbbi Evrak Yükle</h2>

      {!isScanning && !result && (
        <button
          onClick={handleUpload}
          className="w-full bg-interactive text-background font-bold text-xl py-6 px-4 rounded-xl hover:opacity-90 active:scale-95 transition-transform"
          aria-label="Evrak Fotoğrafı Çek veya Yükle"
        >
          Belge Yükle / Fotoğraf Çek
        </button>
      )}

      {isScanning && (
        <div className="text-center py-8">
          <div className="animate-pulse text-2xl font-bold text-interactive mb-4">
            Raporunuz taranıyor...
          </div>
          <div className="w-12 h-12 border-4 border-interactive border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      )}

      {result && (
        <div className="mt-4">
          <h3 className="text-xl font-bold text-interactive mb-2">Sonuç:</h3>
          <p className="text-lg bg-foreground text-background p-4 rounded">{result}</p>
          <button
            onClick={() => setResult(null)}
            className="mt-4 bg-background border-2 border-interactive text-interactive font-bold py-2 px-4 rounded"
            aria-label="Yeni belge yükle"
          >
            Yeni Belge Yükle
          </button>
        </div>
      )}
    </div>
  );
}
