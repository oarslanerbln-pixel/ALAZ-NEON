"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle } from 'lucide-react';

// Mock data for the MVP skeleton
const INITIAL_MEDICATIONS = [
  { id: '1', name: 'Parol 500mg', dosage: '1 Tablet', timeOfDay: 'Sabah (Tok)', taken: false },
  { id: '2', name: 'Aspirin 100mg', dosage: '1 Tablet', timeOfDay: 'Öğle (Tok)', taken: true },
  { id: '3', name: 'Lansor 30mg', dosage: '1 Kapsül', timeOfDay: 'Akşam (Aç)', taken: false },
];

export default function MedicationsPage() {
  const [medications, setMedications] = useState(INITIAL_MEDICATIONS);

  const toggleTaken = (id: string) => {
    setMedications(prev =>
      prev.map(med => med.id === id ? { ...med, taken: true } : med)
    );
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto min-h-screen pb-20">
      <header className="flex items-center gap-4 py-4 border-b border-gray-800">
        <Link
          href="/"
          className="p-2 -ml-2 rounded-lg hover:bg-gray-800 transition-colors focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none"
          aria-label="Ana sayfaya dön"
        >
          <ArrowLeft size={28} />
        </Link>
        <h1 className="text-2xl font-bold text-white">İlaçlarım</h1>
      </header>

      <div className="flex flex-col gap-4">
        {medications.map((med) => (
          <div
            key={med.id}
            className="flex flex-col bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-lg"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">{med.name}</h2>
                <p className="text-gray-300 text-lg">{med.dosage}</p>
                <p className="text-yellow-400 font-medium mt-2">{med.timeOfDay}</p>
              </div>
            </div>

            <button
              onClick={() => toggleTaken(med.id)}
              className={`w-full py-4 px-6 rounded-xl text-2xl font-bold flex items-center justify-center gap-3 transition-colors focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none ${
                med.taken
                  ? 'bg-green-700 text-white cursor-default'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
              }`}
              aria-pressed={med.taken}
              disabled={med.taken}
            >
              {med.taken ? (
                <>
                  <CheckCircle size={32} />
                  Alındı
                </>
              ) : (
                'İlacı Aldım'
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
