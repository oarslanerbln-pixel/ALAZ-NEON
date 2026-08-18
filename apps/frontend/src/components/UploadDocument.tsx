"use client";

import { useState } from "react";
import { Upload, Camera, FileText, Loader2 } from "lucide-react";

export default function UploadDocument() {
  const [isScanning, setIsScanning] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);

  const handleUpload = () => {
    setIsScanning(true);
    setSummary(null);

    // Mock OCR and LLM processing delay
    setTimeout(() => {
      setIsScanning(false);
      setSummary("Tıbbi metin özeti yükleniyor...");
    }, 2000);
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto p-4 border-2 border-[var(--primary)] rounded-xl">
      <h2 className="text-2xl font-bold text-center">Rapor Yükle / Çek</h2>

      <div className="flex flex-col gap-4">
        <button
          onClick={handleUpload}
          className="flex items-center justify-center gap-3 p-4 rounded-lg border-2"
          aria-label="Kamera ile fotoğraf çek"
        >
          <Camera size={32} />
          <span>Fotoğraf Çek</span>
        </button>

        <button
          onClick={handleUpload}
          className="flex items-center justify-center gap-3 p-4 rounded-lg border-2"
          aria-label="Galeriden veya dosyalardan seç"
        >
          <Upload size={32} />
          <span>Dosya Seç</span>
        </button>
      </div>

      <div aria-live="polite" role="status" className="min-h-[100px] flex items-center justify-center">
        {isScanning ? (
          <div className="flex flex-col items-center gap-2 text-[var(--primary)]">
            <Loader2 className="animate-spin" size={48} />
            <p className="font-bold">Raporunuz taranıyor...</p>
          </div>
        ) : summary ? (
          <div className="p-4 border-2 border-[var(--primary)] rounded-lg">
            <h3 className="font-bold mb-2 flex items-center gap-2">
              <FileText />
              Sonuç
            </h3>
            <p>{summary}</p>
          </div>
        ) : (
          <p className="text-center opacity-70">Lütfen taramak için bir rapor yükleyin.</p>
        )}
      </div>
    </div>
  );
}
