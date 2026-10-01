"use client";

import { useState } from "react";
import { getTranslations, Locale } from "../lib/i18n";

interface Props {
  locale: Locale;
}

export default function UploadDocument({ locale }: Props) {
  const [isScanning, setIsScanning] = useState(false);
  const t = getTranslations(locale);

  const handleUpload = () => {
    setIsScanning(true);
    // Simulate OCR scanning
    setTimeout(() => {
      setIsScanning(false);
    }, 3000);
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 w-full">
      <h2 className="text-2xl mb-4 font-bold">{t.upload_title}</h2>

      {!isScanning ? (
        <button
          onClick={handleUpload}
          className="p-4 text-xl font-bold rounded-lg border-2 border-black w-full max-w-sm"
          aria-label={t.upload_title}
        >
          {t.upload_title}
        </button>
      ) : (
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="w-16 h-16 border-4 border-cyan-400 border-t-black rounded-full animate-spin"></div>
          <p className="text-xl font-bold text-center">{t.upload_scanning}</p>
        </div>
      )}
    </div>
  );
}
