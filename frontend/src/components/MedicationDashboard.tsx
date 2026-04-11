"use client";

import { useState } from "react";

type Medication = {
  id: number;
  name: string;
  taken: boolean;
};

export default function MedicationDashboard() {
  const [medications, setMedications] = useState<Medication[]>([
    { id: 1, name: "Parol 500mg - Sabah", taken: false },
    { id: 2, name: "Tansiyon İlacı - Akşam", taken: false },
  ]);

  const toggleTaken = (id: number) => {
    setMedications(meds =>
      meds.map(med => med.id === id ? { ...med, taken: !med.taken } : med)
    );
  };

  return (
    <div className="mt-8 border-4 border-border p-6 rounded-lg bg-background">
      <h2 className="text-2xl font-bold mb-6 text-primary">Günlük İlaç Takibi</h2>

      <div className="flex flex-col gap-4">
        {medications.map(med => (
          <div
            key={med.id}
            className={`border-4 p-4 flex justify-between items-center cursor-pointer focus-visible-ring
              ${med.taken ? 'border-primary bg-primary text-background' : 'border-border bg-background text-foreground'}
            `}
            role="button"
            tabIndex={0}
            aria-pressed={med.taken}
            aria-label={`${med.name} ilacı. ${med.taken ? 'Alındı' : 'Alınmadı'}`}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleTaken(med.id);
              }
            }}
            onClick={() => toggleTaken(med.id)}
          >
            <span className="text-xl font-bold">{med.name}</span>
            <span className={`text-xl font-bold px-4 py-2 border-2 ${med.taken ? 'border-background' : 'border-border'}`}>
              {med.taken ? 'ALINDI' : 'ALINMADI'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
