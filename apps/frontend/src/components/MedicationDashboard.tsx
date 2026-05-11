"use client";

import { useState } from "react";

type Medication = {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  taken: boolean;
};

const initialMedications: Medication[] = [
  { id: "1", name: "Parol", dosage: "500mg", frequency: "Günde 2 kez", taken: false },
  { id: "2", name: "Aspirin", dosage: "100mg", frequency: "Günde 1 kez", taken: true },
];

export function MedicationDashboard() {
  const [medications, setMedications] = useState<Medication[]>(initialMedications);

  const toggleTaken = (id: string) => {
    setMedications(prev => prev.map(med =>
      med.id === id ? { ...med, taken: !med.taken } : med
    ));
  };

  return (
    <div className="border-4 border-black p-6 bg-white text-black my-8 rounded-xl">
      <h2 className="text-3xl font-bold mb-6">Bugünkü İlaçlarınız</h2>

      <div className="space-y-4">
        {medications.map(med => (
          <div
            key={med.id}
            className={`flex items-center justify-between p-4 border-4 border-black rounded-xl ${med.taken ? 'bg-green-200' : 'bg-gray-100'}`}
          >
            <div>
              <h3 className="text-2xl font-bold">{med.name}</h3>
              <p className="text-xl">{med.dosage} - {med.frequency}</p>
            </div>

            <button
              onClick={() => toggleTaken(med.id)}
              className={`px-6 py-4 text-2xl font-bold border-4 border-black rounded-xl cursor-pointer ${
                med.taken ? 'bg-green-600 text-white' : 'bg-white text-black hover:bg-gray-200'
              }`}
              role="button"
              tabIndex={0}
              aria-pressed={med.taken}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleTaken(med.id);
                }
              }}
            >
              {med.taken ? "ALINDI" : "ALINMADI"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
