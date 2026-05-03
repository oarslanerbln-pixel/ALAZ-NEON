"use client";

import { useState } from "react";
import { Camera } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function UploadDocument() {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<{
    status: string;
    what: string;
    doctor: string;
    attention: string;
  } | null>(null);

  const [language, setLanguage] = useState<"tr" | "en" | "ar">("tr");

  const handleUpload = () => {
    setIsScanning(true);
    setResult(null);

    // Mock OCR process
    setTimeout(() => {
      setIsScanning(false);
      setResult({
        status: "Tahlil sonuçlarına göre kolesterol seviyeniz biraz yüksek.",
        what: "Doktorunuz, kanınızdaki yağ oranının sınırın üzerinde olduğunu söylüyor.",
        doctor: "Doktorunuz, kanınızdaki yağ oranının sınırın üzerinde olduğunu söylüyor.",
        attention: "Yağlı yiyeceklerden uzak durmalı ve günlük yürüyüş yapmalısınız.",
      });
    }, 3000);
  };

  return (
    <div className="w-full mb-12">
      <h2 className="text-2xl font-bold mb-6 border-b-2 border-yellow-400 pb-2">
        Evrak Yükle / Fotoğraf Çek
      </h2>

      <div className="flex flex-col items-center justify-center gap-6">
        <button
          onClick={handleUpload}
          className="w-full sm:w-auto bg-yellow-400 text-black font-bold py-6 px-10 rounded-xl text-xl flex items-center justify-center gap-4 hover:bg-yellow-300 focus-visible:ring-4 focus-visible:ring-white transition-colors"
          aria-label="Kamera ile evrak taramak için tıklayın"
        >
          <Camera size={40} aria-hidden="true" />
          <span>Evrak Tara</span>
        </button>

        <AnimatePresence>
          {isScanning && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              role="alert"
              aria-live="assertive"
              className="text-xl font-bold mt-4 flex items-center gap-2"
            >
              <div className="w-6 h-6 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
              Raporunuz taranıyor...
            </motion.div>
          )}
        </AnimatePresence>

        {result && !isScanning && (
          <div className="w-full mt-8 bg-neutral-900 border-2 border-yellow-400 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6 border-b border-yellow-600 pb-4">
              <h3 className="text-xl font-bold">Özet Sonuç</h3>
              <div className="flex gap-2">
                {(["tr", "en", "ar"] as const).map((lang) => (
                  <button
                    key={lang}
                    onClick={() => setLanguage(lang)}
                    aria-pressed={language === lang}
                    className={`px-4 py-2 font-bold rounded-md border-2 ${
                      language === lang
                        ? "bg-yellow-400 text-black border-yellow-400"
                        : "bg-transparent text-yellow-400 border-yellow-400 hover:bg-yellow-400/20"
                    }`}
                  >
                    {lang.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <section>
                <h4 className="text-xl font-bold text-white mb-2">
                  1. Durumunuz Nedir?
                </h4>
                <p className="text-lg leading-relaxed">{result.status}</p>
              </section>

              <section>
                <h4 className="text-xl font-bold text-white mb-2">
                  2. Doktorunuz Ne Demek İstiyor?
                </h4>
                <p className="text-lg leading-relaxed">{result.what}</p>
              </section>

              <section>
                <h4 className="text-xl font-bold text-white mb-2">
                  3. Dikkat Etmeniz Gerekenler
                </h4>
                <p className="text-lg leading-relaxed">{result.attention}</p>
              </section>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
