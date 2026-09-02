"use client";

import React, { useState } from 'react';
import { CheckCircle, Circle } from 'lucide-react';

type Medication = {
  id: string;
  name: string;
  time: string;
  taken: boolean;
};

export function MedicationDashboard() {
  const [meds, setMeds] = useState<Medication[]>([
    { id: '1', name: 'Tansiyon İlacı', time: 'Sabah - 08:00', taken: false },
    { id: '2', name: 'Kalp İlacı', time: 'Akşam - 20:00', taken: false },
  ]);

  const toggleTaken = (id: string) => {
    setMeds(m => m.map(med => med.id === id ? { ...med, taken: !med.taken } : med));
  };

  return (
    <div className="flex flex-col gap-4 p-6 border-2 border-interactive rounded-xl w-full max-w-md">
      <h2 className="text-2xl font-bold">İlaçlarım</h2>

      <div className="flex flex-col gap-3">
        {meds.map(med => (
          <button
            key={med.id}
            onClick={() => toggleTaken(med.id)}
            className={`flex items-center justify-between p-4 border-2 rounded-xl text-left transition-colors
              ${med.taken ? 'border-green-500 bg-green-900/30' : 'border-interactive bg-black hover:bg-white/10'}`}
            aria-label={`${med.name}, ${med.time}, ${med.taken ? 'Alındı' : 'Alınmadı'}`}
          >
            <div>
              <p className="text-xl font-bold text-foreground">{med.name}</p>
              <p className="text-lg text-foreground/80">{med.time}</p>
            </div>

            {med.taken ? (
              <div className="flex flex-col items-center text-green-400">
                <CheckCircle size={40} />
                <span className="font-bold">Alındı</span>
              </div>
            ) : (
              <div className="flex flex-col items-center text-interactive">
                <Circle size={40} />
                <span className="font-bold">Alınmadı</span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
