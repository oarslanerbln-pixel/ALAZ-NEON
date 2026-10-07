"use client";

import { useState } from "react";
import { CheckCircle } from "lucide-react";
import { t, type Locale } from "@/lib/i18n";

const INITIAL_MEDS = [
  { id: 1, name: "Tansiyon İlacı (Sabah)", taken: false },
  { id: 2, name: "Kalp İlacı (Öğle)", taken: false },
  { id: 3, name: "Şeker İlacı (Akşam)", taken: false },
];

export default function MedicationDashboard({ locale = "tr" }: { locale?: Locale }) {
  const [meds, setMeds] = useState(INITIAL_MEDS);

  const toggleMed = (id: number) => {
    setMeds((prev) =>
      prev.map((med) => (med.id === id ? { ...med, taken: !med.taken } : med))
    );
  };

  return (
    <div className="p-6 border-4 border-yellow-400 rounded-lg bg-black text-yellow-400 mt-8">
      <h2 className="text-3xl font-bold mb-6 text-center">{t("medicationTitle", locale)}</h2>

      <div className="flex flex-col gap-4">
        {meds.map((med) => (
          <div
            key={med.id}
            className="flex items-center justify-between p-4 border-2 border-yellow-400 rounded-lg"
          >
            <span className="text-2xl font-bold">{med.name}</span>
            <button
              onClick={() => toggleMed(med.id)}
              className={`flex items-center gap-2 px-6 py-3 text-xl font-bold rounded-lg transition-colors ${
                med.taken
                  ? "bg-green-500 text-black"
                  : "bg-cyan-400 text-black hover:bg-cyan-300"
              }`}
              aria-label={`${med.name} - ${med.taken ? "Alındı" : "Alınmadı"}`}
            >
              {med.taken && <CheckCircle size={24} />}
              {med.taken ? t("medicationTaken", locale) : "Al"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
