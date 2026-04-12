"use client";

import React, { useState } from "react";

export default function UploadDocument() {
  const [isScanning, setIsScanning] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFileName(e.target.files[0].name);
    }
  };

  const handleUpload = () => {
    if (!fileName) return;
    setIsScanning(true);
    // Mocking an upload/OCR scan process
    setTimeout(() => {
      setIsScanning(false);
      setFileName(null);
    }, 3000);
  };

  return (
    <div className="border-4 border-[var(--color-hc-border)] p-6 rounded-lg mb-8 bg-[var(--color-hc-bg)]">
      <h2 className="text-2xl font-bold mb-4">Yeni Rapor Yükle / Çek</h2>
      <div className="flex flex-col gap-4">
        <label htmlFor="document-upload" className="font-bold text-lg cursor-pointer">
          Tıbbi Rapor Seç veya Fotoğraf Çek
        </label>
        <input
          id="document-upload"
          type="file"
          accept="image/*,application/pdf"
          capture="environment"
          onChange={handleFileChange}
          className="text-lg p-2 border-2 border-[var(--color-hc-border)] rounded text-[var(--color-hc-text)] bg-transparent focus-visible-hc"
          aria-label="Tıbbi Rapor Seç veya Fotoğraf Çek"
        />

        {fileName && (
          <div className="text-lg font-bold">
            Seçilen Dosya: {fileName}
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!fileName || isScanning}
          className="mt-4 p-4 text-xl font-bold rounded border-4 border-[var(--color-hc-border)]
                     bg-transparent text-[var(--color-hc-accent)]
                     disabled:opacity-50 disabled:cursor-not-allowed
                     hover:bg-[var(--color-hc-accent)] hover:text-black focus-visible-hc transition-colors"
          aria-live="polite"
        >
          {isScanning ? (
            <span className="flex items-center justify-center gap-2">
              <span className="animate-spin text-2xl" aria-hidden="true">↻</span>
              Raporunuz taranıyor...
            </span>
          ) : (
            "Raporu Oku ve Sadeleştir"
          )}
        </button>
      </div>
    </div>
  );
}
