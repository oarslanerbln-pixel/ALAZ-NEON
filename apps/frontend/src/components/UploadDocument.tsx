'use client';

import { useState } from 'react';
import { Camera, Upload } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function UploadDocument() {
  const [isScanning, setIsScanning] = useState(false);
  const { t } = useTranslation();

  const handleUpload = () => {
    setIsScanning(true);
    // Simulate OCR processing
    setTimeout(() => {
      setIsScanning(false);
    }, 3000);
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 border-4 border-cyan-400 rounded-xl my-6 bg-black">
      <h2 className="text-2xl font-bold mb-6 text-yellow-400">Rapor Yükle veya Çek</h2>

      <div className="flex gap-4 w-full max-w-md">
        <button
          onClick={handleUpload}
          disabled={isScanning}
          aria-label="Kamera ile fotoğraf çek"
          className="flex-1 flex flex-col items-center justify-center gap-2 p-6 border-4 border-cyan-400 rounded-lg hover:bg-cyan-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400 transition-colors disabled:opacity-50"
        >
          <Camera size={48} className="text-cyan-400" />
          <span className="font-bold text-xl text-yellow-400">Kamera</span>
        </button>

        <button
          onClick={handleUpload}
          disabled={isScanning}
          aria-label="Dosya yükle"
          className="flex-1 flex flex-col items-center justify-center gap-2 p-6 border-4 border-cyan-400 rounded-lg hover:bg-cyan-900 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400 transition-colors disabled:opacity-50"
        >
          <Upload size={48} className="text-cyan-400" />
          <span className="font-bold text-xl text-yellow-400">Yükle</span>
        </button>
      </div>

      <div role="status" aria-live="polite" className="mt-6 min-h-[2rem]">
        {isScanning && (
          <div className="flex items-center gap-3 text-cyan-400 font-bold text-xl animate-pulse">
            <div className="w-6 h-6 border-4 border-cyan-400 border-t-yellow-400 rounded-full animate-spin"></div>
            <span>{t('Raporunuz taranıyor...')}</span>
          </div>
        )}
      </div>
    </div>
  );
}
