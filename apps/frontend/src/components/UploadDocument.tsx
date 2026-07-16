"use client";
import { useState } from "react";
import { Camera, Loader2, Upload } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function UploadDocument() {
  const [status, setStatus] = useState<"idle" | "scanning" | "done">("idle");

  const handleSimulateScan = () => {
    setStatus("scanning");
    setTimeout(() => {
      setStatus("done");
    }, 3000);
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      <h2 className="text-3xl font-bold text-yellow-400 mb-2">Rapor Yükleme</h2>

      {status === "idle" && (
        <div className="grid grid-cols-1 gap-6 w-full">
            <button
                onClick={handleSimulateScan}
                className="w-full flex flex-col items-center justify-center gap-4 bg-black border-4 border-yellow-400 p-10 rounded-2xl text-yellow-400 hover:bg-gray-800 transition-colors focus-visible:ring-4 focus-visible:ring-white focus-visible:outline-none"
            >
                <Camera size={64} />
                <span className="text-3xl font-bold">Fotoğraf Çek</span>
            </button>
            <button
                onClick={handleSimulateScan}
                className="w-full flex flex-col items-center justify-center gap-4 bg-black border-4 border-yellow-400 p-10 rounded-2xl text-yellow-400 hover:bg-gray-800 transition-colors focus-visible:ring-4 focus-visible:ring-white focus-visible:outline-none"
            >
                <Upload size={64} />
                <span className="text-3xl font-bold">Dosya Seç</span>
            </button>
        </div>
      )}

      <AnimatePresence>
        {status === "scanning" && (
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                role="status"
                aria-live="polite"
                className="flex flex-col items-center justify-center p-12 bg-black rounded-2xl border-4 border-blue-500 w-full"
            >
                <Loader2 size={64} className="animate-spin text-blue-400 mb-6" />
                <p className="text-4xl font-bold text-blue-400">Raporunuz taranıyor...</p>
            </motion.div>
        )}
      </AnimatePresence>

      {status === "done" && (
        <div className="bg-black p-6 rounded-2xl border-4 border-green-500 flex flex-col gap-6 w-full" role="status" aria-live="polite">
          <div className="flex flex-col sm:flex-row gap-4 w-full">
            <button className="flex-1 bg-yellow-400 text-black py-4 rounded-xl font-bold text-2xl hover:bg-yellow-500 focus-visible:ring-4 focus-visible:ring-white focus-visible:outline-none">İngilizce</button>
            <button className="flex-1 bg-yellow-400 text-black py-4 rounded-xl font-bold text-2xl hover:bg-yellow-500 focus-visible:ring-4 focus-visible:ring-white focus-visible:outline-none">Arapça</button>
          </div>
          <div className="mt-4">
            <h3 className="text-2xl font-bold text-white mb-2">1. Durumunuz Nedir?</h3>
            <p className="text-gray-300 text-xl mb-6">Özet metni buraya gelecek.</p>
            <h3 className="text-2xl font-bold text-white mb-2">2. Doktorunuz Ne Demek İstiyor?</h3>
            <p className="text-gray-300 text-xl mb-6">Özet metni buraya gelecek.</p>
            <h3 className="text-2xl font-bold text-white mb-2">3. Dikkat Etmeniz Gerekenler</h3>
            <p className="text-gray-300 text-xl">Özet metni buraya gelecek.</p>
          </div>
          <div className="mt-8 p-4 bg-gray-900 border-2 border-yellow-400 rounded-xl">
             <p className="text-yellow-400 font-bold text-lg text-center">Bu bir tıbbi tavsiye değildir, yalnızca dil sadeleştirme aracıdır. Lütfen doktorunuza danışın.</p>
          </div>
        </div>
      )}
    </div>
  );
}