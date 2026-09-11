"use client";

import { useState } from "react";
import { Upload } from "lucide-react";

export default function UploadDocument() {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  // This is a skeleton logic for OCR and LLM integration
  const SYSTEM_PROMPT = "Tıbbi metni 70 yaşındaki birinin anlayacağı sadelikte 3 başlıkta özetle: 1. Durumunuz Nedir? 2. Doktorunuz Ne Demek İstiyor? 3. Dikkat Etmeniz Gerekenler.";

  const handleUpload = () => {
    setIsScanning(true);
    setResult(null);

    // Simulate OCR and LLM API call
    setTimeout(() => {
      setIsScanning(false);
      setResult(`Özetiniz Hazır! (Sistem Komutu: ${SYSTEM_PROMPT})\n\n1. Durumunuz Nedir?\nHer şey yolunda görünüyor.\n\n2. Doktorunuz Ne Demek İstiyor?\nEndişe edecek bir şey yok.\n\n3. Dikkat Etmeniz Gerekenler\nİlaçlarınızı düzenli alın.`);
    }, 2000);
  };

  return (
    <div className="border-2 border-dashed border-[var(--interactive)] rounded-lg p-6 flex flex-col items-center justify-center space-y-4">
      <h2 className="text-xl font-bold">Rapor Yükle</h2>

      <button
        onClick={handleUpload}
        disabled={isScanning}
        className="bg-[var(--interactive)] text-black font-bold py-3 px-6 rounded-full flex items-center space-x-2 text-lg disabled:opacity-50"
        aria-label="Tıbbi belge yükle veya fotoğraf çek"
      >
        <Upload size={24} />
        <span>Belge Seç</span>
      </button>

      {isScanning && (
        <div className="mt-4 text-center animate-pulse">
          <p className="text-xl font-bold">Raporunuz taranıyor...</p>
        </div>
      )}

      {result && (
        <div className="mt-6 p-4 bg-gray-900 border border-[var(--interactive)] rounded-lg whitespace-pre-wrap w-full text-left">
          {result}
        </div>
      )}
    </div>
  );
}
