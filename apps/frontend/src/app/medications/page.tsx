'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Circle } from 'lucide-react';

// Mock data
const INITIAL_MEDICATIONS = [
  { id: 1, name: 'Tansiyon İlacı (Sabah)', taken: false },
  { id: 2, name: 'Vitamin D (Öğle)', taken: true },
  { id: 3, name: 'Kolesterol İlacı (Akşam)', taken: false },
];

export default function MedicationsPage() {
  const [medications, setMedications] = useState(INITIAL_MEDICATIONS);

  const toggleMedication = (id: number) => {
    setMedications(meds =>
      meds.map(med =>
        med.id === id ? { ...med, taken: !med.taken } : med
      )
    );
  };

  return (
    <div className="flex flex-col gap-6 py-4">
      <div className="flex items-center gap-4 mb-4">
        <Link href="/" className="p-2 border-2 border-cyan-400 rounded-full hover:bg-cyan-900 transition-colors" aria-label="Ana Sayfaya Dön">
          <ArrowLeft className="text-cyan-400" />
        </Link>
        <h1 className="text-3xl font-bold">İlaçlarım</h1>
      </div>

      <p className="text-xl mb-4">
        Bugün almanız gereken ilaçlar aşağıdadır. Aldığınız ilaçları işaretleyin.
      </p>

      <div className="flex flex-col gap-4">
        {medications.map(med => (
          <button
            key={med.id}
            onClick={() => toggleMedication(med.id)}
            className={`flex items-center justify-between p-6 border-4 rounded-2xl transition-colors text-left w-full
              ${med.taken
                ? 'border-green-500 bg-green-900/30'
                : 'border-cyan-400 bg-black hover:bg-cyan-950/30'
              }
            `}
          >
            <span className="text-2xl font-bold w-[70%]">{med.name}</span>
            <div className="flex flex-col items-center gap-2">
              {med.taken ? (
                <>
                  <CheckCircle2 size={48} className="text-green-500" />
                  <span className="font-bold text-green-500">ALINDI</span>
                </>
              ) : (
                <>
                  <Circle size={48} className="text-cyan-400" />
                  <span className="font-bold text-cyan-400">BEKLİYOR</span>
                </>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
