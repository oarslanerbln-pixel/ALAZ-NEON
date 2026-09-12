"use client";

import { useState } from "react";
import { CheckCircle, Circle } from "lucide-react";

type Medication = {
  id: string;
  name: string;
  time: string;
  taken: boolean;
};

export function MedicineDashboard() {
  const [meds, setMeds] = useState<Medication[]>([
    { id: "1", name: "Tansiyon İlacı", time: "Sabah", taken: false },
    { id: "2", name: "Diyabet İlacı", time: "Öğle", taken: false },
    { id: "3", name: "Vitamin", time: "Akşam", taken: true },
  ]);

  const toggleMed = (id: string) => {
    setMeds(meds.map(med => med.id === id ? { ...med, taken: !med.taken } : med));
  };

  return (
    <div className="w-full max-w-md mx-auto my-8">
      <h2 className="text-2xl font-bold text-[#ffff00] mb-6 text-center">Günlük İlaç Takibi</h2>
      <div className="flex flex-col gap-4">
        {meds.map((med, idx) => (
          <button
            key={med.id}
            onClick={() => toggleMed(med.id)}
            id={`med-btn-${idx}`}
            className={`w-full flex items-center justify-between p-6 rounded-xl border-4 high-contrast-focus transition-all duration-300 ${
              med.taken
                ? "bg-[#00ffff] border-[#00ffff] text-black"
                : "bg-black border-[#00ffff] text-[#ffff00]"
            }`}
            aria-label={`${med.name} - ${med.time}. Durum: ${med.taken ? 'Alındı' : 'Alınmadı'}`}
          >
            <div className="flex flex-col items-start">
              <span className="text-2xl font-bold">{med.name}</span>
              <span className={`text-lg font-semibold ${med.taken ? 'text-black' : 'text-[#00ffff]'}`}>
                {med.time}
              </span>
            </div>
            <div>
              {med.taken ? (
                <CheckCircle size={48} className="text-black" />
              ) : (
                <Circle size={48} className="text-[#00ffff]" />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
