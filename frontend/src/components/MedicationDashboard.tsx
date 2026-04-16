"use client";

import { useState } from "react";
import { Check, Clock } from "lucide-react";

type Medication = {
  id: string;
  name: string;
  time: string;
  taken: boolean;
};

export default function MedicationDashboard() {
  const [medications, setMedications] = useState<Medication[]>([
    { id: "1", name: "Tansiyon İlacı", time: "09:00", taken: false },
    { id: "2", name: "Diyabet İlacı", time: "13:00", taken: true },
    { id: "3", name: "Kalp Hapı", time: "20:00", taken: false },
  ]);

  const toggleTaken = (id: string) => {
    setMedications((prev) =>
      prev.map((med) => (med.id === id ? { ...med, taken: !med.taken } : med))
    );
  };

  return (
    <section
      className="w-full"
      aria-labelledby="medication-heading"
    >
      <h2 id="medication-heading" className="text-2xl font-bold mb-6 border-b-2 border-gray-700 pb-2 text-white">
        Bugünkü İlaçlarım
      </h2>

      <div className="flex flex-col gap-4">
        {medications.map((med) => (
          <div
            key={med.id}
            className={`flex flex-col sm:flex-row items-center justify-between p-6 rounded-xl border-4 transition-colors ${
              med.taken
                ? "bg-green-900/20 border-green-700 opacity-80"
                : "bg-gray-800 border-gray-600"
            }`}
          >
            <div className="flex-1 flex flex-col items-center sm:items-start w-full mb-4 sm:mb-0">
              <h3 className={`text-3xl font-bold mb-2 ${med.taken ? "text-gray-400 line-through" : "text-white"}`}>
                {med.name}
              </h3>
              <div className="flex items-center text-xl text-yellow-400 font-bold bg-black/50 px-4 py-2 rounded-lg">
                <Clock size={24} className="mr-2" aria-hidden="true" />
                <span>{med.time}</span>
              </div>
            </div>

            <button
              onClick={() => toggleTaken(med.id)}
              aria-pressed={med.taken}
              aria-label={`${med.name} adlı ilacı ${med.time} saatinde ${med.taken ? "almadım" : "aldım"} olarak işaretle`}
              className={`w-full sm:w-auto min-h-[80px] min-w-[160px] flex items-center justify-center px-8 py-4 rounded-xl font-bold text-2xl focus-ring transition-transform active:scale-95 ${
                med.taken
                  ? "bg-gray-700 text-gray-300 hover:bg-gray-600 border-2 border-gray-500"
                  : "bg-green-600 text-white hover:bg-green-500 border-2 border-green-400 shadow-[0_0_15px_rgba(34,197,94,0.5)]"
              }`}
            >
              {med.taken ? (
                <>
                  <Check size={32} className="mr-2" aria-hidden="true" />
                  Alındı
                </>
              ) : (
                "Almadım"
              )}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}
