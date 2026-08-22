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
  { id: "1", name: "Aspirin", dosage: "100mg", time: "08:00", taken: false },
  { id: "2", name: "Tansiyon İlacı", dosage: "1 Adet", time: "09:00", taken: true },
  { id: "3", name: "Vitamin C", dosage: "1000mg", time: "12:00", taken: false },
];

export default function MedicationDashboard() {
  const [medications, setMedications] = useState<Medication[]>(mockMedications);

  const toggleMedication = (id: string) => {
    setMedications(medications.map(med =>
      med.id === id ? { ...med, taken: !med.taken } : med
    ));
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-md mx-auto p-4 border-2 border-[var(--primary)] rounded-xl mt-8">
      <h2 className="text-2xl font-bold text-center">Günlük İlaçlarım</h2>

      <div className="flex flex-col gap-4">
        {medications.map((med) => (
          <div
            key={med.id}
            role="button"
            tabIndex={0}
            onClick={() => toggleMedication(med.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleMedication(med.id);
              }
            }}
            className={`flex items-center justify-between p-6 rounded-xl border-4 cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400 ${med.taken ? 'border-green-500 bg-green-900/30 opacity-70' : 'border-[var(--primary)]'}`}
          >
            <div>
              <p className="text-xl font-bold">{med.name}</p>
              <p className="text-base">{med.dosage} - {med.time}</p>
            </div>

            <div>
              {med.taken ? (
                <CheckCircle2 size={40} className="text-green-500" />
              ) : (
                <Circle size={40} className="text-[var(--primary)]" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
