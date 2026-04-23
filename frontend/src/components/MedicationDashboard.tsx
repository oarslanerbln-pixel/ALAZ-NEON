"use client";

import { useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  time: string;
  taken: boolean;
}

const mockMedications: Medication[] = [
  { id: "1", name: "Tansiyon İlacı", dosage: "1 Tablet", time: "Sabah", taken: false },
  { id: "2", name: "Şeker İlacı", dosage: "1/2 Tablet", time: "Akşam", taken: true },
];

export default function MedicationDashboard() {
  const [meds, setMeds] = useState<Medication[]>(mockMedications);

  const toggleMedication = (id: string) => {
    setMeds((prev) =>
      prev.map((med) => (med.id === id ? { ...med, taken: !med.taken } : med))
    );
  };

  return (
    <div className="flex flex-col gap-6 my-8">
      <h2 className="text-3xl font-bold border-b-4 border-yellow-400 pb-2">Günlük İlaçlarım</h2>

      <div className="flex flex-col gap-4">
        {meds.map((med) => (
          <div
            key={med.id}
            role="button"
            tabIndex={0}
            aria-pressed={med.taken}
            onClick={() => toggleMedication(med.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleMedication(med.id);
              }
            }}
            className={`flex items-center justify-between p-6 border-4 rounded-2xl cursor-pointer transition-colors focus-visible:outline-4 focus-visible:outline-white focus-visible:outline-offset-4
              ${med.taken
                ? "bg-green-900 border-green-400 text-green-100"
                : "bg-black border-yellow-400 text-yellow-400 hover:bg-gray-900"
              }`}
          >
            <div className="flex flex-col gap-2">
              <span className="text-2xl font-bold">{med.name}</span>
              <span className="text-xl">{med.dosage} - {med.time}</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xl font-bold hidden sm:inline">
                {med.taken ? "Alındı" : "Alınmadı"}
              </span>
              {med.taken ? (
                <CheckCircle2 size={48} className="text-green-400" aria-hidden="true" />
              ) : (
                <Circle size={48} className="text-yellow-400" aria-hidden="true" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
