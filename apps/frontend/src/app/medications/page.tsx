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
        <Link href="/" className="px-4 py-2 bg-black border-4 border-white text-white rounded-lg font-bold focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none hover:bg-gray-800">Geri</Link>
        <h1 className="text-2xl font-bold text-white">İlaçlarım</h1>
      </div>

      <div className="flex flex-col gap-4">
        {meds.map(med => (
          <button
            key={med.id}
            onClick={() => toggleMed(med.id)}
            className={`flex items-center justify-between p-6 rounded-xl text-left transition-colors border-4 focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none ${med.taken ? 'bg-black border-green-400' : 'bg-black border-white hover:bg-gray-800'}`}
            aria-pressed={med.taken}
          >
            <div>
              <h2 className="text-2xl font-bold text-white">{med.name}</h2>
              <p className="text-white mt-1">{med.time}</p>
            </div>
            {med.taken ? <CheckCircle2 size={40} className="text-green-400" /> : <Circle size={40} className="text-white" />}
          </button>
        ))}
      </div>
    </div>
  );
}
