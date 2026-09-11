"use client";

import { useState } from "react";
import { CheckCircle } from "lucide-react";

export default function MedicationDashboard() {
  const [medications, setMedications] = useState([
    { id: 1, name: "Tansiyon İlacı", dosage: "Sabah 1 Tok", taken: false },
    { id: 2, name: "Kalp İlacı", dosage: "Akşam 1 Aç", taken: false },
  ]);

  const toggleTaken = (id: number) => {
    setMedications(meds => meds.map(med =>
      med.id === id ? { ...med, taken: !med.taken } : med
    ));
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold border-b border-gray-700 pb-2">Günlük İlaçlarınız</h2>

      <div className="grid gap-4">
        {medications.map(med => (
          <div key={med.id} className="bg-gray-900 border border-gray-700 p-4 rounded-lg flex items-center justify-between">
            <div>
              <p className="text-xl font-bold">{med.name}</p>
              <p className="text-lg opacity-80">{med.dosage}</p>
            </div>

            <button
              onClick={() => toggleTaken(med.id)}
              className={`p-4 rounded-full flex items-center justify-center border-4 ${
                med.taken ? "bg-green-600 border-green-500" : "bg-transparent border-[var(--interactive)]"
              }`}
              aria-label={`${med.name} ilacını alındı olarak işaretle`}
            >
              <CheckCircle size={32} className={med.taken ? "text-white" : "text-[var(--interactive)]"} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
