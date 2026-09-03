"use client";

import React, { useState } from 'react';
import { CheckCircle2, Clock } from 'lucide-react';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  taken: boolean;
}

export const MedicationPanel = () => {
  const [medications, setMedications] = useState<Medication[]>([
    { id: '1', name: 'Parol', dosage: '500mg', frequency: 'Sabah, Akşam', taken: false },
    { id: '2', name: 'Tansiyon İlacı', dosage: '10mg', frequency: 'Sabah', taken: true },
  ]);

  const toggleTaken = (id: string) => {
    setMedications(meds =>
      meds.map(m => m.id === id ? { ...m, taken: !m.taken } : m)
    );
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto mt-12">
      <h2 className="text-3xl font-bold mb-4 border-b-4 border-foreground pb-2">İlaç Takip Paneli</h2>

      <div className="flex flex-col gap-4">
        {medications.map((med) => (
          <div
            key={med.id}
            className={`flex flex-col sm:flex-row items-center justify-between p-6 rounded-2xl border-4 transition-colors ${
              med.taken
                ? 'border-success bg-background/5'
                : 'border-foreground bg-background'
            }`}
          >
            <div className="flex-1 mb-4 sm:mb-0 w-full">
              <h3 className="text-2xl font-bold mb-1">{med.name}</h3>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 text-lg">
                <span className="flex items-center gap-2">
                  <span className="font-bold border border-current px-2 rounded">{med.dosage}</span>
                </span>
                <span className="flex items-center gap-2">
                  <Clock size={24} aria-hidden="true" />
                  {med.frequency}
                </span>
              </div>
            </div>

            <button
              onClick={() => toggleTaken(med.id)}
              className={`w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-xl flex items-center justify-center gap-3 transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400 ${
                med.taken
                  ? 'bg-success text-black'
                  : 'bg-foreground text-background hover:bg-interactive hover:text-black'
              }`}
              aria-label={`${med.name} ilacını ${med.taken ? 'alınmadı' : 'alındı'} olarak işaretle`}
              aria-pressed={med.taken}
            >
              {med.taken ? (
                <>
                  <CheckCircle2 size={32} />
                  Alındı
                </>
              ) : (
                <>
                  İşaretle
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
