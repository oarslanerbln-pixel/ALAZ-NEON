'use client';

import { useState } from 'react';
import { Camera, Upload, AlertCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function UploadDocument() {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [language, setLanguage] = useState<'tr' | 'en' | 'ar'>('tr');
  const [error, setError] = useState<string | null>(null);

  const handleScanMock = () => {
    setScanning(true);
    setError(null);
    setResult(null);

    // Mock scan process delay
    setTimeout(() => {
      setScanning(false);
      setResult('success');
    }, 3000);
  };

  return (
    <div className="flex flex-col gap-6">
      {!scanning && !result && (
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl font-bold">Raporunuzu Yükleyin veya Fotoğrafını Çekin</h2>

          <button
            onClick={handleScanMock}
            className="flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-xl text-xl font-bold transition-colors focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none"
          >
            <Camera size={32} />
            Kamera ile Çek
          </button>

          <button
            onClick={handleScanMock}
            className="flex items-center justify-center gap-3 bg-gray-800 hover:bg-gray-700 text-white p-6 rounded-xl text-xl font-bold transition-colors focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none"
          >
            <Upload size={32} />
            Dosya Yükle
          </button>
        </div>
      )}

      <AnimatePresence>
        {scanning && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="flex flex-col items-center justify-center py-12 gap-6 bg-gray-900 rounded-2xl border border-gray-700"
            role="status"
            aria-live="polite"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            >
              <RefreshCw size={64} className="text-yellow-400" />
            </motion.div>
            <p className="text-2xl font-bold text-yellow-400 animate-pulse">
              Raporunuz taranıyor...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
         <div role="alert" aria-live="assertive" className="bg-red-900/50 border-2 border-red-500 p-4 rounded-xl flex items-start gap-3">
            <AlertCircle className="text-red-400 mt-1 flex-shrink-0" />
            <p className="text-red-200">{error}</p>
         </div>
      )}

      {result && !scanning && (
        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex flex-col gap-3 bg-gray-900 p-4 rounded-xl border border-gray-700">
            <span className="font-bold text-gray-300 text-xl text-center">Çeviri / Translation</span>
            <div className="flex gap-2 justify-center" role="group" aria-label="Dil seçimi">
              <button
                onClick={() => setLanguage('tr')}
                aria-pressed={language === 'tr'}
                className={`flex-1 p-3 rounded-lg font-bold text-lg focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none transition-colors border-2 ${language === 'tr' ? 'bg-blue-600 border-blue-400 text-white' : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'}`}
              >
                Türkçe
              </button>
              <button
                onClick={() => setLanguage('en')}
                aria-pressed={language === 'en'}
                className={`flex-1 p-3 rounded-lg font-bold text-lg focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none transition-colors border-2 ${language === 'en' ? 'bg-blue-600 border-blue-400 text-white' : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'}`}
              >
                English
              </button>
              <button
                onClick={() => setLanguage('ar')}
                aria-pressed={language === 'ar'}
                className={`flex-1 p-3 rounded-lg font-bold text-lg focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none transition-colors border-2 ${language === 'ar' ? 'bg-blue-600 border-blue-400 text-white' : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'}`}
              >
                العربية
              </button>
            </div>
          </div>

          <div className="bg-gray-800 p-6 rounded-2xl border-l-4 border-yellow-400">
            <div className="mb-6 p-4 bg-yellow-900/40 border border-yellow-600 rounded-xl">
               <p className="text-yellow-400 font-bold text-center">
                 Bu bir tıbbi tavsiye değildir, yalnızca dil sadeleştirme aracıdır. Lütfen doktorunuza danışın.
               </p>
            </div>

            <h3 className="text-2xl font-bold text-yellow-400 mb-2">1. Durumunuz Nedir?</h3>
            <div className="h-4 bg-gray-700 rounded w-3/4 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-700 rounded w-full mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-700 rounded w-5/6 mb-6 animate-pulse"></div>

            <h3 className="text-2xl font-bold text-yellow-400 mb-2">2. Doktorunuz Ne Demek İstiyor?</h3>
            <div className="h-4 bg-gray-700 rounded w-full mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-700 rounded w-4/5 mb-6 animate-pulse"></div>

            <h3 className="text-2xl font-bold text-yellow-400 mb-2">3. Dikkat Etmeniz Gerekenler</h3>
            <div className="h-4 bg-gray-700 rounded w-full mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-700 rounded w-3/4 mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-700 rounded w-5/6 animate-pulse"></div>
          </div>

          <button
            onClick={() => setResult(null)}
            className="bg-gray-800 hover:bg-gray-700 text-white p-4 rounded-xl font-bold focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none transition-colors"
          >
            Yeni Rapor Tara
          </button>
        </div>
      )}
    </div>
  );
}
