"use client";

import { useState } from "react";
import { t } from "@/lib/i18n";

type Medication = {
  id: string;
  name: string;
  dosage: string;
  time: string;
  taken: boolean;
};

export default function MedicationDashboard() {
  const [medications, setMedications] = useState<Medication[]>([
    { id: "1", name: "Aspirin", dosage: "100mg", time: "Sabah", taken: false },
    { id: "2", name: "Metformin", dosage: "500mg", time: "Akşam", taken: false },
  ]);

  const toggleTaken = (id: string) => {
    setMedications(prev =>
      prev.map(med => med.id === id ? { ...med, taken: !med.taken } : med)
    );
  };

  return (
    <div className="flex flex-col gap-4 border-4 border-[#00ffff] p-6 rounded-xl">
      <h2 className="text-3xl font-bold mb-4">Günlük İlaçlarınız</h2>

      {medications.map(med => (
        <div key={med.id} className="flex flex-col sm:flex-row items-center justify-between p-4 border-2 border-[#ffff00] rounded-lg gap-4">
          <div className="flex flex-col text-center sm:text-left">
            <span className="text-2xl font-bold">{med.name}</span>
            <span className="text-xl">{med.dosage} - {med.time}</span>
          </div>
          <button
            onClick={() => toggleTaken(med.id)}
            className={`px-8 py-4 text-2xl font-bold rounded-lg border-2 w-full sm:w-auto transition-colors focus-visible:ring-4 focus-visible:ring-[#00ffff] outline-none ${med.taken ? "bg-[#00ffff] text-[#000000] border-[#00ffff]" : "bg-transparent text-[#00ffff] border-[#00ffff] hover:bg-[#00ffff] hover:text-[#000000]"}`}
            aria-label={`${med.name} için ${t("taken")}`}
          >
            {med.taken ? t("taken") : "Alınmadı"}
          </button>
        </div>
      ))}
    </div>
  );
}
