"use client";

import { useState } from "react";
import { t } from "@/lib/i18n";

export function UploadDocument() {
  const [isScanning, setIsScanning] = useState(false);

  const handleUpload = () => {
    setIsScanning(true);
    // Simulate OCR processing
    setTimeout(() => {
      setIsScanning(false);
    }, 3000);
  };

  return (
    <div className="flex flex-col items-center p-6 border-2 border-primary rounded-lg">
      <h2 className="text-2xl font-bold mb-4">{t("upload.title")}</h2>
      <button
        onClick={handleUpload}
        className="px-6 py-4 bg-primary text-black font-bold text-lg rounded-full hover:bg-opacity-80 transition"
      >
        {t("upload.title")}
      </button>

      {isScanning && (
        <div className="mt-6 flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-xl font-semibold animate-pulse">
            {t("scanning.report")}
          </p>
        </div>
      )}
    </div>
  );
}
