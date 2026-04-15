"use client";

import { useState } from "react";
import { Check, Clock, Pill } from "lucide-react";

type Medication = {
  id: string;
  name: string;
  dosage: string;
  time: string;
  taken: boolean;
};

export default function MedicationDashboard() {
  const [medications, setMedications] = useState<Medication[]>([
    { id: "1", name: "Parol", dosage: "500mg - 1 Tablet", time: "08:00", taken: false },
    { id: "2", name: "Tansiyon İlacı", dosage: "10mg", time: "09:00", taken: true },
    { id: "3", name: "Vitamin D", dosage: "1 Damla", time: "12:00", taken: false },
  ]);

  const toggleTaken = (id: string) => {
    setMedications(meds =>
      meds.map(med =>
        med.id === id ? { ...med, taken: !med.taken } : med
      )
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-8">
      <h2 className="text-3xl font-bold mb-6 border-b-4 border-black pb-2 flex items-center gap-3">
        <Pill className="w-8 h-8" />
        Günlük İlaçlarım
      </h2>

      <div className="flex flex-col gap-4">
        {medications.map((med) => (
          <div
            key={med.id}
            className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 border-4 border-black rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-colors ${
              med.taken ? 'bg-gray-200' : 'bg-white'
            }`}
          >
            <div className="flex-1 mb-4 sm:mb-0">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-6 h-6 font-bold" />
                <span className="text-2xl font-bold">{med.time}</span>
              </div>
              <h3 className={`text-2xl font-bold ${med.taken ? 'line-through text-gray-600' : ''}`}>
                {med.name}
              </h3>
              <p className="text-lg font-bold text-gray-700">{med.dosage}</p>
            </div>

            <button
              onClick={() => toggleTaken(med.id)}
              className={`w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 text-xl font-bold rounded-lg border-4 border-black focus:ring-4 focus:ring-black focus:outline-none transition-transform active:scale-95 ${
                med.taken
                  ? 'bg-green-500 text-black hover:bg-green-600'
                  : 'bg-yellow-400 text-black hover:bg-yellow-500'
              }`}
              aria-pressed={med.taken}
              aria-label={`${med.name} ilacı ${med.taken ? 'alındı işaretini kaldır' : 'alındı olarak işaretle'}`}
            >
              {med.taken ? (
                <>
                  <Check className="w-8 h-8" />
                  Alındı
                </>
              ) : (
                "Alınmadı"
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
