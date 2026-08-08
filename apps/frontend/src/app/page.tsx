"use client";
import React, { useState } from "react";
import { Camera, Pill, Upload, FileText } from "lucide-react";
import { motion } from "framer-motion";

export default function Home() {
  const [activeTab, setActiveTab] = useState<"ocr" | "medications">("ocr");
  const [ocrStatus, setOcrStatus] = useState<"idle" | "scanning" | "done">("idle");
  const [ocrResult, setOcrResult] = useState<string | null>(null);

  const [medications, setMedications] = useState([
    { id: 1, name: "Parol 500mg", time: "Sabah 08:00", taken: false },
    { id: 2, name: "Tansiyon İlacı", time: "Akşam 20:00", taken: true },
  ]);

  const toggleMedication = (id: number) => {
    setMedications(medications.map(m => m.id === id ? { ...m, taken: !m.taken } : m));
  };

  const handleScan = () => {
    setOcrStatus("scanning");
    setTimeout(() => {
      setOcrStatus("done");
      setOcrResult("Tıbbi metni 70 yaşındaki birinin anlayacağı sadelikte 3 başlıkta özetle:\n\n1. Durumunuz Nedir?\nGenel kan tahlilleriniz normal görünüyor. Hafif bir enfeksiyon belirtisi var.\n\n2. Doktorunuz Ne Demek İstiyor?\nVücudunuzda küçük bir mikrop var ama korkulacak bir şey yok.\n\n3. Dikkat Etmeniz Gerekenler\nBol su için, dinlenin ve doktorun yazdığı antibiyotiği saati saatine kullanın.");
    }, 2000);
  };

  return (
    <div className="flex flex-col min-h-screen bg-black text-white p-4">
      <header className="flex justify-between items-center py-4 border-b border-gray-700">
        <h1 className="text-2xl font-bold">MediSade</h1>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-gray-800 rounded-lg text-white font-bold focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none" role="button" tabIndex={0}>TR</button>
          <button className="px-4 py-2 bg-gray-800 rounded-lg text-white font-bold focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none" role="button" tabIndex={0}>EN</button>
          <button className="px-4 py-2 bg-gray-800 rounded-lg text-white font-bold focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none" role="button" tabIndex={0}>AR</button>
        </div>
      </header>

      <div className="flex gap-4 my-6">
        <button
          onClick={() => setActiveTab("ocr")}
          className={`flex-1 py-4 text-xl font-bold rounded-xl flex items-center justify-center gap-2 ${activeTab === "ocr" ? "bg-yellow-400 text-black" : "bg-gray-800"} focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none`}
        >
          <FileText size={28} />
          Rapor Oku
        </button>
        <button
          onClick={() => setActiveTab("medications")}
          className={`flex-1 py-4 text-xl font-bold rounded-xl flex items-center justify-center gap-2 ${activeTab === "medications" ? "bg-yellow-400 text-black" : "bg-gray-800"} focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none`}
        >
          <Pill size={28} />
          İlaçlarım
        </button>
      </div>

      <main className="flex-1">
        {activeTab === "ocr" && (
          <div className="flex flex-col gap-6">
            <div className="bg-gray-900 border-2 border-dashed border-gray-600 rounded-2xl p-8 flex flex-col items-center justify-center gap-4">
              <Camera size={64} className="text-gray-400" />
              <p className="text-xl text-center font-bold">Kamerayı Aç ve Raporun Fotoğrafını Çek</p>
              <button onClick={handleScan} className="w-full py-4 mt-4 bg-blue-600 hover:bg-blue-500 rounded-xl text-2xl font-bold flex items-center justify-center gap-3 focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none">
                <Upload size={28} />
                Fotoğraf Yükle
              </button>
            </div>

            <div role="status" aria-live="polite">
              {ocrStatus === "scanning" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="p-6 bg-gray-800 rounded-xl flex items-center justify-center gap-4">
                  <div className="w-8 h-8 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-2xl font-bold">Raporunuz taranıyor...</span>
                </motion.div>
              )}

              {ocrStatus === "done" && ocrResult && (
                <div className="bg-gray-800 rounded-xl p-6 flex flex-col gap-4 border border-gray-600">
                  <h2 className="text-2xl font-bold text-yellow-400">Rapor Özeti</h2>
                  <div className="text-lg leading-relaxed whitespace-pre-wrap">{ocrResult}</div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "medications" && (
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold mb-4">Bugünkü İlaçlarınız</h2>
            {medications.map(med => (
              <div key={med.id} className={`flex items-center justify-between p-6 rounded-xl border-2 ${med.taken ? "bg-green-900/30 border-green-500" : "bg-gray-800 border-gray-600"}`}>
                <div className="flex flex-col gap-2">
                  <span className="text-2xl font-bold">{med.name}</span>
                  <span className="text-xl text-gray-400">{med.time}</span>
                </div>
                <button
                  onClick={() => toggleMedication(med.id)}
                  className={`px-8 py-4 rounded-xl text-xl font-bold focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none ${med.taken ? "bg-green-600 text-white" : "bg-gray-700 text-white"}`}
                >
                  {med.taken ? "ALINDI" : "ALINMADI"}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
