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
  { id: "1", name: "Tansiyon İlacı", dosage: "1 Tablet", time: "Sabah Tok", taken: false },
  { id: "2", name: "Şeker İlacı", dosage: "Yarım Tablet", time: "Öğle Aç", taken: true },
  { id: "3", name: "Vitamin C", dosage: "1 Efervesan", time: "Akşam", taken: false },
];

export default function MedicationDashboard() {
  const [medications, setMedications] = useState<Medication[]>(mockMedications);

  const toggleTaken = (id: string) => {
    setMedications(medications.map(med =>
      med.id === id ? { ...med, taken: !med.taken } : med
    ));
  };

  return (
    <div className="max-w-2xl mx-auto mt-10">
      <h2 className="text-3xl font-bold mb-8 pb-4 border-b-4 border-yellow-400">Günlük İlaç Takibi</h2>

      <div className="flex flex-col gap-6">
        {medications.map((med) => (
          <div
            key={med.id}
            className="flex items-center justify-between p-6 border-4 border-yellow-400 rounded-xl bg-gray-900"
          >
            <div className="flex flex-col">
              <span className="text-3xl font-bold">{med.name}</span>
              <span className="text-xl mt-2">{med.dosage} - {med.time}</span>
            </div>

            <button
              onClick={() => toggleTaken(med.id)}
              className={`flex items-center gap-3 px-6 py-4 rounded-xl border-4 transition-colors font-bold text-2xl
                ${med.taken
                  ? "bg-[--color-interactive] text-black border-[--color-interactive]"
                  : "bg-transparent text-[--color-interactive] border-[--color-interactive] hover:bg-gray-800"
                }`}
              aria-label={`${med.name} ilacını ${med.taken ? 'alınmadı' : 'alındı'} olarak işaretle`}
              aria-pressed={med.taken}
            >
              {med.taken ? (
                <>
                  <CheckCircle2 className="w-10 h-10" />
                  Alındı
                </>
              ) : (
                <>
                  <Circle className="w-10 h-10" />
                  Alınmadı
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
