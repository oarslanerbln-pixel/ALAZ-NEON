"use client";

import { useRef, useState, ChangeEvent } from 'react';
import Link from 'next/link';
import { Camera, Upload, Loader2, AlertTriangle, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { scanDocument, ApiError, ScannedDocument } from '@/lib/api';

type Phase = 'idle' | 'ocr' | 'summarizing' | 'done' | 'error';

export default function UploadDocument() {
  const { token, isLoading: isAuthLoading } = useAuth();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [phase, setPhase] = useState<Phase>('idle');
  const [ocrProgress, setOcrProgress] = useState(0);
  const [scanned, setScanned] = useState<ScannedDocument | null>(null);
  const [error, setError] = useState<string | null>(null);

  const reset = () => {
    setPhase('idle');
    setOcrProgress(0);
    setScanned(null);
    setError(null);
  };

  const handleFile = async (file: File) => {
    if (!token) return;

    setError(null);
    setScanned(null);
    setOcrProgress(0);
    setPhase('ocr');

    try {
      const { createWorker } = await import('tesseract.js');
      const worker = await createWorker('tur', undefined, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setOcrProgress(m.progress);
          }
        },
      });

      let text: string;
      try {
        const { data } = await worker.recognize(file);
        text = data.text;
      } finally {
        await worker.terminate();
      }

      if (!text.trim()) {
        setError('Rapordan metin okunamadı. Lütfen daha net bir fotoğrafla tekrar deneyin.');
        setPhase('error');
        return;
      }

      setPhase('summarizing');
      const doc = await scanDocument(token, text);
      setScanned(doc);
      setPhase('done');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Rapor işlenirken bir hata oluştu.');
      setPhase('error');
    }
  };

  const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) handleFile(file);
  };

  const isBusy = phase === 'ocr' || phase === 'summarizing';
  const showPicker = phase === 'idle' || isBusy;

  if (isAuthLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[30vh] gap-4">
        <Loader2 size={48} className="animate-spin text-blue-300" />
        <p>Yükleniyor...</p>
      </div>
    );
  }

  if (!token) {
    return (
      <div className="w-full bg-gray-800 p-6 rounded-xl text-center flex flex-col gap-4 items-center">
        <p className="text-lg">Rapor taramak için önce giriş yapmalısınız.</p>
        <Link href="/login" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400">
          Giriş Yap
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 items-center w-full">
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={onInputChange}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onInputChange}
      />

      {showPicker && (
        <div className="grid grid-cols-2 gap-4 w-full">
          <button
            onClick={() => cameraInputRef.current?.click()}
            disabled={isBusy}
            className="flex flex-col items-center justify-center p-6 bg-gray-800 rounded-xl border-2 border-dashed border-gray-600 hover:bg-gray-700 disabled:opacity-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            aria-label="Kamera ile çek"
          >
            <Camera size={32} className="mb-2" />
            <span className="font-bold">Fotoğraf Çek</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isBusy}
            className="flex flex-col items-center justify-center p-6 bg-gray-800 rounded-xl border-2 border-dashed border-gray-600 hover:bg-gray-700 disabled:opacity-50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
            aria-label="Dosya yükle"
          >
            <Upload size={32} className="mb-2" />
            <span className="font-bold">Dosya Seç</span>
          </button>
        </div>
      )}

      <AnimatePresence>
        {phase === 'ocr' && (
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
              Raporunuz taranıyor... %{Math.round(ocrProgress * 100)}
            </p>
          </motion.div>
        )}

        {phase === 'summarizing' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4 p-8 bg-blue-900 rounded-xl w-full"
            role="alert"
            aria-live="assertive"
          >
            <Loader2 size={48} className="animate-spin text-blue-300" />
            <p className="text-xl font-bold text-center">Rapor sadeleştiriliyor...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {phase === 'error' && error && (
        <div
          role="alert"
          aria-live="assertive"
          className="w-full bg-red-950 border-2 border-red-600 p-6 rounded-xl flex flex-col gap-4 items-center text-center"
        >
          <AlertTriangle size={40} className="text-red-400" />
          <p className="font-bold">{error}</p>
          <button
            onClick={reset}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            <RotateCcw size={18} /> Tekrar Dene
          </button>
        </div>
      )}

      {phase === 'done' && scanned && (
        <div className="w-full bg-gray-800 p-6 rounded-xl mt-4 flex flex-col gap-4">
          <h2 className="text-2xl font-bold text-yellow-400">Sonuç</h2>
          <p className="whitespace-pre-line">{scanned.summary}</p>
          <button
            onClick={reset}
            className="self-start px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            Yeni Rapor Tara
          </button>
        </div>
      )}
    </div>
  );
}
