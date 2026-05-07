"use client";

import React, { useState } from "react";
import { CheckCircle, Circle } from "lucide-react";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  time: string;
  taken: boolean;
}

const INITIAL_MEDS: Medication[] = [
  { id: "1", name: "Tansiyon İlacı", dosage: "1 Tablet", time: "Sabah", taken: false },
  { id: "2", name: "Kalp İlacı", dosage: "Yarım Tablet", time: "Öğle", taken: false },
  { id: "3", name: "Vitamin", dosage: "1 Tablet", time: "Akşam", taken: true },
];

export default function MedicationDashboard() {
  const [meds, setMeds] = useState<Medication[]>(INITIAL_MEDS);

  const toggleMedication = (id: string) => {
    setMeds(meds.map(med =>
      med.id === id ? { ...med, taken: !med.taken } : med
    ));
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleMedication(id);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-6">
      <h2 className="text-3xl font-extrabold text-yellow-400 border-b-2 border-yellow-400 pb-2">
        Günlük İlaçlarım
      </h2>

      <div className="space-y-4">
        {meds.map((med) => (
          <div
            key={med.id}
            role="button"
            tabIndex={0}
            aria-pressed={med.taken}
            onClick={() => toggleMedication(med.id)}
            onKeyDown={(e) => handleKeyDown(e, med.id)}
            className={`flex items-center justify-between p-6 border-4 rounded-2xl cursor-pointer transition-all focus-visible-high-contrast ${
              med.taken
                ? "bg-black border-yellow-400 text-yellow-400 opacity-70"
                : "bg-yellow-400 border-yellow-400 text-black font-bold"
            }`}
          >
            <div className="flex flex-col">
              <span className="text-2xl font-extrabold">{med.name}</span>
              <span className="text-xl">
                {med.dosage} - {med.time}
              </span>
            </div>
            <div>
              {med.taken ? (
                <CheckCircle size={48} aria-hidden="true" />
              ) : (
                <Circle size={48} aria-hidden="true" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
