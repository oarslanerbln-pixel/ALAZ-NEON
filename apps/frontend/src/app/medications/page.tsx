'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Circle } from 'lucide-react';

// Mock data for MVP skeleton
const MOCK_MEDICATIONS = [
  { id: '1', name: 'Aspirin (100mg)', timeOfDay: 'Sabah', taken: false },
  { id: '2', name: 'Lisinopril (10mg)', timeOfDay: 'Sabah', taken: true },
  { id: '3', name: 'Metformin (500mg)', timeOfDay: 'Akşam', taken: false },
];

export default function MedicationsPage() {
  const [medications, setMedications] = useState(MOCK_MEDICATIONS);

  const toggleTaken = (id: string) => {
    setMedications(meds =>
      meds.map(med =>
        med.id === id ? { ...med, taken: !med.taken } : med
      )
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4 border-b border-gray-800 pb-4">
        <Link
          href="/"
          className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none transition-colors"
          aria-label="Ana Sayfaya Dön"
        >
          <ArrowLeft size={24} />
        </Link>
        <h1 className="text-3xl font-bold">İlaçlarım</h1>
      </div>

      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-gray-300">Günlük İlaç Takibi</h2>

        {medications.map((med) => (
          <div
            key={med.id}
            className={`flex items-center justify-between p-6 rounded-2xl border-2 transition-colors ${
              med.taken
                ? 'bg-green-900/30 border-green-600'
                : 'bg-gray-900 border-gray-700'
            }`}
          >
            <div className="flex flex-col gap-1">
              <span className="text-2xl font-bold text-white">{med.name}</span>
              <span className={`text-lg font-bold ${med.taken ? 'text-green-400' : 'text-yellow-400'}`}>
                {med.timeOfDay}
              </span>
            </div>

            <button
              onClick={() => toggleTaken(med.id)}
              className={`flex items-center justify-center p-4 rounded-xl font-bold text-xl transition-colors focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none ${
                med.taken
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-gray-700 hover:bg-gray-600 text-white'
              }`}
              aria-pressed={med.taken}
              aria-label={`${med.name} için alındı durumunu değiştir`}
            >
              {med.taken ? (
                <span className="flex items-center gap-2">
                  <CheckCircle2 size={28} /> Alındı
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Circle size={28} /> İşaretle
                </span>
              )}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-blue-900/30 border-2 border-blue-600 p-6 rounded-2xl">
        <h3 className="text-xl font-bold text-blue-300 mb-2">Hatırlatma</h3>
        <p className="text-lg text-blue-100">Lütfen ilaçlarınızı doktorunuzun önerdiği saatlerde almayı unutmayın.</p>
      </div>
    </div>
  );
}
