"use client";
import { useState } from "react";
import { motion } from "framer-motion";

interface DocumentResult {
  heading1: string;
  text1: string;
  heading2: string;
  text2: string;
  heading3: string;
  text3: string;
}

export default function UploadDocument() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DocumentResult | null>(null);
  const [lang, setLang] = useState("tr");

  const handleUpload = () => {
    setLoading(true);
    setTimeout(() => {
      setResult({
        heading1: "1. Durumunuz Nedir?",
        text1: "Genel sağlık durumunuz stabil.",
        heading2: "2. Doktorunuz Ne Demek İstiyor?",
        text2: "Tansiyonunuzu kontrol altında tutun.",
        heading3: "3. Dikkat Etmeniz Gerekenler",
        text3: "Tuz tüketimini azaltın."
      });
      setLoading(false);
    }, 2000);
  };

  return (
    <div className="p-6 bg-black text-white rounded-lg border-4 border-yellow-400 w-full max-w-xl mx-auto my-4">
      <h2 className="text-2xl font-bold mb-4">Rapor Yükle / Çek</h2>

      <div className="flex gap-4 mb-4">
        <button aria-label="Türkçe" className={`p-3 text-lg font-bold border-4 rounded focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none ${lang === 'tr' ? 'bg-yellow-400 text-black border-yellow-400' : 'bg-black text-white border-white'}`} onClick={() => setLang('tr')}>TR</button>
        <button aria-label="English" className={`p-3 text-lg font-bold border-4 rounded focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none ${lang === 'en' ? 'bg-yellow-400 text-black border-yellow-400' : 'bg-black text-white border-white'}`} onClick={() => setLang('en')}>EN</button>
        <button aria-label="Arabic" className={`p-3 text-lg font-bold border-4 rounded focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none ${lang === 'ar' ? 'bg-yellow-400 text-black border-yellow-400' : 'bg-black text-white border-white'}`} onClick={() => setLang('ar')}>AR</button>
      </div>

      {!result && !loading && (
        <button aria-label="Fotoğraf Çek veya Yükle" onClick={handleUpload} className="w-full p-6 text-xl font-bold bg-yellow-400 text-black border-4 border-yellow-400 rounded-xl hover:bg-yellow-500 focus-visible:ring-4 focus-visible:ring-white focus-visible:outline-none">
          Fotoğraf Çek / Yükle
        </button>
      )}

      {loading && (
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-2xl text-yellow-400 font-bold p-8 text-center border-4 border-yellow-400 rounded-xl"
        >
          Raporunuz taranıyor...
        </motion.div>
      )}

      {result && !loading && (
        <div className="mt-6 space-y-4" role="status" aria-live="polite">
           <div className="bg-black border-4 border-white p-4 rounded-xl">
             <h3 className="text-xl font-bold text-yellow-400">{result.heading1}</h3>
             <p className="text-lg">{result.text1}</p>
           </div>
           <div className="bg-black border-4 border-white p-4 rounded-xl">
             <h3 className="text-xl font-bold text-yellow-400">{result.heading2}</h3>
             <p className="text-lg">{result.text2}</p>
           </div>
           <div className="bg-black border-4 border-white p-4 rounded-xl">
             <h3 className="text-xl font-bold text-yellow-400">{result.heading3}</h3>
             <p className="text-lg">{result.text3}</p>
           </div>
           <div className="mt-4 p-4 bg-red-900 border-4 border-red-500 rounded-xl text-center">
              <p className="text-lg font-bold text-white">Bu bir tıbbi tavsiye değildir, yalnızca dil sadeleştirme aracıdır. Lütfen doktorunuza danışın.</p>
           </div>
        </div>
      )}
    </div>
  );
}
