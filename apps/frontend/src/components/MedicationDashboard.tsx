"use client";

import { useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";

type Medication = {
  id: string;
  name: string;
  dosage: string;
  time: string;
  taken: boolean;
};

const initialMedications: Medication[] = [
  { id: "1", name: "Tansiyon İlacı", dosage: "1 Tablet", time: "08:00", taken: false },
  { id: "2", name: "Kalp Hapı", dosage: "1/2 Tablet", time: "12:00", taken: true },
  { id: "3", name: "Şeker İlacı", dosage: "1 Tablet", time: "20:00", taken: false },
];

export default function MedicationDashboard() {
  const [medications, setMedications] = useState<Medication[]>(initialMedications);

  const toggleMedication = (id: string) => {
    setMedications(medications.map(med =>
      med.id === id ? { ...med, taken: !med.taken } : med
    ));
  };

  return (
    <section className="border-4 border-interactive p-6 rounded-lg my-6" aria-labelledby="medications-heading">
      <h2 id="medications-heading" className="text-2xl font-bold mb-6">Günlük İlaçlarım</h2>

      <div className="space-y-4">
        {medications.map((med) => (
          <div
            key={med.id}
            className={`flex flex-col sm:flex-row justify-between items-center p-6 border-4 rounded-lg transition-colors ${
              med.taken
                ? "border-interactive bg-interactive text-background"
                : "border-interactive bg-background text-foreground"
            }`}
          >
            <div className="flex-1 mb-4 sm:mb-0">
              <h3 className="text-2xl font-bold">{med.name}</h3>
              <p className="text-xl">
                {med.dosage} - Saat: {med.time}
              </p>
            </div>

            <button
              onClick={() => toggleMedication(med.id)}
              className={`flex items-center gap-3 px-8 py-4 rounded-lg font-bold text-xl border-4 ${
                med.taken
                  ? "border-background bg-background text-foreground hover:bg-foreground hover:text-background hover:border-foreground"
                  : "border-interactive bg-interactive text-background hover:bg-background hover:text-interactive"
              } transition-colors focus-visible:ring-4 focus-visible:ring-offset-4 focus-visible:ring-interactive`}
              aria-pressed={med.taken}
              aria-label={`${med.name} ilacını ${med.taken ? 'alınmadı' : 'alındı'} olarak işaretle`}
            >
              {med.taken ? <CheckCircle2 size={32} /> : <Circle size={32} />}
              <span>{med.taken ? "Alındı" : "Alınmadı"}</span>
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
