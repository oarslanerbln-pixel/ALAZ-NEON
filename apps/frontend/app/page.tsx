"use client";
import { useState } from "react";
import { CheckCircle, Circle } from "lucide-react";
import Link from "next/link";

const initialMedications = [
  { id: "1", name: "Parol 500mg", time: "Sabah", taken: false },
  { id: "2", name: "Tansiyon İlacı", time: "Öğle", taken: false },
];

export default function DashboardPage() {
  const [meds, setMeds] = useState(initialMedications);

  const toggleTaken = (id: string) => {
    setMeds(meds.map(m => m.id === id ? { ...m, taken: !m.taken } : m));
  };

  return (
    <div className="flex flex-col items-center p-8 space-y-8">
      <h1 className="text-4xl font-bold text-yellow-400">Günlük İlaçlarım</h1>
      <div className="w-full max-w-2xl space-y-6">
        {meds.map(med => (
          <div key={med.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 border-4 border-cyan-400 rounded-xl bg-black gap-4">
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-yellow-400">{med.name}</span>
              <span className="text-2xl text-cyan-400">{med.time}</span>
            </div>
            <button
              onClick={() => toggleTaken(med.id)}
              className="flex items-center justify-center space-x-4 p-4 border-4 border-yellow-400 rounded-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-400 cursor-pointer"
              aria-label={`${med.name} alındı olarak işaretle`}
            >
              {med.taken ? (
                <>
                  <CheckCircle className="w-12 h-12 text-green-400" />
                  <span className="text-2xl font-bold text-green-400">Alındı</span>
                </>
              ) : (
                <>
                  <Circle className="w-12 h-12 text-yellow-400" />
                  <span className="text-2xl font-bold text-yellow-400">Alınmadı</span>
                </>
              )}
            </button>
          </div>
        ))}
      </div>
      <Link href="/upload" className="mt-12 p-6 border-4 border-cyan-400 text-cyan-400 text-3xl font-bold rounded-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400 text-center block max-w-md w-full hover:bg-cyan-900 transition-colors">
        Yeni Rapor Ekle
      </Link>
    </div>
  );
}
