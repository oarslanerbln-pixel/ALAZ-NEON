"use client";
import { useState } from 'react';
import { Camera } from 'lucide-react';

export default function UploadDocument() {
  const [scanning, setScanning] = useState(false);

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => setScanning(false), 3000);
  };

  return (
    <div className="p-4 border-2 border-yellow-400 rounded-lg bg-black text-yellow-400">
      <h2 className="text-xl font-bold mb-4">Rapor Yükle</h2>
      {scanning ? (
        <div className="flex items-center gap-2" role="status" aria-live="polite">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400"></div>
          <p className="text-lg">Raporunuz taranıyor...</p>
        </div>
      ) : (
        <button
          onClick={handleScan}
          className="flex items-center justify-center gap-2 w-full p-4 bg-yellow-400 text-black font-bold text-lg rounded-lg focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none"
        >
          <Camera size={24} />
          <span>Kamera ile Çek / Yükle</span>
        </button>
      )}
    </div>
  );
}
