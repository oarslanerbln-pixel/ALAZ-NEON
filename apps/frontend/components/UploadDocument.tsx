"use client";
import React, { useState } from "react";
import Tesseract from "tesseract.js";

export default function UploadDocument() {
  const [isScanning, setIsScanning] = useState(false);
  const [text, setText] = useState("");

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    try {
      const { data: { text } } = await Tesseract.recognize(file, "tur");
      setText(text);
    } catch (error) {
      console.error("OCR Error", error);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="bg-gray-900 p-6 rounded-lg text-base w-full max-w-md mx-auto my-8">
      <h2 className="text-2xl mb-4 text-[#ffff00]">Kamera / Belge Yükle</h2>
      <input
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleImageUpload}
        className="w-full text-base mb-4"
        title="Belge Yükle"
      />
      {isScanning && (
        <div className="text-center p-4 border border-[#00ffff] text-[#00ffff] animate-pulse">
          Raporunuz taranıyor...
        </div>
      )}
      {!isScanning && text && (
        <div className="mt-4 p-4 border border-[#ffff00] rounded">
          <h3 className="text-xl mb-2">Taranan Metin:</h3>
          <p className="whitespace-pre-wrap">{text}</p>
        </div>
      )}
    </div>
  );
}