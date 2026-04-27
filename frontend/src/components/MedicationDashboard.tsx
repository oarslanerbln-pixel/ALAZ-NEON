"use client";

import { useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";

interface Medication {
  id: string;
  name: string;
  time: string;
  takenToday: boolean;
}

export default function MedicationDashboard() {
  const [meds, setMeds] = useState<Medication[]>([
    { id: "1", name: "Tansiyon İlacı", time: "08:00", takenToday: false },
    { id: "2", name: "D Vitamini", time: "12:00", takenToday: true },
    { id: "3", name: "Kalp İlacı", time: "20:00", takenToday: false },
  ]);

  const toggleTaken = (id: string) => {
    setMeds(meds.map(med =>
      med.id === id ? { ...med, takenToday: !med.takenToday } : med
    ));
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-xl mx-auto p-4 mt-8">
      <h2 className="text-2xl font-bold border-b-2 border-yellow-400 pb-2 mb-4">Günlük İlaçlarım</h2>

      <div className="flex flex-col gap-4">
        {meds.map(med => (
          <div
            key={med.id}
            role="button"
            tabIndex={0}
            aria-label={`${med.name} ilacı saat ${med.time}. Durum: ${med.takenToday ? 'Alındı' : 'Alınmadı'}. Değiştirmek için tıklayın.`}
            aria-pressed={med.takenToday}
            onClick={() => toggleTaken(med.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleTaken(med.id);
              }
            }}
            className={`
              flex items-center justify-between p-6 rounded-2xl border-4 cursor-pointer transition-all focus-visible:outline-4 focus-visible:outline-yellow-500
              ${med.takenToday
                ? 'bg-yellow-400/20 border-yellow-400 opacity-70'
                : 'bg-black border-yellow-400 hover:bg-yellow-400/10'
              }
            `}
          >
            <div className="flex flex-col">
              <span className="text-2xl font-bold">{med.name}</span>
              <span className="text-xl opacity-80 mt-1">{med.time}</span>
            </div>

            <div className="flex items-center justify-center p-2">
              {med.takenToday ? (
                <CheckCircle2 className="w-12 h-12 text-yellow-400" />
              ) : (
                <Circle className="w-12 h-12 text-yellow-400" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
