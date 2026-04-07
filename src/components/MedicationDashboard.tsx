"use client";

import { useState } from "react";
import { CheckCircle, Circle } from "lucide-react";

type MedicationSkeleton = {
  id: string;
  name: string;
  dosage: string;
  timeToTake: string;
  taken: boolean;
};

// Initial mock data
const initialMedications: MedicationSkeleton[] = [
  { id: "1", name: "Tansiyon İlacı", dosage: "1 Tablet", timeToTake: "08:00", taken: false },
  { id: "2", name: "Vitamin C", dosage: "500mg", timeToTake: "12:00", taken: false },
  { id: "3", name: "Kalp İlacı", dosage: "Yarım Tablet", timeToTake: "20:00", taken: false },
];

export default function MedicationDashboard() {
  const [medications, setMedications] = useState<MedicationSkeleton[]>(initialMedications);

  const toggleTaken = (id: string) => {
    setMedications(medications.map(med =>
      med.id === id ? { ...med, taken: !med.taken } : med
    ));
  };

  return (
    <div className="w-full max-w-2xl mx-auto my-8">
      <h2 className="text-3xl font-bold mb-6 border-b-2 border-border pb-2">Günlük İlaçlarım</h2>

      <div className="flex flex-col gap-4">
        {medications.map((med) => (
          <div
            key={med.id}
            className={`flex items-center justify-between p-4 border-2 rounded-lg ${med.taken ? 'border-primary bg-primary/10' : 'border-border bg-card'}`}
          >
            <div>
              <p className="text-2xl font-bold">{med.name}</p>
              <p className="text-lg opacity-80">{med.dosage} - Saat: {med.timeToTake}</p>
            </div>

            <button
              onClick={() => toggleTaken(med.id)}
              className={`flex items-center gap-2 px-6 py-4 rounded-md font-bold text-xl focus-ring transition-colors ${
                med.taken
                  ? 'bg-transparent text-primary border-2 border-primary'
                  : 'bg-primary text-primary-foreground'
              }`}
              aria-pressed={med.taken}
              aria-label={`${med.name} ilacını ${med.taken ? 'alınmadı' : 'alındı'} olarak işaretle`}
            >
              {med.taken ? (
                <>
                  <CheckCircle size={28} />
                  <span>Alındı</span>
                </>
              ) : (
                <>
                  <Circle size={28} />
                  <span>İşaretle</span>
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
