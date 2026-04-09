"use client";

import React, { useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  taken: boolean;
}

const mockMedications: Medication[] = [
  { id: "1", name: "Parol", dosage: "500mg - Sabah", taken: false },
  { id: "2", name: "Tansiyon İlacı", dosage: "1 Adet - Akşam", taken: true },
];

export default function MedicationDashboard() {
  const [medications, setMedications] = useState<Medication[]>(mockMedications);

  const toggleMedication = (id: string) => {
    setMedications((prev) =>
      prev.map((med) => (med.id === id ? { ...med, taken: !med.taken } : med))
    );
  };

  return (
    <div className="flex flex-col p-6 bg-black text-white rounded-lg border-2 border-white max-w-md mx-auto my-4 w-full">
      <h2 className="text-2xl font-bold mb-6 text-center">Günlük İlaçlarım</h2>

      <div className="flex flex-col gap-4 w-full">
        {medications.map((med) => (
          <div
            key={med.id}
            role="button"
            tabIndex={0}
            className={`flex items-center justify-between p-6 border-4 rounded-lg cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white ${
              med.taken ? "bg-gray-800 border-gray-500 text-gray-300" : "bg-black border-white text-white hover:bg-gray-900"
            }`}
            onClick={() => toggleMedication(med.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleMedication(med.id);
              }
            }}
            aria-pressed={med.taken}
          >
            <div className="flex flex-col">
              <span className="text-2xl font-bold">{med.name}</span>
              <span className="text-lg mt-1">{med.dosage}</span>
            </div>

            <div className="flex items-center justify-center">
              {med.taken ? (
                <CheckCircle2 className="w-12 h-12 text-white" aria-hidden="true" />
              ) : (
                <Circle className="w-12 h-12 text-white" aria-hidden="true" />
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 border border-white bg-gray-900 w-full text-center">
        <p className="text-lg font-bold">
          Bu bir tıbbi tavsiye değildir, yalnızca dil sadeleştirme aracıdır. Lütfen doktorunuza danışın.
        </p>
      </div>
    </div>
  );
}
