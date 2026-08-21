'use client';

import { useState } from 'react';
import { Upload, Camera, FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import Tesseract from 'tesseract.js';

export default function UploadDocument() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setScanResult(null);
    setSummary(null);

    try {
      const result = await Tesseract.recognize(file, 'tur+eng', {
        logger: (m) => console.log(m),
      });

      setScanResult(result.data.text);

      // Mock LLM simplification
      setSummary(`1. Durumunuz Nedir?
Tahlillerinize göre değerleriniz genel olarak normal, hafif bir kansızlık görünüyor.

2. Doktorunuz Ne Demek İstiyor?
Vücudunuzda demir eksikliği olabilir. Endişe edilecek bir durum yok.

3. Dikkat Etmeniz Gerekenler
Demir yönünden zengin gıdalar (kırmızı et, ıspanak) tüketin. İlaçlarınızı düzenli alın.`);

    } catch (error) {
      console.error(error);
      setScanResult("Okuma sırasında bir hata oluştu.");
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold">Rapor Yükle / Tara</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="flex flex-col items-center justify-center p-8 border-4 border-dashed border-primary rounded-xl cursor-pointer hover:bg-primary/10 transition-colors">
          <Camera className="w-12 h-12 mb-4 text-primary" />
          <span className="text-xl font-bold text-center">Kamera ile Çek</span>
          <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileUpload} />
        </label>

        <label className="flex flex-col items-center justify-center p-8 border-4 border-dashed border-primary rounded-xl cursor-pointer hover:bg-primary/10 transition-colors">
          <Upload className="w-12 h-12 mb-4 text-primary" />
          <span className="text-xl font-bold text-center">Dosya Yükle</span>
          <input type="file" accept="image/*,application/pdf" className="hidden" onChange={handleFileUpload} />
        </label>
      </div>

      <div aria-live="polite" role="status">
        {isScanning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center p-6 bg-gray-900 rounded-xl border-2 border-primary"
          >
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-xl font-bold text-primary">Raporunuz taranıyor...</p>
          </motion.div>
        )}

        {/* Hidden scan result just for development / debugging without lint errors */}
        {scanResult && <div className="hidden">{scanResult}</div>}

        {summary && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gray-900 p-6 rounded-xl border-2 border-foreground"
          >
            <div className="flex items-center gap-3 mb-6">
              <FileText className="w-8 h-8 text-primary" />
              <h3 className="text-2xl font-bold">Akıllı Özet</h3>
            </div>
            <div className="whitespace-pre-line text-lg leading-relaxed">
              {summary}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
