'use client';

import React, { useState } from 'react';
import Tesseract from 'tesseract.js';
import { Camera } from 'lucide-react';
import { t } from '@/lib/i18n';

export default function UploadDocument() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState('');

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setScanning(true);
      const file = e.target.files[0];
      try {
        const { data: { text } } = await Tesseract.recognize(file, 'tur', {
          logger: m => console.log(m)
        });
        setResult(text);
      } catch (error) {
        console.error("OCR Error:", error);
      } finally {
        setScanning(false);
      }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 border-2 border-cyan-500 rounded-lg max-w-md mx-auto my-8">
      <label className="flex flex-col items-center justify-center cursor-pointer bg-cyan-500 text-black px-6 py-4 rounded-lg text-xl font-bold w-full">
        <Camera className="w-12 h-12 mb-2" />
        <span>Rapor Yükle / Çek</span>
        <input
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleUpload}
          className="hidden"
        />
      </label>

      {scanning && (
        <div className="mt-6 text-yellow-500 text-xl font-bold animate-pulse">
          {t('scanning')}
        </div>
      )}

      {result && (
        <div className="mt-6 p-4 bg-gray-900 border border-yellow-500 rounded-lg w-full text-yellow-500 text-lg break-words">
          <h3 className="font-bold mb-2">Çıkarılan Metin:</h3>
          <p>{result}</p>
        </div>
      )}

      <div className="mt-8 text-sm text-center text-yellow-600 bg-black p-2 border border-yellow-600">
        {t('disclaimer')}
      </div>
    </div>
  );
}
