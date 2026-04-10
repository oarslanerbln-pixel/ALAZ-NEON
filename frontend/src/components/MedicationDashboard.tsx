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

export default function MedicationDashboard() {
  const [medications, setMedications] = useState<Medication[]>([
    { id: "1", name: "Tansiyon İlacı", dosage: "1 Tablet", time: "Sabah (08:00)", taken: false },
    { id: "2", name: "Kalp İlacı", dosage: "Yarım Tablet", time: "Öğle (13:00)", taken: true },
    { id: "3", name: "D Vitamini", dosage: "1 Damla", time: "Akşam (20:00)", taken: false },
  ]);

  const toggleTaken = (id: string) => {
    setMedications(meds =>
      meds.map(med => med.id === id ? { ...med, taken: !med.taken } : med)
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <p className="text-xl">Günlük ilaçlarınızı aldığınızda yanlarındaki büyük butona basarak işaretleyin.</p>

      <ul className="flex flex-col gap-4">
        {medications.map((med) => (
          <li key={med.id}>
            <button
              onClick={() => toggleTaken(med.id)}
              className={`w-full flex items-center justify-between p-6 border-4 rounded-xl focus-ring transition-colors ${
                med.taken
                  ? "border-green-500 bg-green-950 text-green-300"
                  : "border-cyan-400 bg-black hover:bg-gray-900"
              }`}
              aria-pressed={med.taken}
            >
              <div className="flex flex-col items-start text-left gap-2">
                <span className="text-2xl font-bold">{med.name}</span>
                <span className="text-xl">{med.dosage} - {med.time}</span>
              </div>

              <div className="flex items-center gap-3 ml-4 shrink-0">
                {med.taken ? (
                  <>
                    <span className="text-2xl font-bold hidden sm:inline">ALINDI</span>
                    <CheckCircle2 size={48} className="text-green-400" aria-hidden="true" />
                  </>
                ) : (
                  <>
                    <span className="text-2xl font-bold text-cyan-400 hidden sm:inline">ALINMADI</span>
                    <Circle size={48} className="text-cyan-400" aria-hidden="true" />
                  </>
                )}
              </div>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
