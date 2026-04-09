"use client";

import React, { useState } from "react";
import { UploadCloud } from "lucide-react";

export default function UploadDocument() {
  const [isScanning, setIsScanning] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsScanning(true);
      // Simulate OCR processing time
      setTimeout(() => {
        setIsScanning(false);
      }, 3000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-black text-white rounded-lg border-2 border-white max-w-md mx-auto my-4 w-full">
      <h2 className="text-2xl font-bold mb-4">Tıbbi Rapor Yükle</h2>

      {isScanning ? (
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white mb-4"></div>
          <p className="text-xl font-bold" aria-live="polite">Raporunuz taranıyor...</p>
        </div>
      ) : (
        <div className="w-full flex flex-col items-center">
          <label
            htmlFor="file-upload"
            className="flex flex-col items-center justify-center w-full h-40 border-4 border-dashed border-white rounded-lg cursor-pointer hover:bg-gray-900 focus-within:ring-4 focus-within:ring-white focus-within:outline-none"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                document.getElementById('file-upload')?.click();
              }
            }}
            role="button"
          >
            <UploadCloud className="w-16 h-16 mb-2" />
            <span className="text-xl font-bold">Fotoğraf Çek / Yükle</span>
            <input
              id="file-upload"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={handleFileUpload}
              tabIndex={-1}
            />
          </label>
        </div>
      )}

      <div className="mt-8 p-4 border border-white bg-gray-900 w-full text-center">
        <p className="text-lg font-bold">
          Bu bir tıbbi tavsiye değildir, yalnızca dil sadeleştirme aracıdır. Lütfen doktorunuza danışın.
        </p>
      </div>
    </div>
  );
}
