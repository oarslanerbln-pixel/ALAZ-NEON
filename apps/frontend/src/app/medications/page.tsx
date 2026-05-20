"use client";

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Circle } from 'lucide-react';

const MOCK_MEDS = [
  { id: 1, name: "Parol", dosage: "500mg", time: "Sabah", taken: false },
  { id: 2, name: "Tansiyon İlacı", dosage: "1 Tablet", time: "Öğle", taken: true },
];

export default function MedicationsPage() {
  const [meds, setMeds] = useState(MOCK_MEDS);

  const toggleMed = (id: number) => {
    setMeds(meds.map(m => m.id === id ? { ...m, taken: !m.taken } : m));
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4 mb-4">
        <Link href="/" className="px-6 py-3 bg-gray-800 border-2 border-gray-600 rounded-xl font-bold text-xl hover:bg-gray-700 focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none">Geri</Link>
        <h1 className="text-3xl font-bold">İlaçlarım</h1>
      </div>

      <div className="flex flex-col gap-6">
        {meds.map(med => (
          <button
            key={med.id}
            onClick={() => toggleMed(med.id)}
            className={`flex items-center justify-between p-6 rounded-2xl text-left transition-colors border-4 focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none ${med.taken ? 'bg-green-800 text-white border-green-400' : 'bg-black text-yellow-400 border-yellow-400 hover:bg-gray-900'}`}
            aria-pressed={med.taken}
          >
            <div>
              <h2 className="text-3xl font-bold mb-2">{med.name}</h2>
              <p className={`text-xl font-bold ${med.taken ? 'text-green-200' : 'text-yellow-200'}`}>
                {med.dosage} • {med.time}
              </p>
            </div>
            {med.taken ? (
              <div className="flex flex-col items-center">
                <CheckCircle2 size={48} className="text-green-300 mb-1" />
                <span className="font-bold text-green-300">Alındı</span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <Circle size={48} className="text-yellow-400 mb-1" />
                <span className="font-bold text-yellow-400">Alınmadı</span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
