"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Camera, FileUp } from "lucide-react";

export function UploadDocument() {
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleUpload = () => {
    setIsScanning(true);
    setResult(null);

    // Simulate OCR and LLM processing
    setTimeout(() => {
      setIsScanning(false);
      setResult("success");
    }, 3000);
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-8">
      <div className="border-4 border-[#ffff00] rounded-2xl p-8 flex flex-col items-center justify-center gap-6 text-center">
        <h2 className="text-3xl font-bold">Raporunuzu Ekleyin</h2>
        <p className="text-xl">
          Tıbbi raporunuzun fotoğrafını çekin veya dosya olarak yükleyin.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <button
            onClick={handleUpload}
            className="flex-1 flex items-center justify-center gap-4 bg-[#ffff00] text-black text-2xl font-bold py-6 px-4 rounded-xl border-4 border-transparent hover:border-white focus:border-white transition-all"
            disabled={isScanning}
          >
            <Camera size={36} />
            <span>Kamera ile Çek</span>
          </button>

          <button
            onClick={handleUpload}
            className="flex-1 flex items-center justify-center gap-4 bg-transparent text-[#ffff00] border-4 border-[#ffff00] text-2xl font-bold py-6 px-4 rounded-xl hover:bg-[#1a1a00] focus:bg-[#1a1a00] transition-all"
            disabled={isScanning}
          >
            <FileUp size={36} />
            <span>Dosya Yükle</span>
          </button>
        </div>
      </div>

      <div role="status" aria-live="polite" className="min-h-[200px]">
        {isScanning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center p-12 border-4 border-[#ffff00] border-dashed rounded-2xl"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
              className="mb-6"
            >
              <Camera size={64} className="text-[#ffff00]" />
            </motion.div>
            <p className="text-3xl font-bold animate-pulse">Raporunuz taranıyor...</p>
            <p className="text-xl mt-4">Lütfen bekleyin, bu işlem birkaç saniye sürebilir.</p>
          </motion.div>
        )}

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#1a1a00] border-4 border-[#ffff00] rounded-2xl p-6 sm:p-8 flex flex-col gap-8"
          >
            <h2 className="text-3xl font-bold text-center border-b-2 border-[#ffff00] pb-4">Rapor Özeti</h2>

            <div className="flex flex-col gap-8">
              <section>
                <h3 className="text-2xl font-bold text-[#ffff00] mb-3">1. Durumunuz Nedir?</h3>
                <p className="text-xl bg-black p-4 rounded-lg">
                  Kan tahlillerinize göre hafif bir kansızlık (anemi) durumunuz var. Endişe edilecek büyük bir sorun görünmüyor.
                </p>
              </section>

              <section>
                <h3 className="text-2xl font-bold text-[#ffff00] mb-3">2. Doktorunuz Ne Demek İstiyor?</h3>
                <p className="text-xl bg-black p-4 rounded-lg">
                  Vücudunuzda yeterince demir bulunmuyor. Bu yüzden kendinizi yorgun ve halsiz hissediyor olabilirsiniz. Doktorunuz, demir seviyenizi yükseltmek için size ilaç yazmış.
                </p>
              </section>

              <section>
                <h3 className="text-2xl font-bold text-[#ffff00] mb-3">3. Dikkat Etmeniz Gerekenler</h3>
                <ul className="text-xl bg-black p-4 rounded-lg list-disc list-inside flex flex-col gap-2">
                  <li>İlacınızı doktorun söylediği saatte düzenli olarak alın.</li>
                  <li>İlacı içerken süt, çay veya kahve ile değil, bol su veya portakal suyu ile için.</li>
                  <li>Kırmızı et ve yeşil yapraklı sebzeler (ıspanak gibi) yemeye özen gösterin.</li>
                </ul>
              </section>
            </div>

            <div className="mt-4 p-4 border-2 border-[#ffff00] border-dashed rounded-lg text-center">
              <p className="text-lg font-bold">
                ⚠️ Bu bir tıbbi tavsiye değildir, yalnızca dil sadeleştirme aracıdır. Lütfen doktorunuza danışın.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
