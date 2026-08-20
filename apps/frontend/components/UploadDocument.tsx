"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Tesseract from "tesseract.js";
import { Camera } from "lucide-react";
import { useTranslation } from "react-i18next";

export function UploadDocument() {
  const [isScanning, setIsScanning] = useState(false);
  const [text, setText] = useState("");
  const { t } = useTranslation();

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsScanning(true);
    try {
      const { data: { text } } = await Tesseract.recognize(file, "tur");
      setText(text);
    } catch (err) {
      console.error(err);
    }
    setIsScanning(false);
  };

  return (
    <div className="w-full p-4 border-2 border-cyan-400 rounded-lg bg-gray-900 text-yellow-400 flex flex-col items-center">
      <label className="cursor-pointer flex flex-col items-center gap-2">
        <Camera size={48} />
        <span className="text-xl font-bold">Evrak Yükle</span>
        <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleUpload} />
      </label>

      <div role="status" aria-live="polite" className="mt-4 min-h-12 w-full text-center">
        {isScanning && (
          <motion.div animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-lg font-bold text-cyan-400">
            {t("scan_report")}
          </motion.div>
        )}
      </div>
      {text && <div className="mt-4 p-2 bg-black w-full overflow-y-auto max-h-40 text-base">{text}</div>}
    </div>
  );
}
