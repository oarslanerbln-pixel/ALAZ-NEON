"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { UploadCloud } from "lucide-react";

export default function UploadPage() {
  const [isScanning, setIsScanning] = useState(false);

  const handleUpload = () => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 3000);
  };

  return (
    <div className="flex flex-col items-center justify-center p-8 space-y-8">
      <h1 className="text-3xl font-bold text-yellow-400">Tıbbi Rapor Yükle</h1>
      <button
        onClick={handleUpload}
        className="flex flex-col items-center justify-center w-full max-w-md p-12 border-4 border-cyan-400 border-dashed rounded-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400 hover:bg-cyan-900 transition-colors cursor-pointer"
        aria-label="Fotoğraf çek veya dosya yükle"
      >
        <UploadCloud className="w-24 h-24 text-cyan-400 mb-4" />
        <span className="text-2xl font-bold text-cyan-400">Belge Seç</span>
      </button>

      <div aria-live="polite" role="status" className="w-full text-center min-h-[100px]">
        {isScanning && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl font-bold text-cyan-400 mt-8 p-4 border-4 border-cyan-400 rounded-lg bg-black inline-block"
          >
            Raporunuz taranıyor... Lütfen bekleyiniz.
          </motion.div>
        )}
      </div>
    </div>
  );
}
