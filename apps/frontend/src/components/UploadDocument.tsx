'use client';

import { useState } from 'react';
import { Camera, Upload, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function UploadDocument() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);

  const handleSimulateScan = () => {
    setIsScanning(true);
    // Simulate OCR and LLM processing
    setTimeout(() => {
      setIsScanning(false);
      setScanResult('Tıbbi raporunuz başarıyla işlendi ve sadeleştirildi.');
    }, 3000);
  };

  return (
    <div className="flex flex-col gap-6">
      <AnimatePresence mode="wait">
        {isScanning ? (
          <motion.div
            key="scanning"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center p-12 border-4 border-dashed border-cyan-400 rounded-2xl bg-cyan-950/30"
          >
            <Loader2 size={64} className="text-cyan-400 animate-spin mb-4" />
            <h2 className="text-2xl font-bold text-cyan-400 text-center">Raporunuz taranıyor...</h2>
            <p className="text-lg mt-2 text-center text-yellow-300">Lütfen bekleyin</p>
          </motion.div>
        ) : scanResult ? (
          <motion.div
            key="result"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-6 border-4 border-cyan-400 rounded-2xl bg-black"
          >
            <h2 className="text-2xl font-bold mb-4">Özet Sonucu</h2>
            <div className="space-y-4">
              <p className="text-xl">{scanResult}</p>
              {/* Fake result structure as requested */}
              <div className="bg-gray-900 p-4 rounded-lg mt-4 border border-yellow-600">
                <h3 className="font-bold text-xl mb-2 text-cyan-400">1. Durumunuz Nedir?</h3>
                <p>Test sonuçlarınız genel olarak normal görünmektedir.</p>
              </div>
              <div className="bg-gray-900 p-4 rounded-lg border border-yellow-600">
                <h3 className="font-bold text-xl mb-2 text-cyan-400">2. Doktorunuz Ne Demek İstiyor?</h3>
                <p>Endişelenecek bir durum yok, rutin kontrollerinize devam edin.</p>
              </div>
              <div className="bg-gray-900 p-4 rounded-lg border border-yellow-600">
                <h3 className="font-bold text-xl mb-2 text-cyan-400">3. Dikkat Etmeniz Gerekenler</h3>
                <p>Bol su için ve reçete edilen vitaminlerinizi düzenli alın.</p>
              </div>
            </div>
            <button
              onClick={() => setScanResult(null)}
              className="mt-6 w-full py-4 bg-cyan-800 hover:bg-cyan-700 text-white font-bold text-xl rounded-xl transition-colors"
            >
              Yeni Rapor Tara
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="upload"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-4"
          >
            <button
              onClick={handleSimulateScan}
              className="flex flex-col items-center justify-center p-8 border-4 border-cyan-400 rounded-2xl hover:bg-cyan-900 transition-colors bg-black w-full"
            >
              <Camera size={48} className="text-cyan-400 mb-4" />
              <span className="text-xl font-bold text-cyan-400">Fotoğraf Çek</span>
            </button>

            <button
              onClick={handleSimulateScan}
              className="flex flex-col items-center justify-center p-8 border-4 border-cyan-400 rounded-2xl hover:bg-cyan-900 transition-colors bg-black w-full"
            >
              <Upload size={48} className="text-cyan-400 mb-4" />
              <span className="text-xl font-bold text-cyan-400">Dosya Yükle</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
