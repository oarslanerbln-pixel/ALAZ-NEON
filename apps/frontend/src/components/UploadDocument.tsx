"use client";

import { useRef, useState } from 'react';
import { Camera, Upload, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { extractTextFromImage } from '@/lib/ocr';
import { api } from '@/lib/api';

type Stage = 'idle' | 'reading' | 'summarizing';

export default function UploadDocument() {
  const [stage, setStage] = useState<Stage>('idle');
  const [summary, setSummary] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = async (file: File) => {
    setError(null);
    setSummary(null);
    try {
      setStage('reading');
      const text = await extractTextFromImage(file);
      if (!text) {
        throw new Error('Görselden metin okunamadı. Daha net bir fotoğraf deneyin.');
      }

      setStage('summarizing');
      const document = await api.createDocument(text);
      setSummary(document.summary);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Rapor işlenemedi.');
    } finally {
      setStage('idle');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (file) void processFile(file);
  };

  const isBusy = stage !== 'idle';

  return (
    <div className="flex flex-col gap-6 items-center w-full">
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="grid grid-cols-2 gap-4 w-full">
        <button
          onClick={() => cameraInputRef.current?.click()}
          disabled={isBusy}
          className="flex flex-col items-center justify-center p-6 bg-gray-800 rounded-xl border-2 border-dashed border-gray-600 hover:bg-gray-700 disabled:opacity-50 transition-colors"
          aria-label="Kamera ile çek"
        >
          <Camera size={32} className="mb-2" />
          <span className="font-bold">Fotoğraf Çek</span>
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isBusy}
          className="flex flex-col items-center justify-center p-6 bg-gray-800 rounded-xl border-2 border-dashed border-gray-600 hover:bg-gray-700 disabled:opacity-50 transition-colors"
          aria-label="Dosya yükle"
        >
          <Upload size={32} className="mb-2" />
          <span className="font-bold">Dosya Seç</span>
        </button>
      </div>

      <AnimatePresence>
        {isBusy && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4 p-8 bg-blue-900 rounded-xl w-full"
            role="alert"
            aria-live="assertive"
          >
            <Loader2 size={48} className="animate-spin text-blue-300" />
            <p className="text-xl font-bold text-center">
              {stage === 'reading' ? 'Görselden metin okunuyor...' : 'Rapor özetleniyor...'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <div className="w-full bg-red-900 border-2 border-red-600 p-4 rounded-xl" role="alert">
          <p>{error}</p>
        </div>
      )}

      {summary && (
        <div className="w-full bg-gray-800 p-6 rounded-xl mt-4">
          <h2 className="text-2xl font-bold mb-4 text-yellow-400">Sonuç</h2>
          <p className="whitespace-pre-line">{summary}</p>
        </div>
      )}
    </div>
  );
}
