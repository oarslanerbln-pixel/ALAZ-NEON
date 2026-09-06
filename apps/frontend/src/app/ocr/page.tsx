"use client";

import { useState, useRef } from "react";
import { Camera, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function OCRPage() {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // TODO: Implement actual Tesseract.js OCR here
    setIsScanning(true);

    // Mock processing for skeleton
    setTimeout(() => {
      setIsScanning(false);
      setResult("OCR Tamamlandı. Bu bir taslak sonuç ekranıdır.");
    }, 2500);
  };

  return (
    <div className="p-6">
      <header className="mb-8 flex items-center gap-4">
        <Link
          href="/"
          className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400"
          aria-label="Ana Sayfaya Dön"
        >
          <ArrowLeft className="w-6 h-6 text-yellow-400" />
        </Link>
        <h1 className="text-2xl font-bold text-cyan-400">Rapor Okut</h1>
      </header>

      {isScanning ? (
        <div className="flex flex-col items-center justify-center py-20 text-center" aria-live="polite">
          <Loader2 className="w-16 h-16 text-cyan-400 animate-spin mb-6" />
          <h2 className="text-2xl font-bold text-cyan-400 mb-2">Raporunuz taranıyor...</h2>
          <p className="text-gray-300">Lütfen bekleyin, bu işlem biraz sürebilir.</p>
        </div>
      ) : result ? (
        <div className="space-y-6">
          <div className="bg-gray-800 p-6 rounded-xl border border-cyan-400">
            <h3 className="text-xl font-bold text-cyan-400 mb-4">Tarama Sonucu</h3>
            <p className="text-gray-200">{result}</p>
          </div>
          <button
            onClick={() => setResult(null)}
            className="w-full py-4 bg-cyan-600 hover:bg-cyan-700 text-white font-bold rounded-xl text-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400"
          >
            Yeni Rapor Okut
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileUpload}
            aria-label="Kamera ile fotoğraf çek veya galeriden seç"
          />

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center gap-4 py-12 bg-gray-800 rounded-xl border-2 border-dashed border-cyan-400 hover:bg-gray-700 transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400"
            aria-label="Rapor Fotoğrafı Yükle"
          >
            <div className="bg-cyan-900 p-6 rounded-full">
              <Camera className="w-12 h-12 text-cyan-400" aria-hidden="true" />
            </div>
            <span className="text-2xl font-bold text-cyan-400">Fotoğraf Çek / Yükle</span>
            <span className="text-gray-400">Okunabilir ve net olmasına dikkat edin</span>
          </button>
        </div>
      )}
    </div>
  );
}
