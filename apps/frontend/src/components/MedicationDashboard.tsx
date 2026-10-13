"use client";

import { useState } from "react";
import { t, SupportedLanguage } from "@/lib/i18n";

type Medication = {
  id: string;
  name: string;
  dosage: string;
  taken: boolean;
};

export function MedicationDashboard({ lang = "tr" }: { lang?: SupportedLanguage }) {
  const [meds, setMeds] = useState<Medication[]>([
    { id: "1", name: "Parol", dosage: "500mg - Sabah", taken: false },
    { id: "2", name: "Tansiyon İlacı", dosage: "1 Adet - Akşam", taken: true },
  ]);

  const toggleTaken = (id: string) => {
    setMeds(meds.map(m => m.id === id ? { ...m, taken: !m.taken } : m));
  };

  return (
    <div className="flex flex-col gap-6 p-6 border-2 border-interactive rounded-xl bg-gray-900 w-full max-w-md mx-auto mt-8">
      <h2 className="text-2xl font-bold border-b-2 border-interactive pb-2">{t("medication.title", lang)}</h2>

      <div className="flex flex-col gap-4">
        {meds.map((med) => (
          <div key={med.id} className="flex justify-between items-center p-4 bg-black rounded-lg border border-gray-700">
            <div>
              <p className="text-xl font-bold text-yellow-300">{med.name}</p>
              <p className="text-lg">{med.dosage}</p>
            </div>

            <button
              onClick={() => toggleTaken(med.id)}
              className={`px-6 py-3 rounded-xl font-bold text-lg transition-colors ${
                med.taken
                  ? "bg-green-600 text-white hover:bg-green-500"
                  : "bg-interactive text-black hover:bg-cyan-300"
              }`}
              aria-label={`${med.name} ilacını ${med.taken ? "alındı" : "alınmadı"} olarak işaretle`}
            >
              {med.taken ? t("medication.taken", lang) : t("medication.notTaken", lang)}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
