"use client";

import { useState } from "react";

type Medication = {
  id: string;
  name: string;
  taken: boolean;
};

export default function MedicationDashboard() {
  const [meds, setMeds] = useState<Medication[]>([
    { id: "1", name: "Tansiyon İlacı (Sabah)", taken: false },
    { id: "2", name: "Şeker İlacı (Öğle)", taken: false },
  ]);

  const toggleTaken = (id: string) => {
    setMeds((currentMeds) =>
      currentMeds.map((med) =>
        med.id === id ? { ...med, taken: !med.taken } : med
      )
    );
  };

  return (
    <div className="p-4 border-2 border-foreground rounded-lg my-6">
      <h2 className="text-2xl font-bold mb-6">Günlük İlaç Takibi</h2>
      <div className="flex flex-col gap-4">
        {meds.map((med) => (
          <div
            key={med.id}
            className="flex items-center justify-between bg-foreground text-background p-4 rounded-xl"
          >
            <span className="text-xl font-bold">{med.name}</span>
            <button
              onClick={() => toggleTaken(med.id)}
              className={`text-xl font-bold py-4 px-8 rounded-lg border-4 transition-colors ${
                med.taken
                  ? "bg-interactive border-interactive text-background"
                  : "bg-background border-background text-foreground"
              }`}
              aria-label={`${med.name} ilacını ${med.taken ? 'alınmadı' : 'alındı'} olarak işaretle`}
            >
              {med.taken ? "Alındı ✓" : "Alınmadı"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
