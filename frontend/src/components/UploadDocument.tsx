"use client";

import { useState } from "react";
import { Upload } from "lucide-react";

export default function UploadDocument() {
  const [isScanning, setIsScanning] = useState(false);
  const [resultText, setResultText] = useState("");

  const handleSimulateScan = () => {
    setIsScanning(true);
    // Simulate OCR processing time
    setTimeout(() => {
      setIsScanning(false);
      setResultText("Bu bir simüle edilmiş OCR sonucudur. (Burada OCR metni olacak)");
    }, 2500);
  };

  return (
    <div className="border-4 border-border p-6 rounded-lg text-center bg-background mt-6">
      <h2 className="text-2xl font-bold mb-4">Rapor Yükle / Fotoğraf Çek</h2>

      {!isScanning && !resultText && (
        <div
          className="cursor-pointer flex flex-col items-center justify-center p-8 border-4 border-dashed border-primary hover:bg-primary hover:text-background focus-visible-ring"
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              handleSimulateScan();
            }
          }}
          onClick={handleSimulateScan}
        >
          <Upload size={48} className="mb-2" />
          <p className="text-xl font-bold">Rapor Seç veya Kamerayı Aç</p>
        </div>
      )}

      {isScanning && (
        <div className="p-8 border-4 border-primary bg-primary text-background" role="status" aria-live="polite">
          <p className="text-2xl font-bold animate-pulse">Raporunuz taranıyor...</p>
        </div>
      )}

      {resultText && !isScanning && (
        <div className="text-left border-2 border-border p-4 mt-4 bg-background text-foreground">
          <h3 className="text-xl font-bold mb-2">Taranan Metin:</h3>
          <p>{resultText}</p>
          <button
            className="mt-4 bg-primary text-background font-bold px-4 py-2 border-2 border-border focus-visible-ring"
            onClick={() => setResultText("")}
            aria-label="Yeni rapor yükle"
          >
            Yeni Yükle
          </button>
        </div>
      )}
    </div>
  );
}
