"use client";
import { useState } from "react";

interface Medication {
  id: number;
  name: string;
  taken: boolean;
}

export default function MedicationDashboard() {
  const [medications, setMedications] = useState<Medication[]>([
    { id: 1, name: "Tansiyon İlacı", taken: false },
    { id: 2, name: "Kalp İlacı", taken: true },
  ]);

  const toggleMedication = (id: number) => {
    setMedications(meds => meds.map(med =>
      med.id === id ? { ...med, taken: !med.taken } : med
    ));
  };

  return (
    <div className="p-6 border-4 border-[#00ffff] rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Günlük İlaçlarım</h2>
      <div className="flex flex-col gap-4">
        {medications.map((med) => (
          <div key={med.id} className="flex justify-between items-center p-4 border-2 border-[#00ffff] rounded">
            <span className="text-xl font-bold">{med.name}</span>
            <button
              onClick={() => toggleMedication(med.id)}
              className={`px-6 py-3 text-lg font-bold rounded ${
                med.taken
                  ? "bg-black text-[#00ffff] border-2 border-[#00ffff]"
                  : "bg-[#00ffff] text-black"
              }`}
            >
              {med.taken ? "Alındı" : "Alınmadı"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
