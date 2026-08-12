"use client";
import { useState } from "react";
import { Camera } from "lucide-react";

export default function UploadDocument() {
  const [isScanning, setIsScanning] = useState(false);

  return (
    <div className="w-full p-4 border-2 border-yellow-400 rounded-lg">
      <div role="status" aria-live="polite">
        {isScanning ? (
          <div className="text-xl font-bold animate-pulse">Raporunuz taranıyor...</div>
        ) : (
          <label className="flex flex-col items-center justify-center p-6 cursor-pointer">
            <Camera size={48} className="mb-4" />
            <span className="text-xl font-bold">Belge Yükle veya Fotoğraf Çek</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={() => setIsScanning(true)}
            />
          </label>
        )}
      </div>
    </div>
  );
}
