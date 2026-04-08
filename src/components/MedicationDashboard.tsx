"use client";

import { useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";

type Medication = {
  id: string;
  name: string;
  time: string;
  taken: boolean;
};

export default function MedicationDashboard() {
  const [medications, setMedications] = useState<Medication[]>([
    { id: "1", name: "Tansiyon İlacı", time: "Sabah 08:00", taken: false },
    { id: "2", name: "Şeker İlacı", time: "Öğle 13:00", taken: false },
    { id: "3", name: "Kalp İlacı", time: "Akşam 20:00", taken: false },
  ]);

  const toggleTaken = (id: string) => {
    setMedications(medications.map(med =>
      med.id === id ? { ...med, taken: !med.taken } : med
    ));
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6 p-4">
      <h2 className="text-3xl font-bold border-b-4 border-[var(--foreground)] pb-2 mb-6">
        Günlük İlaçlarım
      </h2>

      <div className="space-y-4">
        {medications.map((med) => (
          <button
            key={med.id}
            onClick={() => toggleTaken(med.id)}
            className={`w-full flex items-center justify-between p-6 border-4 rounded-xl transition-all duration-200 active:scale-95 ${
              med.taken
                ? 'border-[var(--accent-success)] bg-[var(--accent-success)] text-[var(--background)]'
                : 'border-[var(--foreground)] bg-[var(--background)] text-[var(--foreground)]'
            }`}
            aria-pressed={med.taken}
          >
            <div className="flex flex-col items-start text-left">
              <span className="text-2xl font-bold">{med.name}</span>
              <span className="text-xl font-bold opacity-80">{med.time}</span>
            </div>

            <div className="ml-4 flex-shrink-0">
              {med.taken ? (
                <CheckCircle2 size={48} className="text-[var(--background)]" />
              ) : (
                <Circle size={48} className="text-[var(--foreground)]" />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}