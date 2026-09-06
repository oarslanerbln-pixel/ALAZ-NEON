"use client";

import { useState } from "react";
import { Pill, CheckCircle, Clock, ArrowLeft } from "lucide-react";
import Link from "next/link";

// Mock data for initial skeleton
const mockMedications = [
  { id: "1", name: "Tansiyon İlacı", dosage: "1 Tablet", time: "Sabah 08:00", taken: false },
  { id: "2", name: "Vitamin", dosage: "1 Kapsül", time: "Öğle 12:00", taken: true },
  { id: "3", name: "Kalp İlacı", dosage: "Yarım Tablet", time: "Akşam 20:00", taken: false },
];

export default function MedicationsPage() {
  const [meds, setMeds] = useState(mockMedications);

  const toggleTaken = (id: string) => {
    setMeds(meds.map(m => m.id === id ? { ...m, taken: !m.taken } : m));
  };

  return (
    <div className="p-6">
      <header className="mb-8 flex items-center gap-4">
        <Link
          href="/"
          className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400"
          aria-label="Ana Sayfaya Dön"
        >
          <ArrowLeft className="w-6 h-6 text-yellow-400" />
        </Link>
        <h1 className="text-2xl font-bold text-yellow-400">İlaç Takibi</h1>
      </header>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white mb-4">Bugünkü İlaçlarınız</h2>

        {meds.map((med) => (
          <div
            key={med.id}
            className={`p-5 rounded-xl border-2 flex items-center gap-4 transition-colors ${
              med.taken ? "bg-green-900/30 border-green-500" : "bg-gray-800 border-gray-600"
            }`}
          >
            <div className={`p-3 rounded-full ${med.taken ? "bg-green-800 text-green-400" : "bg-yellow-900 text-yellow-400"}`}>
              {med.taken ? <CheckCircle className="w-8 h-8" aria-hidden="true" /> : <Pill className="w-8 h-8" aria-hidden="true" />}
            </div>

            <div className="flex-1">
              <h3 className={`text-xl font-bold ${med.taken ? "text-green-400 line-through opacity-70" : "text-white"}`}>
                {med.name}
              </h3>
              <div className="flex items-center gap-2 text-gray-300 mt-1">
                <span className="font-medium">{med.dosage}</span>
                <span className="text-gray-500">•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" /> {med.time}
                </span>
              </div>
            </div>

            <button
              onClick={() => toggleTaken(med.id)}
              className={`py-3 px-6 rounded-lg font-bold text-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400 ${
                med.taken
                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                  : "bg-yellow-500 text-black hover:bg-yellow-400"
              }`}
              aria-label={`${med.name} ilacını ${med.taken ? "alınmadı" : "alındı"} olarak işaretle`}
            >
              {med.taken ? "İptal" : "Alındı"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
