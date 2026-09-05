"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Upload, FileText } from "lucide-react";

export default function UploadDocument() {
  const { t } = useTranslation();
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setIsScanning(true);
      setResult(null);
      // Simulate OCR processing
      setTimeout(() => {
        setIsScanning(false);
        setResult("Mock OCR Result Text");
      }, 3000);
    }
  };

  return (
    <div className="p-6 border-4 border-interactive rounded-xl bg-background my-8">
      <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
        <FileText size={32} color="var(--color-interactive)" aria-hidden="true" />
        Rapor Yükle / Çek
      </h2>

      {!isScanning && !result && (
        <label
          htmlFor="document-upload"
          className="flex flex-col items-center justify-center p-8 border-4 border-dashed border-interactive rounded-xl cursor-pointer hover:bg-interactive hover:text-background transition-colors focus-within:ring-4 focus-within:ring-interactive focus-within:outline-none"
        >
          <Upload size={48} className="mb-4" aria-hidden="true" />
          <span className="text-xl font-bold">Buraya tıklayıp fotoğraf seçin</span>
          <input
            id="document-upload"
            type="file"
            accept="image/*"
            capture="environment"
            className="sr-only"
            onChange={handleUpload}
            aria-label="Tıbbi rapor fotoğrafı yükle veya kameradan çek"
          />
        </label>
      )}

      {isScanning && (
        <motion.div
          className="flex flex-col items-center p-8 border-4 border-interactive rounded-xl"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          aria-live="polite"
          aria-busy="true"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-16 h-16 border-8 border-interactive border-t-background rounded-full mb-4"
          />
          <p className="text-xl font-bold text-interactive">{t("scanning")}</p>
        </motion.div>
      )}

      {result && (
        <div className="p-4 border-4 border-interactive rounded-xl bg-background mt-4" aria-live="polite">
          <h3 className="text-xl font-bold mb-2">Özet Sonuçlar</h3>
          <div className="text-lg">
            <p className="font-bold">1. Durumunuz Nedir?</p>
            <p className="mb-2">Örnek durum açıklaması.</p>
            <p className="font-bold">2. Doktorunuz Ne Demek İstiyor?</p>
            <p className="mb-2">Örnek doktor açıklaması.</p>
            <p className="font-bold">3. Dikkat Etmeniz Gerekenler</p>
            <p className="mb-2">Örnek dikkat edilmesi gerekenler.</p>
          </div>
          <button
            onClick={() => setResult(null)}
            className="mt-4 px-6 py-3 bg-interactive text-background font-bold text-xl rounded focus:outline-none focus:ring-4 focus:ring-white w-full"
          >
            Yeni Rapor Yükle
          </button>
        </div>
      )}
    </div>
  );
}
