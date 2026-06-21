"use client";

import { useState } from 'react';
import { Camera, Upload, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type Language = 'tr' | 'en' | 'ar';

const TRANSLATIONS: Record<Language, { title: string, text: string }> = {
  tr: { title: "Sonuç", text: "1. Durumunuz Nedir?\nGenel kan tahlili sonuçlarınız normal sınırlar içindedir.\n\n2. Doktorunuz Ne Demek İstiyor?\nEndişe edecek bir durum yok, sağlığınız iyi görünüyor.\n\n3. Dikkat Etmeniz Gerekenler\nDüzenli beslenmeye ve su içmeye devam edin." },
  en: { title: "Result", text: "1. What is your condition?\nYour general blood test results are within normal limits.\n\n2. What does your doctor mean?\nThere is nothing to worry about, your health looks good.\n\n3. Things to pay attention to\nContinue to eat well and drink water." },
  ar: { title: "النتيجة", text: "1. ما هي حالتك؟\nنتائج فحص الدم العام ضمن الحدود الطبيعية.\n\n2. ماذا يعني طبيبك؟\nلا يوجد ما يدعو للقلق، صحتك تبدو جيدة.\n\n3. أشياء يجب الانتباه إليها\nاستمر في تناول طعام صحي وشرب الماء." }
};

export default function UploadDocument() {
  const [isScanning, setIsScanning] = useState(false);
  const [hasResult, setHasResult] = useState(false);
  const [lang, setLang] = useState<Language>('tr');

  const handleSimulateScan = () => {
    setIsScanning(true);
    setHasResult(false);
    setTimeout(() => {
      setIsScanning(false);
      setHasResult(true);
    }, 3000);
  };

  return (
    <div className="flex flex-col gap-6 items-center w-full">
      <div className="grid grid-cols-2 gap-4 w-full">
        <button
          onClick={handleSimulateScan}
          disabled={isScanning}
          className="flex flex-col items-center justify-center p-6 bg-gray-800 rounded-xl border-2 border-dashed border-gray-600 hover:bg-gray-700 focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Kamera ile çek"
        >
          <Camera size={32} className="mb-2" />
          <span className="font-bold">Fotoğraf Çek</span>
        </button>
        <button
          onClick={handleSimulateScan}
          disabled={isScanning}
          className="flex flex-col items-center justify-center p-6 bg-gray-800 rounded-xl border-2 border-dashed border-gray-600 hover:bg-gray-700 focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          aria-label="Dosya yükle"
        >
          <Upload size={32} className="mb-2" />
          <span className="font-bold">Dosya Seç</span>
        </button>
      </div>

      <AnimatePresence>
        {isScanning && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4 p-8 bg-blue-900 rounded-xl w-full"
            role="alert"
            aria-live="assertive"
          >
            <Loader2 size={48} className="animate-spin text-blue-300" />
            <p className="text-xl font-bold text-center">Raporunuz taranıyor...</p>
          </motion.div>
        )}
      </AnimatePresence>

      {hasResult && (
        <div className="w-full bg-gray-800 p-6 rounded-xl mt-4" role="status" aria-live="polite">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold text-yellow-400">{TRANSLATIONS[lang].title}</h2>
            <div className="flex gap-2">
              {(['tr', 'en', 'ar'] as Language[]).map(l => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`px-3 py-1 rounded-lg font-bold uppercase border-2 focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none ${lang === l ? 'bg-blue-600 border-blue-400 text-white' : 'bg-gray-700 border-gray-600 text-gray-300'}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
          <p className="whitespace-pre-line text-xl leading-relaxed">{TRANSLATIONS[lang].text}</p>
          <p className="mt-6 pt-4 border-t border-gray-600 text-sm text-yellow-400 font-bold">
            Bu bir tıbbi tavsiye değildir, yalnızca dil sadeleştirme aracıdır. Lütfen doktorunuza danışın.
          </p>
        </div>
      )}
    </div>
  );
}
