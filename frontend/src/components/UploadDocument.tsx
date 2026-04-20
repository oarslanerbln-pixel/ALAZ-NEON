"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, FileText, CheckCircle } from "lucide-react";

export default function UploadDocument() {
  const [status, setStatus] = useState<"idle" | "scanning" | "success">("idle");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      simulateOCRProcess();
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const simulateOCRProcess = () => {
    setStatus("scanning");

    // Simulate OCR processing time
    setTimeout(() => {
      setStatus("success");

      // Reset after showing success
      setTimeout(() => {
        setStatus("idle");
      }, 3000);
    }, 4000);
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto gap-8 p-6 bg-gray-900 rounded-2xl border-2 border-gray-700">

      <div className="text-center space-y-2 w-full">
        <h2 className="text-3xl font-bold">Rapor Yükle</h2>
        <p className="text-xl text-gray-300">Tıbbi raporunuzun fotoğrafını çekin veya yükleyin</p>
      </div>

      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        capture="environment"
        className="hidden"
        aria-hidden="true"
      />

      <AnimatePresence mode="wait">
        {status === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex flex-col gap-6 w-full"
          >
            <button
              onClick={triggerFileInput}
              className="flex flex-col items-center justify-center gap-4 py-12 bg-blue-700 hover:bg-blue-600 border-4 border-blue-500 rounded-2xl transition-colors focus:outline-none focus-visible:ring-4 focus-visible:ring-white"
              aria-label="Kamera ile fotoğraf çek veya galeriden seç"
            >
              <Camera size={64} aria-hidden="true" />
              <span className="text-2xl font-bold">Fotoğraf Çek / Seç</span>
            </button>
          </motion.div>
        )}

        {status === "scanning" && (
          <motion.div
            key="scanning"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="flex flex-col items-center justify-center gap-8 py-12 w-full"
            role="alert"
            aria-live="assertive"
          >
            <div className="relative flex items-center justify-center w-32 h-32">
              {/* Pulse animation for scanning */}
              <motion.div
                className="absolute inset-0 rounded-xl border-4 border-blue-500"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [1, 0.5, 1],
                  borderColor: ["#3b82f6", "#60a5fa", "#3b82f6"]
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
              <FileText size={64} className="text-blue-400" />

              {/* Scanning line */}
              <motion.div
                className="absolute left-0 right-0 h-1 bg-green-400 shadow-[0_0_8px_2px_rgba(74,222,128,0.8)]"
                animate={{ top: ["0%", "100%", "0%"] }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              />
            </div>
            <h3 className="text-3xl font-bold text-blue-400 animate-pulse">Raporunuz taranıyor...</h3>
            <p className="text-lg text-gray-400 text-center">Bu işlem birkaç saniye sürebilir, lütfen bekleyin.</p>
          </motion.div>
        )}

        {status === "success" && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center gap-6 py-12 w-full text-green-400"
            role="alert"
            aria-live="assertive"
          >
            <CheckCircle size={80} />
            <h3 className="text-3xl font-bold">Tarama Başarılı!</h3>
            <p className="text-xl text-white">Metin sadeleştiriliyor...</p>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
