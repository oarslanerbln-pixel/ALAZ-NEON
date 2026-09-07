"use client";

import { useState } from "react";
import { CheckCircle2, Clock } from "lucide-react";

type Medication = {
  id: string;
  name: string;
  dosage: string;
  time: string;
  taken: boolean;
};

export function MedicationDashboard() {
  const [meds, setMeds] = useState<Medication[]>([
    { id: "1", name: "Tansiyon İlacı", dosage: "1 Tablet", time: "08:00", taken: false },
    { id: "2", name: "Şeker İlacı", dosage: "1 Tablet", time: "13:00", taken: false },
    { id: "3", name: "Vitamin", dosage: "1 Kapsül", time: "20:00", taken: true },
  ]);

  const toggleTaken = (id: string) => {
    setMeds(meds.map(med => med.id === id ? { ...med, taken: !med.taken } : med));
  };

  return (
    <div className="w-full max-w-xl mx-auto p-4 space-y-6">
      <h2 className="text-3xl font-bold text-[#00ffff] border-b-2 border-[#00ffff] pb-2">Günlük İlaçlarınız</h2>

      <div className="space-y-4">
        {meds.map((med) => (
          <div
            key={med.id}
            className={`flex items-center justify-between p-6 rounded-2xl border-4 transition-all ${
              med.taken
                ? "border-green-500 bg-green-900/20 opacity-70"
                : "border-[#00ffff] bg-black"
            }`}
          >
            <div className="flex flex-col gap-2">
              <span className="text-2xl font-bold">{med.name}</span>
              <div className="flex items-center gap-2 text-lg text-gray-300">
                <Clock className="w-5 h-5" aria-hidden="true" />
                <span>{med.time} - {med.dosage}</span>
              </div>
            </div>

            <button
              onClick={() => toggleTaken(med.id)}
              className={`p-4 rounded-full border-4 transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400 ${
                med.taken
                  ? "border-green-500 text-green-500"
                  : "border-[#00ffff] text-[#00ffff] hover:bg-[#00ffff]/10"
              }`}
              aria-label={`${med.name} ilacını alındı olarak işaretle`}
            >
              <CheckCircle2 className="w-12 h-12" aria-hidden="true" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
