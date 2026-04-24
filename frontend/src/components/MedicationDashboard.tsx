"use client";

import { useState } from "react";
import { CheckCircle, Circle } from "lucide-react";

type Medication = {
  id: string;
  name: string; // Decrypted name for UI display
  dose: string; // Decrypted dose for UI display
  time: string;
  taken: boolean;
};

// Mock data (would be fetched and decrypted from backend)
const initialMedications: Medication[] = [
  { id: "1", name: "Tansiyon İlacı", dose: "1 Adet", time: "Sabah", taken: false },
  { id: "2", name: "Şeker Hapı", dose: "1 Adet", time: "Öğle", taken: false },
  { id: "3", name: "Kalp İlacı", dose: "Yarım Adet", time: "Akşam", taken: true },
];

export default function MedicationDashboard() {
  const [medications, setMedications] = useState<Medication[]>(initialMedications);

  const toggleMedication = (id: string) => {
    setMedications(prev =>
      prev.map(med =>
        med.id === id ? { ...med, taken: !med.taken } : med
      )
    );
  };

  return (
    <section className="w-full max-w-2xl mx-auto flex flex-col gap-6 mt-8">
      <div className="flex justify-between items-end border-b-2 border-yellow-700 pb-2">
        <h2 className="text-2xl font-bold">Bugünkü İlaçlarım</h2>
        <span className="text-lg font-medium bg-gray-900 px-3 py-1 rounded-full border border-yellow-800">
          {new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long' })}
        </span>
      </div>

      <div className="flex flex-col gap-4">
        {medications.map(med => (
          <div
            key={med.id}
            role="button"
            tabIndex={0}
            aria-pressed={med.taken}
            onClick={() => toggleMedication(med.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleMedication(med.id);
              }
            }}
            className={`
              flex items-center justify-between p-6 rounded-xl border-2 transition-all cursor-pointer focus-within:ring-4 focus-within:ring-yellow-400
              ${med.taken
                ? 'bg-green-950 border-green-500 opacity-80'
                : 'bg-gray-900 border-yellow-600 hover:border-yellow-400'
              }
            `}
          >
            <div className="flex flex-col gap-1">
              <span className="text-2xl font-bold">{med.name}</span>
              <span className="text-lg text-gray-300">{med.dose} • {med.time}</span>
            </div>

            <div className="flex-shrink-0 ml-4">
              {med.taken ? (
                <div className="flex items-center gap-2 text-green-500">
                  <span className="text-xl font-bold hidden sm:inline">Alındı</span>
                  <CheckCircle className="w-12 h-12" />
                </div>
              ) : (
                <div className="flex items-center gap-2 text-yellow-500">
                  <span className="text-xl font-bold hidden sm:inline">Bekliyor</span>
                  <Circle className="w-12 h-12" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
