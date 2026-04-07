"use client";

import { useState } from "react";
import { Camera, Upload, Loader2 } from "lucide-react";

export default function UploadDocument() {
  const [isScanning, setIsScanning] = useState(false);

  const handleUpload = () => {
    setIsScanning(true);
    // Simulate OCR delay
    setTimeout(() => {
      setIsScanning(false);
    }, 3000);
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-border rounded-lg bg-card text-card-foreground my-6">
      <h2 className="text-2xl font-bold mb-4">Tıbbi Rapor Yükle</h2>

      {!isScanning ? (
        <div className="flex flex-col sm:flex-row gap-4">
          <button
            onClick={handleUpload}
            className="flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-md font-bold text-lg focus-ring hover:opacity-90"
            aria-label="Kamerayı açarak fotoğraf çek"
          >
            <Camera size={24} />
            Fotoğraf Çek
          </button>

          <button
            onClick={handleUpload}
            className="flex items-center gap-2 bg-secondary text-secondary-foreground px-6 py-3 rounded-md font-bold text-lg border border-border focus-ring hover:bg-gray-800"
            aria-label="Galeriden dosya yükle"
          >
            <Upload size={24} />
            Dosya Yükle
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 py-8">
          <Loader2 className="w-12 h-12 animate-spin text-primary" />
          <p className="text-xl font-bold" aria-live="polite">Raporunuz taranıyor...</p>
        </div>
      )}
    </div>
  );
}
