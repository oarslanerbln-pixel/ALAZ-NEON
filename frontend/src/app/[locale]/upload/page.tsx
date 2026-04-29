"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UploadCloud, FileText } from "lucide-react";

export default function UploadPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setIsScanning(true);
      // Simulate scanning for MVP
      setTimeout(() => {
        setIsScanning(false);
      }, 3000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 min-h-[70vh]">
      <h1 className="text-3xl font-bold mb-8 text-yellow-400">
        Rapor Yükle
      </h1>

      <label
        htmlFor="file-upload"
        className="w-full max-w-md p-8 border-4 border-dashed border-yellow-400 bg-gray-900 flex flex-col items-center justify-center rounded-2xl cursor-pointer hover:bg-gray-800 transition-colors focus-within:ring-4 focus-within:ring-yellow-300 focus-within:outline-none"
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            document.getElementById("file-upload")?.click();
          }
        }}
        aria-label="Tıbbi rapor yüklemek için tıklayın veya dosya seçin"
      >
        <UploadCloud className="w-16 h-16 text-yellow-400 mb-4" aria-hidden="true" />
        <span className="text-xl font-semibold text-center">
          Fotoğraf Çek veya Yükle
        </span>
        <input
          id="file-upload"
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={handleFileChange}
        />
      </label>

      <div className="mt-12 h-24 w-full flex justify-center items-center" aria-live="assertive">
        <AnimatePresence>
          {isScanning && (
            <motion.div
              key="scanning"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex items-center space-x-3 bg-gray-900 border-2 border-yellow-400 p-4 rounded-xl shadow-lg"
              role="alert"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              >
                <FileText className="w-8 h-8 text-yellow-400" />
              </motion.div>
              <span className="text-2xl font-bold text-yellow-400">
                Raporunuz taranıyor...
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
