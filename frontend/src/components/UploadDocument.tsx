"use client";

import React, { useState } from 'react';
import { Camera, FileText } from 'lucide-react';

export default function UploadDocument() {
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = () => {
    setIsScanning(true);
    // Simulate OCR processing time
    setTimeout(() => {
      setIsScanning(false);
    }, 3000);
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 border-2 border-dashed border-gray-600 rounded-xl bg-white text-black">
      {isScanning ? (
        <div className="flex flex-col items-center justify-center p-8 space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-800"></div>
          <p className="text-xl font-bold text-center" aria-live="assertive" role="alert">Raporunuz taranıyor...</p>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-6 space-y-6">
          <FileText size={48} className="text-gray-800" />
          <h2 className="text-2xl font-bold text-center">Tıbbi Rapor Yükle</h2>

          <button
            onClick={handleScan}
            className="flex items-center justify-center w-full px-6 py-4 text-xl font-bold text-white bg-blue-800 rounded-lg hover:bg-blue-900 focus-visible:ring-4 focus-visible:ring-blue-500 focus-visible:outline-none transition-colors"
            aria-label="Kamerayı açarak belge yükle"
          >
            <Camera className="mr-2" size={28} />
            Kamera ile Yükle
          </button>
        </div>
      )}
    </div>
  );
}
