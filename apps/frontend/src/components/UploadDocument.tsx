"use client";

import { useState } from "react";
import { t, SupportedLanguage } from "@/lib/i18n";

export function UploadDocument({ lang = "tr" }: { lang?: SupportedLanguage }) {
  const [isScanning, setIsScanning] = useState(false);

  const handleUpload = () => {
    setIsScanning(true);
    // Mocking an OCR process delay
    setTimeout(() => {
      setIsScanning(false);
      alert("Scan complete"); // Mock alert for now
    }, 2000);
  };

  return (
    <div className="flex flex-col items-center gap-4 p-8 border-2 border-interactive rounded-xl bg-gray-900 w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold">{t("upload.title", lang)}</h2>

      {isScanning ? (
        <div className="flex flex-col items-center gap-4 text-interactive animate-pulse">
          <div className="w-16 h-16 border-4 border-interactive border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xl font-bold">{t("upload.scan", lang)}</p>
        </div>
      ) : (
        <div className="flex flex-col w-full gap-2">
          <label htmlFor="file-upload" className="sr-only">
            {t("upload.title", lang)}
          </label>
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            onChange={handleUpload}
            className="block w-full text-lg file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-lg file:font-semibold file:bg-interactive file:text-black hover:file:bg-cyan-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interactive cursor-pointer"
          />
        </div>
      )}
    </div>
  );
}
