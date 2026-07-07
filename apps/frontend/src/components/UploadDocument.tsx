"use client";

import { useState, useRef } from 'react';
import { Camera, Upload, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Tesseract from 'tesseract.js';

export default function UploadDocument() {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [lang, setLang] = useState('TR');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processImage = async (file: File) => {
    setIsScanning(true);
    setResult(null);
    try {
      await Tesseract.recognize(file, 'tur');
      setTimeout(() => {
        setIsScanning(false);
        setResult("1. Durumunuz Nedir?\nKan değerlerinizde hafif bir enfeksiyon bulgusu var.\n\n2. Doktorunuz Ne Demek İstiyor?\nVücudunuz bir mikropla savaşıyor, bu yüzden yorgun hissedebilirsiniz.\n\n3. Dikkat Etmeniz Gerekenler\nİlaçlarınızı düzenli kullanın ve bol su için.\n\nBu bir tıbbi tavsiye değildir, yalnızca dil sadeleştirme aracıdır. Lütfen doktorunuza danışın.");
      }, 1500);
    } catch (error) {
      console.error(error);
      setIsScanning(false);
      setResult("Bir hata oluştu. Lütfen tekrar deneyin.\n\nBu bir tıbbi tavsiye değildir, yalnızca dil sadeleştirme aracıdır. Lütfen doktorunuza danışın.");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processImage(e.target.files[0]);
    }
  };

  const handleSimulateScan = () => {
    setIsScanning(true);
    setResult(null);
    setTimeout(() => {
      setIsScanning(false);
      setResult("1. Durumunuz Nedir?\nKan değerlerinizde hafif bir enfeksiyon bulgusu var.\n\n2. Doktorunuz Ne Demek İstiyor?\nVücudunuz bir mikropla savaşıyor, bu yüzden yorgun hissedebilirsiniz.\n\n3. Dikkat Etmeniz Gerekenler\nİlaçlarınızı düzenli kullanın ve bol su için.\n\nBu bir tıbbi tavsiye değildir, yalnızca dil sadeleştirme aracıdır. Lütfen doktorunuza danışın.");
    }, 3000);
  };

  return (
    <div className="flex flex-col gap-6 items-center w-full">
      <div className="flex w-full justify-center gap-4 mb-2">
        {['TR', 'EN', 'AR'].map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={`px-6 py-3 font-bold border-2 focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none ${
              lang === l ? 'bg-yellow-400 text-black border-yellow-400' : 'bg-black text-yellow-400 border-yellow-400'
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 w-full">
        <button
          onClick={handleSimulateScan}
          disabled={isScanning}
          className="flex flex-col items-center justify-center p-6 bg-black rounded-xl border-2 border-yellow-400 text-yellow-400 hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none"
          aria-label="Kamera ile çek"
        >
          <Camera size={32} className="mb-2" />
          <span className="font-bold text-lg">Fotoğraf Çek</span>
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isScanning}
          className="flex flex-col items-center justify-center p-6 bg-black rounded-xl border-2 border-yellow-400 text-yellow-400 hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none"
          aria-label="Dosya yükle"
        >
          <Upload size={32} className="mb-2" />
          <span className="font-bold text-lg">Dosya Seç</span>
        </button>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
      </div>

      <AnimatePresence>
        {isScanning && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4 p-8 bg-black border-2 border-yellow-400 rounded-xl w-full"
            role="alert"
            aria-live="assertive"
          >
            <Loader2 size={48} className="animate-spin text-yellow-400" />
            <p className="text-xl font-bold text-center text-yellow-400">Raporunuz taranıyor...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {result && (
        <div className="w-full bg-black border-2 border-yellow-400 p-6 rounded-xl mt-4" role="status" aria-live="polite">
          <h2 className="text-2xl font-bold mb-4 text-yellow-400">Sonuç</h2>
          <p className="whitespace-pre-line text-white text-lg">{result}</p>
        </div>
      )}
    </div>
  );
}
