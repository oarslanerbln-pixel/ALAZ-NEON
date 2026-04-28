"use client";

import { useState } from "react";
import { CheckCircle, Circle } from "lucide-react";

type Medication = {
  id: string;
  name: string;
  time: string;
  taken: boolean;
};

export default function MedicationDashboard() {
  const [medications, setMedications] = useState<Medication[]>([
    { id: "1", name: "Tansiyon İlacı", time: "Sabah", taken: false },
    { id: "2", name: "Diyabet İlacı", time: "Akşam", taken: false },
  ]);

  const toggleMedication = (id: string) => {
    setMedications(medications.map(med =>
      med.id === id ? { ...med, taken: !med.taken } : med
    ));
  };

  return (
    <section className="border-4 border-yellow-400 p-6 rounded-xl bg-neutral-900">
      <h2 className="text-2xl font-bold mb-6 text-center underline decoration-4 underline-offset-4">Günlük İlaçlarım</h2>

      <div className="space-y-4">
        {medications.map((med) => (
          <button
            key={med.id}
            onClick={() => toggleMedication(med.id)}
            aria-pressed={med.taken}
            className={`w-full flex items-center justify-between p-6 border-4 rounded-xl transition-colors focus:outline-none focus:ring-4 focus:ring-white focus:ring-offset-4 focus:ring-offset-black ${
              med.taken
                ? "bg-yellow-400 text-black border-yellow-400"
                : "bg-transparent text-yellow-400 border-yellow-400 hover:bg-neutral-800"
            }`}
          >
            <div className="flex flex-col items-start">
              <span className="text-2xl font-bold">{med.name}</span>
              <span className="text-lg font-medium opacity-90">{med.time}</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xl font-bold hidden sm:inline-block">
                {med.taken ? "Alındı" : "Alınmadı"}
              </span>
              {med.taken ? (
                <CheckCircle className="w-10 h-10" aria-hidden="true" />
              ) : (
                <Circle className="w-10 h-10" aria-hidden="true" />
              )}
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}
