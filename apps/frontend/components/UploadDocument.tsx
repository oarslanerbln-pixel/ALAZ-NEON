"use client";

import React, { useState } from 'react';
import { Camera, Upload, Loader2 } from 'lucide-react';
import Tesseract from 'tesseract.js';

export function UploadDocument() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setScanning(true);
    setResult(null);

    try {
      const { data: { text } } = await Tesseract.recognize(
        file,
        'tur',
        { logger: m => console.log(m) }
      );
      // Simulate LLM Summary
      setResult(`Özet: ${text.substring(0, 50)}...`);
    } catch (error) {
      console.error(error);
      setResult("Bir hata oluştu.");
    } finally {
      setScanning(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-6 p-6 border-2 border-interactive rounded-xl">
      <h2 className="text-2xl font-bold">Rapor Yükle</h2>

      <div className="flex gap-4">
        <label className="flex flex-col items-center justify-center w-32 h-32 border-4 border-dashed border-interactive cursor-pointer hover:bg-white/10 rounded-xl" aria-label="Fotoğraf Çek">
          <Camera size={48} className="text-interactive" />
          <span className="mt-2 font-bold text-interactive">Kamera</span>
          <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileUpload} />
        </label>

        <label className="flex flex-col items-center justify-center w-32 h-32 border-4 border-dashed border-interactive cursor-pointer hover:bg-white/10 rounded-xl" aria-label="Dosya Yükle">
          <Upload size={48} className="text-interactive" />
          <span className="mt-2 font-bold text-interactive">Yükle</span>
          <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
        </label>
      </div>

      <div role="status" aria-live="polite" className="w-full">
        {scanning && (
          <div className="flex items-center justify-center gap-3 p-4 bg-black border-2 border-interactive rounded-lg">
            <Loader2 className="animate-spin text-interactive" size={32} />
            <span className="text-xl font-bold">Raporunuz taranıyor...</span>
          </div>
        )}

        {result && (
          <div className="mt-4 p-4 border-2 border-yellow-400 bg-black rounded-lg">
            <h3 className="text-xl font-bold mb-2">Sonuç</h3>
            <p className="text-lg">{result}</p>
          </div>
        )}
      </div>
    </div>
  );
}
