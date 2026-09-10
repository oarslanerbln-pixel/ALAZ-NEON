"use client";

import { useState } from "react";
import { CheckCircle2, Clock } from "lucide-react";

interface Medication {
  id: string;
  name: string;
  time: string;
  taken: boolean;
}

const mockMedications: Medication[] = [
  { id: "1", name: "Tansiyon İlacı", time: "08:00", taken: false },
  { id: "2", name: "Şeker İlacı", time: "12:00", taken: false },
  { id: "3", name: "Vitamin", time: "20:00", taken: true },
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
    <div className="w-full max-w-xl mx-auto flex flex-col gap-6">
      <h2 className="text-3xl font-bold text-center text-cyan-400 mb-2">Günlük İlaçlarınız</h2>

      <div className="flex flex-col gap-4">
        {medications.map((med, idx) => (
          <div
            key={med.id}
            className={`flex items-center justify-between p-6 rounded-2xl border-4 transition-colors ${
              med.taken
                ? "bg-green-900 border-green-400 opacity-80"
                : "bg-zinc-900 border-yellow-400"
            }`}
          >
            <div className="flex flex-col gap-2">
              <span className="text-2xl font-bold">{med.name}</span>
              <div className="flex items-center gap-2 text-xl">
                <Clock className="w-6 h-6" />
                <span>{med.time}</span>
              </div>
            </div>

            <button
              onClick={() => toggleTaken(med.id)}
              className={`flex items-center justify-center p-4 rounded-xl font-bold text-2xl transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-400 ${
                med.taken
                  ? "bg-transparent text-green-400 hover:text-green-300"
                  : "bg-cyan-400 text-black hover:bg-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.3)]"
              }`}
              aria-label={`${med.name} ilacını ${med.taken ? 'alınmadı' : 'alındı'} olarak işaretle`}
              id={`med-btn-${idx}`}
            >
              {med.taken ? (
                <>
                  <CheckCircle2 className="w-8 h-8 mr-2" />
                  Alındı
                </>
              ) : (
                "Alındı İşaretle"
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
