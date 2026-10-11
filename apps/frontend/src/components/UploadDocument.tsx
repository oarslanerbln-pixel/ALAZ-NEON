"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { UploadCloud, FileText } from "lucide-react";
import { t, type Locale } from "@/lib/i18n";

export default function UploadDocument({ locale = "tr" }: { locale?: Locale }) {
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
    <div className="flex flex-col items-center justify-center p-6 bg-black border-2 border-cyan-400 rounded-xl max-w-md w-full mx-auto my-8">
      <h2 className="text-2xl font-bold text-yellow-300 mb-6 text-center">
        {t("upload_report", locale)}
      </h2>

      {isScanning ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center space-y-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
          >
            <FileText size={64} className="text-cyan-400" />
          </motion.div>
          <p className="text-xl font-semibold text-yellow-300" aria-live="polite">
            {t("scanning", locale)}
          </p>
        </motion.div>
      ) : (
        <div className="flex flex-col items-center w-full">
          <label
            htmlFor="file-upload"
            className="flex flex-col items-center justify-center w-full h-48 border-4 border-dashed border-cyan-400 rounded-lg cursor-pointer bg-black hover:bg-gray-900 transition-colors"
            aria-label={t("upload_report", locale)}
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <UploadCloud size={48} className="text-cyan-400 mb-3" />
              <p className="mb-2 text-lg font-bold text-yellow-300">
                {t("scan_report", locale)}
              </p>
            </div>
            <input
              id="file-upload"
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={handleFileUpload}
            />
          </label>
        </div>
      )}
    </div>
  );
}
