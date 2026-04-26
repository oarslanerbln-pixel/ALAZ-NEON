"use client";

import { useState } from "react";
import { CheckCircle, Circle } from "lucide-react";

type Medication = {
  id: string;
  name: string;
  dosage: string;
  time: string;
  taken: boolean;
};

const INITIAL_MEDICATIONS: Medication[] = [
  {
    id: "1",
    name: "Tansiyon İlacı",
    dosage: "1 Adet",
    time: "Sabah - 09:00",
    taken: false,
  },
  {
    id: "2",
    name: "Kalp Hapı",
    dosage: "Yarım Tablet",
    time: "Öğle - 13:00",
    taken: true,
  },
];

export default function MedicationDashboard() {
  const [medications, setMedications] = useState<Medication[]>(INITIAL_MEDICATIONS);

  const toggleMedication = (id: string) => {
    setMedications(prev =>
      prev.map(med =>
        med.id === id ? { ...med, taken: !med.taken } : med
      )
    );
  };

  return (
    <section className="border-4 border-yellow-400 p-6 rounded-2xl flex flex-col gap-6" aria-labelledby="medication-heading">
      <h2 id="medication-heading" className="text-3xl font-bold text-center">
        Bugünkü İlaçlarınız
      </h2>

      <div className="flex flex-col gap-4">
        {medications.map(med => (
          <div
            key={med.id}
            className={`border-4 rounded-xl p-6 flex items-center justify-between transition-colors ${
              med.taken
                ? "border-green-500 bg-green-900 text-white"
                : "border-yellow-400 bg-black text-yellow-400"
            }`}
          >
            <div className="flex flex-col gap-2">
              <span className="text-3xl font-bold">{med.name}</span>
              <span className="text-xl">
                {med.dosage} | {med.time}
              </span>
            </div>

            <button
              onClick={() => toggleMedication(med.id)}
              aria-pressed={med.taken}
              className={`p-4 rounded-full flex items-center justify-center border-4 focus-visible:outline-4 focus-visible:outline-white focus-visible:outline-offset-4 transition-transform active:scale-95 ${
                med.taken
                  ? "border-white bg-green-700 hover:bg-green-600"
                  : "border-yellow-400 bg-black hover:bg-zinc-900"
              }`}
              aria-label={`${med.name} ilacını ${med.taken ? 'alınmadı' : 'alındı'} olarak işaretle`}
            >
              {med.taken ? <CheckCircle size={48} /> : <Circle size={48} />}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
