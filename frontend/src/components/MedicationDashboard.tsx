"use client";

import { useState } from "react";
import { CheckCircle, Circle } from "lucide-react";

type Medication = {
  id: string;
  name: string; // Will be decrypted on client in real app
  dosage: string;
  time: string;
  taken: boolean;
};

const MOCK_MEDICATIONS: Medication[] = [
  { id: "1", name: "Parol (Ağrı Kesici)", dosage: "1 Tablet", time: "Sabah", taken: false },
  { id: "2", name: "Tansiyon İlacı", dosage: "1 Tablet", time: "Akşam", taken: true },
];

export function MedicationDashboard() {
  const [medications, setMedications] = useState<Medication[]>(MOCK_MEDICATIONS);

  const toggleMedication = (id: string) => {
    setMedications(prev =>
      prev.map(med =>
        med.id === id ? { ...med, taken: !med.taken } : med
      )
    );
  };

  return (
    <div className="flex flex-col p-6 w-full max-w-md mx-auto space-y-6">
      <h2 className="text-4xl font-bold text-yellow-300 mb-4 border-b-4 border-yellow-300 pb-2">
        Bugünkü İlaçlarım
      </h2>

      <div className="space-y-4" role="list" aria-label="İlaç listesi">
        {medications.map((med) => (
          <div
            key={med.id}
            role="listitem"
            className="flex flex-col bg-gray-900 border-4 border-gray-700 rounded-xl p-4 transition-colors"
            style={{ borderColor: med.taken ? '#4ade80' : '#374151' }}
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-3xl font-bold text-white mb-2">{med.name}</h3>
                <p className="text-2xl text-gray-300">{med.dosage} - {med.time}</p>
              </div>
            </div>

            <button
              onClick={() => toggleMedication(med.id)}
              className={`flex items-center justify-center p-6 w-full rounded-xl font-bold text-3xl transition-all focus-visible:ring-4 focus-visible:ring-white ${
                med.taken
                  ? 'bg-green-500 text-black hover:bg-green-600'
                  : 'bg-yellow-300 text-black hover:bg-yellow-400'
              }`}
              aria-pressed={med.taken}
              aria-label={`${med.name} ilacını ${med.taken ? 'alınmadı' : 'alındı'} olarak işaretle`}
            >
              {med.taken ? (
                <>
                  <CheckCircle className="w-10 h-10 mr-4" aria-hidden="true" />
                  Alındı
                </>
              ) : (
                <>
                  <Circle className="w-10 h-10 mr-4" aria-hidden="true" />
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
