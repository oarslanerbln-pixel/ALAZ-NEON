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
  {
    id: "1",
    name: "Tansiyon İlacı",
    dosage: "1 Tablet",
    time: "Sabah 08:00",
    taken: false,
  },
  {
    id: "2",
    name: "Şeker İlacı",
    dosage: "Yarım Tablet",
    time: "Öğle 12:00",
    taken: true,
  },
];

export default function MedicationDashboard() {
  const [medications, setMedications] = useState<Medication[]>(mockMedications);

  const toggleTaken = (id: string) => {
    setMedications((prev) =>
      prev.map((med) =>
        med.id === id ? { ...med, taken: !med.taken } : med
      )
    );
  };

  return (
    <div className="w-full">
      <h2 className="text-2xl font-bold mb-6 border-b-2 border-yellow-400 pb-2">
        Günlük İlaç Takibi
      </h2>

      <div className="space-y-4">
        {medications.map((med) => (
          <div
            key={med.id}
            className="flex items-center justify-between p-6 bg-neutral-900 border-2 border-yellow-400 rounded-xl"
          >
            <div>
              <h3 className="text-xl font-bold text-white mb-1">{med.name}</h3>
              <p className="text-lg text-yellow-200">
                {med.dosage} - {med.time}
              </p>
            </div>

            <button
              onClick={() => toggleTaken(med.id)}
              aria-pressed={med.taken}
              className={`flex items-center gap-3 px-6 py-4 rounded-lg font-bold text-lg transition-colors focus-visible:ring-4 focus-visible:ring-white ${
                med.taken
                  ? "bg-green-600 text-white border-2 border-green-400"
                  : "bg-transparent text-yellow-400 border-2 border-yellow-400 hover:bg-yellow-400/20"
              }`}
            >
              {med.taken ? (
                <>
                  <CheckCircle2 size={28} aria-hidden="true" />
                  <span>Alındı</span>
                </>
              ) : (
                <>
                  <Circle size={28} aria-hidden="true" />
                  <span>Alınmadı</span>
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
