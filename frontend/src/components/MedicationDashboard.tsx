"use client";

import React, { useState } from "react";

type Medication = {
  id: string;
  name: string;
  timeOfDay: string;
  isTaken: boolean;
};

export default function MedicationDashboard() {
  const [medications, setMedications] = useState<Medication[]>([
    { id: "1", name: "Tansiyon İlacı (Amlodipin)", timeOfDay: "Sabah", isTaken: false },
    { id: "2", name: "Şeker İlacı (Metformin)", timeOfDay: "Akşam", isTaken: false },
  ]);

  const toggleMedication = (id: string) => {
    setMedications((prev) =>
      prev.map((med) => (med.id === id ? { ...med, isTaken: !med.isTaken } : med))
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleMedication(id);
    }
  };

  return (
    <div className="border-4 border-[var(--color-hc-border)] p-6 rounded-lg bg-[var(--color-hc-bg)]">
      <h2 className="text-2xl font-bold mb-6 border-b-2 border-[var(--color-hc-border)] pb-2">
        Günlük İlaç Takibi
      </h2>
      <div className="flex flex-col gap-6">
        {medications.map((med) => (
          <div
            key={med.id}
            role="button"
            tabIndex={0}
            aria-pressed={med.isTaken}
            onClick={() => toggleMedication(med.id)}
            onKeyDown={(e) => handleKeyDown(e, med.id)}
            className={`flex items-center justify-between p-6 border-4 rounded-lg cursor-pointer transition-colors focus-visible-hc
              ${
                med.isTaken
                  ? "border-[var(--color-hc-success)] bg-[var(--color-hc-success)] text-black"
                  : "border-[var(--color-hc-border)] bg-transparent text-[var(--color-hc-text)] hover:bg-[var(--color-hc-border)] hover:text-black"
              }
            `}
          >
            <div>
              <p className="text-xl font-bold">{med.name}</p>
              <p className="text-lg font-bold opacity-90">{med.timeOfDay}</p>
            </div>
            <div className="flex items-center justify-center border-4 border-current w-12 h-12 rounded">
              {med.isTaken && (
                <span className="text-3xl font-extrabold" aria-hidden="true">
                  ✓
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
