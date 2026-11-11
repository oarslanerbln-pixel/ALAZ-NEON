"use client";

import { useState } from "react";
import { t } from "@/lib/i18n";

interface MedicationItem {
  id: string;
  name: string;
  taken: boolean;
}

export function MedicationDashboard() {
  const [medications, setMedications] = useState<MedicationItem[]>([
    { id: "1", name: "Aspirin 100mg", taken: false },
    { id: "2", name: "Lisinopril 10mg", taken: false },
  ]);

  const toggleTaken = (id: string) => {
    setMedications((prev) =>
      prev.map((med) => (med.id === id ? { ...med, taken: !med.taken } : med))
    );
  };

  return (
    <div className="flex flex-col w-full max-w-md mx-auto p-4 border-2 border-foreground rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-center">{t("medication.title")}</h2>
      <ul className="space-y-4">
        {medications.map((med) => (
          <li
            key={med.id}
            className="flex items-center justify-between p-4 border-2 border-foreground rounded-lg"
          >
            <span
              className={`text-xl font-bold ${
                med.taken ? "line-through opacity-50" : ""
              }`}
            >
              {med.name}
            </span>
            <button
              onClick={() => toggleTaken(med.id)}
              aria-label={`${t("medication.taken")} - ${med.name}`}
              className={`px-6 py-3 font-bold text-lg rounded-full transition ${
                med.taken
                  ? "bg-transparent border-2 border-foreground text-foreground"
                  : "bg-primary text-black"
              }`}
            >
              {t("medication.taken")}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
