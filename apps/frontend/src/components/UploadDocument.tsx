"use client";

import { useRef, useState } from 'react';
import { Camera, Upload, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createWorker } from 'tesseract.js';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export default function UploadDocument() {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<string | null>(null);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelected = (file: File | undefined) => {
    setError(null);
    setResult(null);

    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Lütfen JPEG, PNG veya WebP formatında bir görsel seçin.');
      return;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      setError('Dosya çok büyük. Lütfen 10MB\'tan küçük bir görsel seçin.');
      return;
    }

    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });

    void runOcr(file);
  };

  const handleReset = () => {
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setResult(null);
    setError(null);
    setProgress(0);
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const runOcr = async (file: File) => {
    setIsScanning(true);
    setProgress(0);

    let worker: Awaited<ReturnType<typeof createWorker>> | null = null;
    try {
      worker = await createWorker('tur', 1, {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });
      const { data } = await worker.recognize(file);
      const text = data.text.trim();
      setResult(
        text || 'Görselden okunabilir bir metin bulunamadı. Lütfen daha net ve iyi aydınlatılmış bir fotoğrafla tekrar deneyin.'
      );
    } catch {
      setError('Tarama sırasında bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      if (worker) await worker.terminate();
      setIsScanning(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 items-center w-full">
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(e) => handleFileSelected(e.target.files?.[0])}
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => handleFileSelected(e.target.files?.[0])}
      />

      <div className="grid grid-cols-2 gap-4 w-full">
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          disabled={isScanning}
          className="flex flex-col items-center justify-center p-6 bg-gray-800 rounded-xl border-2 border-dashed border-gray-600 hover:bg-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:opacity-50 transition-colors"
          aria-label="Kamera ile çek"
        >
          <Camera size={32} className="mb-2" />
          <span className="font-bold">Fotoğraf Çek</span>
        </button>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={isScanning}
          className="flex flex-col items-center justify-center p-6 bg-gray-800 rounded-xl border-2 border-dashed border-gray-600 hover:bg-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:opacity-50 transition-colors"
          aria-label="Dosya yükle"
        >
          <Upload size={32} className="mb-2" />
          <span className="font-bold">Dosya Seç</span>
        </button>
      </div>

      {error && (
        <p role="alert" aria-live="assertive" className="w-full text-center font-bold text-red-400">
          {error}
        </p>
      )}

      {previewUrl && (
        <div className="relative w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Seçilen rapor önizlemesi"
            className="w-full max-h-80 object-contain rounded-xl bg-gray-800"
          />
          <button
            type="button"
            onClick={handleReset}
            disabled={isScanning}
            aria-label="Görseli kaldır"
            className="absolute top-2 right-2 p-2 bg-gray-900/80 rounded-full hover:bg-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>
      )}

      <AnimatePresence>
        {isScanning && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4 p-8 bg-blue-900 rounded-xl w-full"
            role="status"
            aria-live="polite"
          >
            <Loader2 size={48} className="animate-spin text-blue-300" />
            <p className="text-xl font-bold text-center">Görsel taranıyor... %{progress}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {result && (
        <div className="w-full bg-gray-800 p-6 rounded-xl mt-4">
          <h2 className="text-2xl font-bold mb-2 text-yellow-400">Okunan Metin</h2>
          <p className="text-sm text-gray-400 mb-4">
            Bu, taranan görselden çıkarılan ham metindir. Yapay zeka destekli sadeleştirme henüz bu sürümde yok.
          </p>
          <p className="whitespace-pre-line">{result}</p>
        </div>
      )}
    </div>
  );
}
