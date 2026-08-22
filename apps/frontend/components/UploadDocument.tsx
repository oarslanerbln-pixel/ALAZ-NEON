"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload } from 'lucide-react';

export default function UploadDocument() {
  const [isScanning, setIsScanning] = useState(false);
  const [summary, setSummary] = useState<{
    status: string;
    doctor: string;
    attention: string;
  } | null>(null);
  const [language, setLanguage] = useState('tr');

  const handleUpload = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setSummary({
        status: 'Tansiyonunuz normal.',
        doctor: 'İlaçlarınızı düzenli kullanmaya devam edin.',
        attention: 'Tuzlu yemeklerden kaçının.'
      });
    }, 2000);
  };

  return (
    <div className="border-4 border-yellow-400 p-6 rounded-xl bg-black">
      <h2 className="text-2xl font-bold mb-4 text-yellow-400">Rapor Yükle (OCR)</h2>

      <div className="mb-4">
        <label htmlFor="language" className="mr-2 text-yellow-400">Dil Seçimi:</label>
        <select
          id="language"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="bg-black text-cyan-400 border-2 border-cyan-400 p-2 text-lg rounded"
        >
          <option value="tr">Türkçe</option>
          <option value="en">English</option>
          <option value="ar">العربية</option>
        </select>
      </div>

      {!isScanning && !summary && (
        <motion.div
          role="button"
          tabIndex={0}
          onClick={handleUpload}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleUpload();
            }
          }}
          className="cursor-pointer border-4 border-dashed border-cyan-400 p-10 flex flex-col items-center justify-center rounded-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Upload className="w-16 h-16 text-cyan-400 mb-4" />
          <span className="text-xl text-cyan-400 font-bold">Rapor Fotoğrafı Yükle</span>
        </motion.div>
      )}

      {isScanning && (
        <div className="p-10 flex flex-col items-center justify-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="w-16 h-16 border-8 border-yellow-400 border-t-cyan-400 rounded-full mb-4"
          />
          <p className="text-xl font-bold text-yellow-400" aria-live="polite">
            Raporunuz taranıyor...
          </p>
        </div>
      )}

      {summary && (
        <div className="mt-6 space-y-4">
          <h3 className="text-xl font-bold text-yellow-400">Özet Sonucu</h3>
          <div className="border-2 border-cyan-400 p-4 rounded bg-[#111]">
            <h4 className="text-lg font-bold text-cyan-400">1. Durumunuz Nedir?</h4>
            <p className="text-yellow-400 text-lg mb-4">{summary.status}</p>

            <h4 className="text-lg font-bold text-cyan-400">2. Doktorunuz Ne Demek İstiyor?</h4>
            <p className="text-yellow-400 text-lg mb-4">{summary.doctor}</p>

            <h4 className="text-lg font-bold text-cyan-400">3. Dikkat Etmeniz Gerekenler</h4>
            <p className="text-yellow-400 text-lg">{summary.attention}</p>
          </div>
          <button
            onClick={() => setSummary(null)}
            className="w-full bg-cyan-400 text-black font-bold p-4 text-xl rounded mt-4"
          >
            Yeni Rapor Yükle
          </button>
        </div>
      )}
    </div>
  );
}
