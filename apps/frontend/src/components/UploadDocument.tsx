"use client";

import { useState } from "react";
import { Upload, Camera, Loader2 } from "lucide-react";

export default function UploadDocument() {
  const [isScanning, setIsScanning] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsScanning(true);
      // Simulate scanning process
      setTimeout(() => {
        setIsScanning(false);
      }, 3000);
    }
  };

  return (
    <section className="border-4 border-interactive p-6 rounded-lg my-6" aria-labelledby="upload-heading">
      <h2 id="upload-heading" className="text-2xl font-bold mb-4">Rapor Yükle / Çek</h2>
      <p className="mb-6 text-lg">Tıbbi raporunuzun fotoğrafını çekin veya dosya olarak yükleyin.</p>

      {isScanning ? (
        <div className="flex flex-col items-center justify-center p-8 border-4 border-dashed border-interactive rounded-lg bg-background" aria-live="polite">
          <Loader2 className="w-16 h-16 animate-spin text-interactive mb-4" />
          <p className="text-xl font-bold">Raporunuz taranıyor...</p>
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row gap-4">
          <label className="flex-1 cursor-pointer">
            <div className="flex items-center justify-center gap-3 p-6 border-4 border-interactive bg-background hover:bg-interactive hover:text-background transition-colors rounded-lg font-bold text-xl" role="button" tabIndex={0}>
              <Camera size={32} />
              <span>Kamera ile Çek</span>
            </div>
            <input
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              onChange={handleFileChange}
              aria-label="Kamera ile fotoğraf çek"
            />
          </label>

          <label className="flex-1 cursor-pointer">
            <div className="flex items-center justify-center gap-3 p-6 border-4 border-interactive bg-background hover:bg-interactive hover:text-background transition-colors rounded-lg font-bold text-xl" role="button" tabIndex={0}>
              <Upload size={32} />
              <span>Dosya Seç</span>
            </div>
            <input
              type="file"
              accept="image/*,.pdf"
              className="sr-only"
              onChange={handleFileChange}
              aria-label="Dosya seç"
            />
          </label>
        </div>
      )}
    </section>
  );
}
