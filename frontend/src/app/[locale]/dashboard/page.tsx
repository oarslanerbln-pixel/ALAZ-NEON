"use client";

import { useState } from "react";
import { CheckCircle2, Circle } from "lucide-react";

type Medication = {
  id: string;
  name: string;
  dosage: string;
  timeOfDay: string;
  taken: boolean;
};

const MOCK_MEDICATIONS: Medication[] = [
  { id: "1", name: "Parol", dosage: "500mg", timeOfDay: "Sabah tok karnına", taken: false },
  { id: "2", name: "Tansiyon İlacı", dosage: "10mg", timeOfDay: "Sabah aç karnına", taken: true },
  { id: "3", name: "Vitamin D", dosage: "1 damla", timeOfDay: "Öğlen", taken: false },
];

export default function DashboardPage() {
  const [medications, setMedications] = useState<Medication[]>(MOCK_MEDICATIONS);

  const toggleTaken = (id: string) => {
    setMedications(prev =>
      prev.map(med => (med.id === id ? { ...med, taken: !med.taken } : med))
    );
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-4xl font-extrabold mb-8 text-yellow-400 border-b-2 border-gray-800 pb-4">
        Günlük İlaç Takibi
      </h1>

      <ul className="space-y-6">
        {medications.map(med => (
          <li
            key={med.id}
            className={`flex items-center justify-between p-6 rounded-2xl border-4 transition-colors ${
              med.taken ? "bg-green-900 border-green-500" : "bg-gray-900 border-yellow-400"
            }`}
          >
            <div className="flex flex-col">
              <span className="text-3xl font-bold mb-2" style={{ textDecoration: med.taken ? 'line-through' : 'none' }}>
                {med.name}
              </span>
              <span className="text-xl font-medium text-gray-300">
                {med.dosage} - {med.timeOfDay}
              </span>
            </div>

            <button
              onClick={() => toggleTaken(med.id)}
              aria-pressed={med.taken}
              aria-label={`${med.name} ilacını ${med.taken ? 'alınmadı' : 'alındı'} olarak işaretle`}
              className={`flex items-center justify-center p-4 rounded-xl focus:outline-none focus:ring-4 focus:ring-white transition-all ${
                med.taken ? "bg-green-500 text-black hover:bg-green-400" : "bg-yellow-400 text-black hover:bg-yellow-300"
              }`}
            >
              {med.taken ? (
                <>
                  <CheckCircle2 className="w-10 h-10 mr-3" aria-hidden="true" />
                  <span className="text-2xl font-bold">Alındı</span>
                </>
              ) : (
                <>
                  <Circle className="w-10 h-10 mr-3" aria-hidden="true" />
                  <span className="text-2xl font-bold">Bekliyor</span>
                </>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
