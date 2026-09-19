"use client";

import { useState } from "react";
import { CheckCircle } from "lucide-react";

export default function MedicationDashboard() {
  const [medications, setMedications] = useState([
    { id: 1, name: "Tansiyon İlacı", time: "Sabah", taken: false },
    { id: 2, name: "Kalp İlacı", time: "Akşam", taken: false }
  ]);

  const toggleTaken = (id: number) => {
    setMedications(medications.map(med =>
      med.id === id ? { ...med, taken: !med.taken } : med
    ));
  };

  return (
    <div className="p-6 border-2 border-[#ffff00] rounded-lg">
      <h2 className="text-2xl mb-4">İlaç Takibi</h2>
      <div className="flex flex-col gap-4">
        {medications.map(med => (
          <div key={med.id} className="flex justify-between items-center border-b border-[#ffff00] pb-4">
            <div>
              <div className="text-xl">{med.name}</div>
              <div className="text-base">{med.time}</div>
            </div>
            <button
              onClick={() => toggleTaken(med.id)}
              className={`border-2 border-[#00ffff] px-6 py-4 text-xl flex items-center gap-2 cursor-pointer rounded-lg ${
                med.taken ? "bg-[#00ffff] text-black" : "bg-black text-[#00ffff]"
              }`}
              aria-label={`${med.name} alındı olarak işaretle`}
            >
              <CheckCircle size={24} />
              {med.taken ? "Alındı" : "Alınmadı"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
