"use client";
import { useState } from "react";
import { Upload, FileText, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function UploadDocument() {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<null | {
    status: string;
    doctorSays: string;
    precautions: string;
  }>(null);

  const handleUpload = () => {
    setIsScanning(true);
    // Simulate OCR and LLM processing
    setTimeout(() => {
      setIsScanning(false);
      setResult({
        status: "Tansiyonunuz biraz yüksek çıkmış. Kan değerleriniz ise normal sınırlarda.",
        doctorSays: "Doktorunuz, kalp sağlığınızı korumak için tansiyonunuzu kontrol altında tutmanızı istiyor.",
        precautions: "Tuz tüketimini azaltın. Her gün yürüyüş yapmaya çalışın. İlaçlarınızı düzenli alın."
      });
    }, 3000);
  };

  return (
    <div className="w-full">
      <div
        role="status"
        aria-live="polite"
        className="w-full"
      >
        {!result && (
          <div className="bg-background border-4 border-foreground p-8 rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,0,1)] text-center flex flex-col items-center gap-6">
            <FileText size={64} className="text-foreground" />
            <p className="text-xl font-bold">Evrakınızı kameraya okutun veya yükleyin.</p>

            <button
              onClick={handleUpload}
              disabled={isScanning}
              className="bg-primary text-background dark:text-foreground text-xl font-bold py-4 px-8 rounded-xl border-4 border-transparent hover:bg-opacity-90 transition-colors focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none flex items-center gap-4 disabled:opacity-50"
            >
              {isScanning ? (
                <>
                  <Loader2 size={24} className="animate-spin" />
                  Raporunuz taranıyor...
                </>
              ) : (
                <>
                  <Upload size={24} />
                  Belge Yükle / Çek
                </>
              )}
            </button>
          </div>
        )}

        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-background border-4 border-foreground rounded-lg shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] dark:shadow-[8px_8px_0px_0px_rgba(255,255,0,1)] overflow-hidden"
            >
              <div className="bg-foreground text-background p-4">
                <h2 className="text-2xl font-bold">Rapor Sonucu</h2>
              </div>
              <div className="p-6 flex flex-col gap-8">
                <div>
                  <h3 className="text-2xl font-bold mb-2 border-b-2 border-foreground inline-block">1. Durumunuz Nedir?</h3>
                  <p className="text-xl mt-2">{result.status}</p>
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2 border-b-2 border-foreground inline-block">2. Doktorunuz Ne Demek İstiyor?</h3>
                  <p className="text-xl mt-2">{result.doctorSays}</p>
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2 border-b-2 border-foreground inline-block">3. Dikkat Etmeniz Gerekenler</h3>
                  <p className="text-xl mt-2">{result.precautions}</p>
                </div>

                <button
                  onClick={() => setResult(null)}
                  className="mt-4 border-4 border-foreground text-foreground text-xl font-bold py-3 px-6 rounded-xl hover:bg-foreground hover:text-background transition-colors focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none"
                >
                  Yeni Evrak Yükle
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
