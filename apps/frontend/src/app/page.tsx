'use client';
import { useState } from 'react';
import { Camera, Pill, FileText, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'ocr' | 'meds'>('ocr');
  const [isScanning, setIsScanning] = useState(false);

  return (
    <div className="min-h-screen bg-black text-white p-4 font-sans">
      <div className="max-w-md mx-auto space-y-8">
        <header className="text-center pt-8">
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">MediSade</h1>
          <p className="text-sm text-zinc-400">Karmaşık tıbbi raporlarınızı sadeleştirin</p>
        </header>

        <div className="flex bg-zinc-900 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('ocr')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'ocr' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Camera size={18} />
            Rapor Tarama
          </button>
          <button
            onClick={() => setActiveTab('meds')}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'meds' ? 'bg-white text-black' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Pill size={18} />
            İlaç Takibi
          </button>
        </div>

        <main>
          {activeTab === 'ocr' ? (
            <div className="space-y-6">
              <div className="border-2 border-dashed border-zinc-700 rounded-xl p-8 flex flex-col items-center justify-center text-center h-64 bg-zinc-900/50">
                {isScanning ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="mb-4"
                  >
                    <Camera size={48} className="text-blue-400" />
                  </motion.div>
                ) : (
                  <Camera size={48} className="text-zinc-500 mb-4" />
                )}

                <h3 className="text-lg font-medium text-white mb-2">
                  {isScanning ? 'Raporunuz taranıyor...' : 'Evrak Fotoğrafı Yükle'}
                </h3>
                <p className="text-sm text-zinc-400 mb-6">
                  {isScanning
                    ? 'Lütfen bekleyin, metin işleniyor.'
                    : 'Tıbbi raporunuzun veya reçetenizin fotoğrafını çekin ya da yükleyin.'}
                </p>

                {!isScanning && (
                  <button
                    onClick={() => {
                      setIsScanning(true);
                      setTimeout(() => setIsScanning(false), 3000);
                    }}
                    className="bg-white text-black px-6 py-3 rounded-full font-medium hover:bg-zinc-200 transition-colors flex items-center gap-2"
                  >
                    <Camera size={18} />
                    Kamerayı Aç
                  </button>
                )}
              </div>

              <div className="bg-zinc-900 rounded-xl p-6">
                 <div className="flex items-start gap-3">
                   <FileText className="text-blue-400 shrink-0 mt-1" />
                   <div>
                     <h4 className="font-medium text-white mb-1">Nasıl çalışır?</h4>
                     <p className="text-sm text-zinc-400">Yüklediğiniz belgeler cihazınızda işlenir, sunucularımızda saklanmaz. Sonuçlar size 3 basit başlıkta özetlenir.</p>
                   </div>
                 </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-xl font-medium text-white mb-4">Bugünkü İlaçlarınız</h2>

              {[
                { name: 'Tansiyon İlacı', dose: '1 Tablet', time: 'Sabah (Tok)', taken: true },
                { name: 'Vitamin D', dose: '1 Kapsül', time: 'Öğle (Tok)', taken: false },
                { name: 'Kolesterol', dose: '1 Tablet', time: 'Akşam (Aç)', taken: false },
              ].map((med, i) => (
                <div key={i} className="bg-zinc-900 rounded-xl p-4 flex items-center justify-between border border-zinc-800">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${med.taken ? 'bg-green-900/30 text-green-400' : 'bg-zinc-800 text-zinc-400'}`}>
                      {med.taken ? <CheckCircle2 size={24} /> : <Pill size={24} />}
                    </div>
                    <div>
                      <h3 className={`font-medium text-lg ${med.taken ? 'text-zinc-300 line-through' : 'text-white'}`}>{med.name}</h3>
                      <p className="text-sm text-zinc-400">{med.dose} - {med.time}</p>
                    </div>
                  </div>
                  {!med.taken && (
                    <button className="bg-white text-black px-4 py-2 rounded-lg font-medium text-sm hover:bg-zinc-200 transition-colors">
                      Alındı İşaretle
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>

        <footer className="pt-12 pb-8 border-t border-zinc-800 mt-12">
          <p className="text-xs text-zinc-500 text-center uppercase tracking-wide">
            ÖNEMLİ UYARI
          </p>
          <p className="text-sm text-zinc-400 text-center mt-2 font-medium bg-zinc-900 p-4 rounded-lg">
            Bu bir tıbbi tavsiye değildir, yalnızca dil sadeleştirme aracıdır. Lütfen doktorunuza danışın.
          </p>
        </footer>
      </div>
    </div>
  );
}
