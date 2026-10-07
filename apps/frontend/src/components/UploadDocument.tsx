"use client";

import { useState } from "react";
import { Camera, Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { t, type Locale } from "@/lib/i18n";

export default function UploadDocument({ locale = "tr" }: { locale?: Locale }) {
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = () => {
    setIsScanning(true);
    // Simulate OCR delay
    setTimeout(() => {
      setIsScanning(false);
    }, 3000);
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 border-4 border-yellow-400 rounded-lg bg-black text-yellow-400">
      <h2 className="text-2xl font-bold mb-6">{t("cameraUploadTitle", locale)}</h2>

      <div className="flex flex-wrap justify-center gap-4 mb-6">
        <button
          onClick={handleScan}
          disabled={isScanning}
          className="flex items-center gap-3 px-8 py-4 text-xl font-bold bg-cyan-400 text-black rounded-lg hover:bg-cyan-300 disabled:opacity-50"
          aria-label={t("scanButton", locale)}
        >
          <Camera size={32} />
          {t("scanButton", locale)}
        </button>
        <button
          onClick={handleScan}
          disabled={isScanning}
          className="flex items-center gap-3 px-8 py-4 text-xl font-bold bg-cyan-400 text-black rounded-lg hover:bg-cyan-300 disabled:opacity-50"
          aria-label={t("scanButton", locale)}
        >
          <Upload size={32} />
          Dosya Yükle
        </button>
      </div>

      <AnimatePresence>
        {isScanning && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-3 text-xl font-bold text-cyan-400"
          >
            <div className="animate-spin rounded-full h-8 w-8 border-b-4 border-cyan-400"></div>
            {t("scanning", locale)}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
