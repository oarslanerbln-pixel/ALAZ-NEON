"use client";

import { useState } from "react";
import { CheckCircle, Circle } from "lucide-react";

type Medication = {
  id: string;
  name: string;
  dosage: string;
  taken: boolean;
};

export default function MedicationDashboard() {
  const [meds, setMeds] = useState<Medication[]>([
    { id: "1", name: "Tansiyon İlacı", dosage: "Sabah 1 Tok", taken: false },
    { id: "2", name: "Kan Sulandırıcı", dosage: "Akşam 1 Tok", taken: false },
  ]);

  const toggleTaken = (id: string) => {
    setMeds(meds.map(med =>
      med.id === id ? { ...med, taken: !med.taken } : med
    ));
  };

  return (
    <section className="bg-gray-900 p-6 rounded-lg">
      <h2 className="text-xl font-bold mb-6 border-b border-gray-700 pb-2">Günlük İlaçlarım</h2>

      <div className="flex flex-col gap-4">
        {meds.map((med) => (
          <div
            key={med.id}
            role="button"
            tabIndex={0}
            aria-pressed={med.taken}
            onClick={() => toggleTaken(med.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleTaken(med.id);
              }
            }}
            className={`flex items-center justify-between p-4 rounded-lg cursor-pointer border-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white ${
              med.taken
                ? "bg-green-900 border-green-500 text-white"
                : "bg-gray-800 border-gray-600 hover:bg-gray-700"
            }`}
          >
            <div>
              <p className="text-lg font-bold">{med.name}</p>
              <p className="text-sm opacity-80">{med.dosage}</p>
            </div>
            <div>
              {med.taken ? (
                <CheckCircle size={32} className="text-green-400" />
              ) : (
                <Circle size={32} className="text-gray-400" />
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}