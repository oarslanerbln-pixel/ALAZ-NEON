"use client";

import { useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";

type Medication = {
  id: string;
  name: string;
  time: string;
  taken: boolean;
};

export default function MedicationDashboard() {
  const [medications, setMedications] = useState<Medication[]>([
    { id: "1", name: "Tansiyon İlacı (Amlodipin)", time: "Sabah 08:00", taken: false },
    { id: "2", name: "Şeker İlacı (Metformin)", time: "Akşam 20:00", taken: true },
  ]);

  const toggleMedication = (id: string) => {
    setMedications(medications.map(med =>
      med.id === id ? { ...med, taken: !med.taken } : med
    ));
  };

  return (
    <div className="flex flex-col p-6 border-4 border-yellow-400 rounded-2xl bg-black max-w-xl mx-auto w-full my-8">
      <h2 className="text-3xl font-bold text-cyan-400 mb-8 border-b-2 border-cyan-400 pb-4">Günlük İlaç Takibi</h2>

      <div className="flex flex-col gap-6">
        {medications.map((med) => (
          <div
            key={med.id}
            className={`flex items-center justify-between p-6 rounded-xl border-4 transition-colors ${
              med.taken
                ? "border-green-500 bg-green-900/30"
                : "border-cyan-400 bg-black"
            }`}
          >
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-yellow-400">{med.name}</span>
              <span className="text-xl text-cyan-200 mt-2">{med.time}</span>
            </div>

            <button
              onClick={() => toggleMedication(med.id)}
              className={`flex flex-col items-center justify-center p-4 rounded-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400 min-w-[120px] ${
                med.taken
                  ? "text-green-400 hover:text-green-300"
                  : "text-cyan-400 hover:text-cyan-300"
              }`}
              aria-label={`${med.name} ilacını ${med.taken ? 'alınmadı' : 'alındı'} olarak işaretle`}
            >
              {med.taken ? (
                <>
                  <CheckCircle2 size={48} className="mb-2" />
                  <span className="text-xl font-bold">Alındı</span>
                </>
              ) : (
                <>
                  <Circle size={48} className="mb-2" />
                  <span className="text-xl font-bold">Alınmadı</span>
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
