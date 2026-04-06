'use client';

import { useState } from 'react';
import { CheckCircle, Circle, Pill } from 'lucide-react';

// Mock Data
const MOCK_MEDICATIONS = [
  { id: '1', name: 'Parol 500mg', dosage: 'Günde 2 kez', time: 'Sabah (08:00)', isTaken: false },
  { id: '2', name: 'Tansiyon İlacı (Amlodipin)', dosage: 'Günde 1 kez', time: 'Öğle (13:00)', isTaken: true },
  { id: '3', name: 'Vitamin D', dosage: 'Günde 1 kez', time: 'Akşam (20:00)', isTaken: false },
];

export default function MedicationDashboard() {
  const [medications, setMedications] = useState(MOCK_MEDICATIONS);

  const toggleMedication = (id: string) => {
    setMedications(meds =>
      meds.map(med => med.id === id ? { ...med, isTaken: !med.isTaken } : med)
    );
  };

  return (
    <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-xl">
      <h2 className="text-2xl font-bold mb-6 text-yellow-400 flex items-center gap-3">
        <Pill className="w-8 h-8" />
        Günlük İlaç Takibi
      </h2>

      <div className="space-y-4">
        {medications.map((med) => (
          <button
            key={med.id}
            onClick={() => toggleMedication(med.id)}
            className={`w-full text-left p-5 rounded-xl border-2 flex items-center justify-between transition-all outline-none focus:ring-4 focus:ring-yellow-400 ${
              med.isTaken
                ? 'bg-green-900/30 border-green-500'
                : 'bg-gray-700 border-gray-600 hover:border-gray-500'
            }`}
          >
            <div className="flex-1">
              <h3 className={`text-xl font-bold ${med.isTaken ? 'text-green-400 line-through opacity-70' : 'text-white'}`}>
                {med.name}
              </h3>
              <p className="text-gray-300 text-lg mt-1">{med.time} - {med.dosage}</p>
            </div>

            <div className="shrink-0 ml-4">
              {med.isTaken ? (
                <div className="flex flex-col items-center">
                  <CheckCircle className="w-12 h-12 text-green-500" />
                  <span className="text-green-400 font-bold mt-1 text-sm">ALINDI</span>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Circle className="w-12 h-12 text-gray-400" />
                  <span className="text-gray-400 font-bold mt-1 text-sm">BEKLİYOR</span>
                </div>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
