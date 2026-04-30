"use client";

import React, { useState } from "react";
import { Pill, Check } from "lucide-react";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  frequency: string;
  takenToday: boolean;
}

const mockMedications: Medication[] = [
  { id: "1", name: "Tansiyon İlacı", dosage: "50mg", frequency: "Sabah", takenToday: false },
  { id: "2", name: "Kalp İlacı", dosage: "100mg", frequency: "Akşam", takenToday: true },
];

export default function MedicationDashboard() {
  const [medications, setMedications] = useState<Medication[]>(mockMedications);

  const toggleTaken = (id: string) => {
    setMedications(meds =>
      meds.map(med =>
        med.id === id ? { ...med, takenToday: !med.takenToday } : med
      )
    );
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 border-2 border-yellow-400 rounded-lg bg-black text-yellow-400 my-8">
      <h2 className="text-2xl font-bold mb-6 text-center border-b-2 border-yellow-400 pb-2">Günlük İlaçlarım</h2>

      <div className="space-y-4">
        {medications.map((med) => (
          <div
            key={med.id}
            className="flex flex-col sm:flex-row items-center justify-between p-4 border-2 border-yellow-400 rounded-xl bg-black"
          >
            <div className="flex items-center gap-4 mb-4 sm:mb-0 w-full sm:w-auto">
              <div className="p-3 border-2 border-yellow-400 rounded-full">
                <Pill size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold">{med.name}</h3>
                <p className="text-lg opacity-80">{med.dosage} - {med.frequency}</p>
              </div>
            </div>

            <button
              onClick={() => toggleTaken(med.id)}
              className={`w-full sm:w-auto flex items-center justify-center gap-2 py-4 px-6 rounded-xl border-4 text-xl font-bold transition-colors focus:outline-none focus:ring-4 focus:ring-yellow-200 ${
                med.takenToday
                  ? "border-green-500 bg-green-900/50 text-green-400"
                  : "border-yellow-400 hover:bg-yellow-400 hover:text-black"
              }`}
              aria-pressed={med.takenToday}
              aria-label={`${med.name} ilacı için alındı durumu: ${med.takenToday ? 'Alındı' : 'Alınmadı'}`}
            >
              {med.takenToday ? (
                <>
                  <Check size={28} />
                  <span>Alındı</span>
                </>
              ) : (
                <span>Alınmadı İşaretle</span>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
