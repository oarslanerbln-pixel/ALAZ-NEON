"use client";

import { useState } from "react";
import { Check } from "lucide-react";

type Medication = {
  id: string;
  name: string;
  dosage: string;
  time: string;
  taken: boolean;
};

export default function MedicationDashboard() {
  const [medications, setMedications] = useState<Medication[]>([
    { id: "1", name: "Tansiyon İlacı", dosage: "1 Tablet", time: "Sabah", taken: false },
    { id: "2", name: "Kalp İlacı", dosage: "Yarım Tablet", time: "Akşam", taken: true },
  ]);

  const toggleTaken = (id: string) => {
    setMedications(meds =>
      meds.map(m => m.id === id ? { ...m, taken: !m.taken } : m)
    );
  };

  return (
    <div className="w-full max-w-md mt-8">
      <h2 className="text-2xl font-bold mb-4 border-b-2 border-[#00ffff] pb-2">Bugünkü İlaçlarım</h2>

      <div className="space-y-4">
        {medications.map(med => (
          <div key={med.id} className="border-2 border-[#00ffff] p-4 rounded-lg flex items-center justify-between">
            <div>
              <p className="font-bold text-xl">{med.name}</p>
              <p className="text-lg">{med.dosage} - {med.time}</p>
            </div>
            <button
              onClick={() => toggleTaken(med.id)}
              className={`p-4 rounded-full border-2 border-[#00ffff] flex items-center justify-center transition-colors ${med.taken ? 'bg-[#00ffff] text-black' : 'bg-black text-[#00ffff]'}`}
              aria-label={`${med.name} alındı işaretle`}
            >
              {med.taken ? <Check size={32} /> : <span className="w-8 h-8 block"></span>}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
