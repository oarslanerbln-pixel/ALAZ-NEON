"use client";

import { useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";

type Medication = {
  id: string;
  name: string;
  dosage: string;
  time: string;
  taken: boolean;
};

const mockMedications: Medication[] = [
  { id: "1", name: "Tansiyon İlacı", dosage: "1 Tablet", time: "Sabah 08:00", taken: false },
  { id: "2", name: "Şeker İlacı", dosage: "1 Tablet", time: "Akşam 20:00", taken: true },
];

export function MedicationDashboard() {
  const [medications, setMedications] = useState<Medication[]>(mockMedications);

  const toggleMedication = (id: string) => {
    setMedications(meds => meds.map(m => m.id === id ? { ...m, taken: !m.taken } : m));
  };

  return (
    <div className="flex flex-col gap-4">
      {medications.map((med) => (
        <div
          key={med.id}
          role="button"
          tabIndex={0}
          aria-pressed={med.taken}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              toggleMedication(med.id);
            }
          }}
          onClick={() => toggleMedication(med.id)}
          className={`flex items-center justify-between p-6 rounded-xl border-4 cursor-pointer transition-colors focus-visible:outline-4 focus-visible:outline-white ${
            med.taken
              ? "bg-green-900 border-green-500 text-green-100"
              : "bg-gray-900 border-yellow-400 text-yellow-400"
          }`}
        >
          <div className="flex flex-col gap-1">
            <span className="text-2xl font-bold">{med.name}</span>
            <span className="text-lg opacity-90">{med.dosage} - {med.time}</span>
          </div>
          <div aria-hidden="true">
            {med.taken ? (
              <CheckCircle2 className="w-10 h-10 text-green-400" />
            ) : (
              <Circle className="w-10 h-10 text-yellow-400" />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
