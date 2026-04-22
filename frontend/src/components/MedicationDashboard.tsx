"use client";

import React, { useState } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  time: string;
  taken: boolean;
}

const mockMedications: Medication[] = [
  { id: '1', name: 'Tansiyon İlacı', dosage: '1 Tablet', time: 'Sabah (08:00)', taken: false },
  { id: '2', name: 'Şeker İlacı', dosage: '1 Tablet', time: 'Öğle (13:00)', taken: true },
  { id: '3', name: 'Kalp İlacı', dosage: 'Yarım Tablet', time: 'Akşam (20:00)', taken: false },
];

export default function MedicationDashboard() {
  const [medications, setMedications] = useState<Medication[]>(mockMedications);

  const toggleMedication = (id: string) => {
    setMedications(meds => meds.map(med =>
      med.id === id ? { ...med, taken: !med.taken } : med
    ));
  };

  const handleKeyDown = (event: React.KeyboardEvent, id: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleMedication(id);
    }
  };

  return (
    <div className="flex flex-col gap-6 p-4 border-4 border-hc-text rounded-xl bg-hc-bg w-full max-w-2xl mx-auto mt-8">
      <h2 className="text-3xl font-bold text-hc-accent border-b-4 border-hc-text pb-4">Günlük İlaçlarım</h2>

      <div className="flex flex-col gap-4">
        {medications.map(med => (
          <div
            key={med.id}
            role="button"
            tabIndex={0}
            aria-pressed={med.taken}
            aria-label={`${med.name}, ${med.dosage}, ${med.time}. ${med.taken ? 'Alındı' : 'Alınmadı'}`}
            onClick={() => toggleMedication(med.id)}
            onKeyDown={(e) => handleKeyDown(e, med.id)}
            className={`
              flex items-center justify-between p-6 rounded-lg border-4 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-hc-accent
              ${med.taken
                ? 'bg-green-800 border-green-400 text-white'
                : 'bg-hc-text text-hc-bg border-transparent hover:border-hc-accent'
              }
            `}
          >
            <div className="flex flex-col gap-1">
              <span className="text-2xl font-bold">{med.name}</span>
              <span className="text-xl">{med.dosage} - {med.time}</span>
            </div>

            <div className="flex items-center justify-center p-2">
              {med.taken ? (
                <CheckCircle2 size={48} className="text-green-400" />
              ) : (
                <Circle size={48} className="text-hc-bg" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
