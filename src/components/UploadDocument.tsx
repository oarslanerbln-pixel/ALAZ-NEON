'use client';

import { useState, useRef } from 'react';
import Tesseract from 'tesseract.js';
import { Camera, Loader2, FileText, AlertCircle } from 'lucide-react';

export default function UploadDocument() {
  const [isScanning, setIsScanning] = useState(false);
  const [resultText, setResultText] = useState<string | null>(null);
  const [simplifiedText, setSimplifiedText] = useState<string | null>(null);
  const [language, setLanguage] = useState<'tr' | 'en' | 'ar'>('tr');
  const [isSimplifying, setIsSimplifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setError(null);
    setResultText(null);

    try {
      // Tesseract.js ile istemci tarafı OCR (Resimden Metin Çıkarma)
      // Türkçe (tur) ve İngilizce (eng) dilleri eklenebilir, şimdilik tr olarak varsayalım.
      const result = await Tesseract.recognize(
        file,
        'tur+eng',
        {
          logger: (m) => console.log(m) // İlerleme logları
        }
      );

      const text = result.data.text;

      if (!text || text.trim().length === 0) {
        throw new Error('Metin bulunamadı. Lütfen daha net bir fotoğraf çekin.');
      }

      setResultText(text);

    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || 'Okuma işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.');
      } else {
        setError('Okuma işlemi sırasında bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-xl mb-8">
      <h2 className="text-2xl font-bold mb-6 text-yellow-400 flex items-center gap-3">
        <FileText className="w-8 h-8" />
        Tıbbi Rapor Yükle / Çek
      </h2>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isScanning}
          className="flex-1 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:opacity-50 text-white p-6 rounded-xl font-bold text-xl flex flex-col items-center justify-center gap-3 transition-colors outline-none focus:ring-4 focus:ring-yellow-400"
        >
          <Camera className="w-12 h-12" />
          <span>Fotoğraf Çek veya Seç</span>
        </button>
        <input
          type="file"
          accept="image/*"
          capture="environment" // Mobilde direkt kamerayı açmayı dener
          className="hidden"
          ref={fileInputRef}
          onChange={handleFileUpload}
        />
      </div>

      {isScanning && (
        <div className="bg-gray-700 p-8 rounded-xl flex flex-col items-center justify-center text-center animate-pulse border-2 border-yellow-400">
          <Loader2 className="w-16 h-16 text-yellow-400 animate-spin mb-4" />
          <h3 className="text-2xl font-bold text-white">Raporunuz Taranıyor...</h3>
          <p className="text-gray-300 mt-2 text-lg">Bu işlem birkaç saniye sürebilir, lütfen bekleyin.</p>
        </div>
      )}

      {error && (
        <div className="bg-red-900/50 border border-red-500 p-4 rounded-xl flex items-start gap-3">
          <AlertCircle className="w-8 h-8 text-red-400 shrink-0" />
          <p className="text-red-100 font-semibold text-lg">{error}</p>
        </div>
      )}

      {resultText && !isScanning && !simplifiedText && (
        <div className="mt-6 border-t border-gray-700 pt-6">
          <h3 className="text-xl font-bold text-white mb-4">Metin başarıyla okundu. Hangi dilde sadeleştirilsin?</h3>

          <div className="flex gap-4 mb-6">
            <button onClick={() => setLanguage('tr')} className={`flex-1 p-3 rounded-lg font-bold text-lg border-2 ${language === 'tr' ? 'bg-yellow-400 text-gray-900 border-yellow-400' : 'bg-gray-700 text-white border-gray-600'}`}>Türkçe</button>
            <button onClick={() => setLanguage('en')} className={`flex-1 p-3 rounded-lg font-bold text-lg border-2 ${language === 'en' ? 'bg-yellow-400 text-gray-900 border-yellow-400' : 'bg-gray-700 text-white border-gray-600'}`}>English</button>
            <button onClick={() => setLanguage('ar')} className={`flex-1 p-3 rounded-lg font-bold text-lg border-2 ${language === 'ar' ? 'bg-yellow-400 text-gray-900 border-yellow-400' : 'bg-gray-700 text-white border-gray-600'}`}>العربية</button>
          </div>

          <button
            onClick={async () => {
              setIsSimplifying(true);
              setError(null);
              try {
                const res = await fetch('/api/simplify', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ text: resultText, language })
                });
                const data = await res.json();
                if(!res.ok) throw new Error(data.error || 'Sadeleştirme hatası');
                setSimplifiedText(data.result);
              } catch (err: unknown) {
                if (err instanceof Error) {
                  setError(err.message);
                } else {
                  setError('Bilinmeyen bir hata oluştu.');
                }
              } finally {
                setIsSimplifying(false);
              }
            }}
            disabled={isSimplifying}
            className="w-full mt-4 bg-green-600 hover:bg-green-500 disabled:bg-gray-600 text-white p-4 rounded-xl font-bold text-xl transition-colors outline-none focus:ring-4 focus:ring-yellow-400 flex justify-center items-center gap-2"
          >
            {isSimplifying ? (
              <><Loader2 className="w-6 h-6 animate-spin" /> Anlaşılır Dile Çevriliyor...</>
            ) : (
              'Metni Sadeleştir ve Çevir'
            )}
          </button>
        </div>
      )}

      {simplifiedText && (
        <div className="mt-6 border-t border-gray-700 pt-6">
           <h3 className="text-2xl font-bold text-yellow-400 mb-4">Raporunuzun Özeti:</h3>
           <div className="bg-gray-900 p-6 rounded-xl border-2 border-green-500">
             <p className="text-white text-lg leading-relaxed whitespace-pre-wrap">{simplifiedText}</p>
           </div>
           <button
             onClick={() => {
               setResultText(null);
               setSimplifiedText(null);
             }}
             className="w-full mt-6 bg-gray-700 hover:bg-gray-600 text-white p-4 rounded-xl font-bold text-xl transition-colors"
           >
             Yeni Belge Okut
           </button>
        </div>
      )}
    </div>
  );
}
