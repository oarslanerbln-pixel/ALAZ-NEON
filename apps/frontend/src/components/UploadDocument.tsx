"use client";

import { useRef, useState } from 'react';
import Link from 'next/link';
import { Camera, Upload, Loader2, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createWorker } from 'tesseract.js';
import { useAuth } from '@/lib/auth-context';
import { createDocument, ApiError } from '@/lib/api';

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export default function UploadDocument() {
  const { user } = useAuth();

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [noTextFound, setNoTextFound] = useState(false);
  const [rawText, setRawText] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summary, setSummary] = useState<string | null>(null);
  const [summarizeError, setSummarizeError] = useState<string | null>(null);

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetResults = () => {
    setNoTextFound(false);
    setRawText(null);
    setSummary(null);
    setSummarizeError(null);
  };

  const handleFileSelected = (file: File | undefined) => {
    setError(null);
    resetResults();

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

    void processFile(file);
  };

  const handleReset = () => {
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setError(null);
    setProgress(0);
    resetResults();
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const runOcr = async (file: File): Promise<string> => {
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
      return data.text.trim();
    } catch {
      setError('Tarama sırasında bir hata oluştu. Lütfen tekrar deneyin.');
      return '';
    } finally {
      if (worker) await worker.terminate();
      setIsScanning(false);
    }
  };

  const processFile = async (file: File) => {
    const text = await runOcr(file);
    if (!text) {
      setNoTextFound(true);
      return;
    }

    setRawText(text);

    if (!user) return; // Giriş yapılmamış: özetleme/kayıt atlanır, ham metin gösterilir.

    setIsSummarizing(true);
    setSummarizeError(null);
    try {
      const doc = await createDocument(text);
      setSummary(doc.summary);
    } catch (err) {
      setSummarizeError(err instanceof ApiError ? err.message : 'Özetleme sırasında bir hata oluştu.');
    } finally {
      setIsSummarizing(false);
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
        {isSummarizing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4 p-8 bg-blue-900 rounded-xl w-full"
            role="status"
            aria-live="polite"
          >
            <Loader2 size={48} className="animate-spin text-blue-300" />
            <p className="text-xl font-bold text-center">Rapor sadeleştiriliyor...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {noTextFound && (
        <p className="w-full text-center text-gray-400">
          Görselden okunabilir bir metin bulunamadı. Lütfen daha net ve iyi aydınlatılmış bir
          fotoğrafla tekrar deneyin.
        </p>
      )}

      {summary && (
        <div className="w-full bg-gray-800 p-6 rounded-xl mt-4">
          <h2 className="text-2xl font-bold mb-2 text-yellow-400">Sadeleştirilmiş Özet</h2>
          <p className="whitespace-pre-line">{summary}</p>
          {rawText && (
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded">
                Taranan ham metni göster
              </summary>
              <p className="whitespace-pre-line text-sm text-gray-400 mt-2">{rawText}</p>
            </details>
          )}
        </div>
      )}

      {!summary && rawText && (
        <div className="w-full bg-gray-800 p-6 rounded-xl mt-4">
          <h2 className="text-2xl font-bold mb-2 text-yellow-400">Okunan Metin</h2>
          {summarizeError ? (
            <p role="alert" aria-live="assertive" className="text-sm text-red-400 mb-4">
              {summarizeError}
            </p>
          ) : !user ? (
            <p className="text-sm text-gray-400 mb-4">
              Bu metni yapay zekayla sadeleştirmek ve kaydetmek için{' '}
              <Link href="/login" className="text-blue-400 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded">
                giriş yapın
              </Link>
              .
            </p>
          ) : null}
          <p className="whitespace-pre-line">{rawText}</p>
        </div>
      )}
    </div>
  );
}
