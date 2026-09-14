"use client";

import { useState } from "react";
import { Camera, Upload, Loader2 } from "lucide-react";
import Tesseract from "tesseract.js";

export default function UploadDocument() {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setResult(null);

    try {
      const { data: { text } } = await Tesseract.recognize(file, 'tur', {
        logger: m => console.log(m)
      });
      // In a real app, this text would go to the LLM API
      setResult(text);
    } catch (error) {
      console.error("OCR Error:", error);
      setResult("Okuma hatası oluştu.");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-black border-2 border-[#00ffff] p-6 rounded-lg text-center mt-6">
      <h2 className="text-2xl font-bold mb-4">Evrak Yükle</h2>

      <div className="flex gap-4 justify-center mb-6">
        <label className="cursor-pointer bg-black border-2 border-[#00ffff] px-6 py-4 rounded-lg flex flex-col items-center hover:bg-[#00ffff] hover:text-black transition-colors" aria-label="Fotoğraf Çek">
          <Camera size={32} />
          <span className="mt-2 font-bold">Kamera</span>
          <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleImageUpload} />
        </label>

        <label className="cursor-pointer bg-black border-2 border-[#00ffff] px-6 py-4 rounded-lg flex flex-col items-center hover:bg-[#00ffff] hover:text-black transition-colors" aria-label="Dosya Seç">
          <Upload size={32} />
          <span className="mt-2 font-bold">Galeri</span>
          <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </label>
      </div>

      {isScanning && (
        <div className="flex flex-col items-center mt-4">
          <Loader2 className="animate-spin text-[#00ffff] mb-2" size={48} />
          <p className="text-xl font-bold">Raporunuz taranıyor...</p>
        </div>
      )}

      {result && (
        <div className="mt-6 text-left border border-[#00ffff] p-4 rounded bg-black text-[#ffff00]">
          <h3 className="font-bold text-lg mb-2 border-b border-[#00ffff] pb-2">Okunan Metin:</h3>
          <p className="whitespace-pre-wrap">{result}</p>
        </div>
      )}
    </div>
  );
}
