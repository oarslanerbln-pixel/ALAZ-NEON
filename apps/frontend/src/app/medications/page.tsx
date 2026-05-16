"use client";

import { useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Circle } from 'lucide-react';

const MOCK_MEDS = [
  { id: 1, name: "Parol 500mg", time: "Sabah", taken: false },
  { id: 2, name: "Tansiyon İlacı", time: "Öğle", taken: true },
];

export default function MedicationsPage() {
  const [meds, setMeds] = useState(MOCK_MEDS);

  const toggleMed = (id: number) => {
    setMeds(meds.map(m => m.id === id ? { ...m, taken: !m.taken } : m));
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4 mb-4">
        <Link href="/" className="px-4 py-2 bg-gray-800 hover:bg-gray-700 focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none rounded-lg font-bold transition-colors">Geri</Link>
        <h1 className="text-2xl font-bold">İlaçlarım</h1>
      </div>

      <div className="flex flex-col gap-4">
        {meds.map(med => (
          <button
            key={med.id}
            onClick={() => toggleMed(med.id)}
            className={`flex items-center justify-between p-6 rounded-xl text-left transition-colors border-2 focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none ${med.taken ? 'bg-green-900 border-green-600' : 'bg-gray-800 border-gray-600 hover:bg-gray-700'}`}
            aria-pressed={med.taken}
          >
            <div>
              <h2 className="text-2xl font-bold">{med.name}</h2>
              <p className="text-gray-300 mt-1">{med.time}</p>
            </div>
            {med.taken ? <CheckCircle2 size={40} className="text-green-400" /> : <Circle size={40} className="text-gray-400" />}
          </button>
        ))}
      </div>
    </div>
  );
}
