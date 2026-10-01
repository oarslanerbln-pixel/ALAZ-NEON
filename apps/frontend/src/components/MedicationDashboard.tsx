"use client";

import { useState } from "react";
import { getTranslations, Locale } from "../lib/i18n";

interface Props {
  locale: Locale;
}

interface Medication {
  id: number;
  name: string;
  dosage: string;
  taken: boolean;
}

export default function MedicationDashboard({ locale }: Props) {
  const t = getTranslations(locale);
  const [medications, setMedications] = useState<Medication[]>([
    { id: 1, name: "Tansiyon İlacı", dosage: "Sabah 1 Tok", taken: false },
    { id: 2, name: "Kalp İlacı", dosage: "Akşam 1 Aç", taken: false },
  ]);

  const handleTakeMedication = (id: number) => {
    setMedications((prev) =>
      prev.map((med) => (med.id === id ? { ...med, taken: true } : med))
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: number) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleTakeMedication(id);
    }
  };

  return (
    <div className="flex flex-col p-4 w-full max-w-lg mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">{t.medication_title}</h2>

      <div className="flex flex-col gap-4">
        {medications.map((med) => (
          <div
            key={med.id}
            className="flex flex-col sm:flex-row justify-between items-center p-4 border-4 border-current rounded-xl"
          >
            <div className="mb-4 sm:mb-0 text-center sm:text-left">
              <h3 className="text-xl font-bold">{med.name}</h3>
              <p className="text-lg">{med.dosage}</p>
            </div>

            <button
              onClick={() => handleTakeMedication(med.id)}
              onKeyDown={(e) => handleKeyDown(e, med.id)}
              disabled={med.taken}
              className={`px-8 py-4 text-xl font-bold rounded-lg focus-visible:ring-4 focus-visible:ring-offset-4 focus-visible:ring-white transition-opacity ${
                med.taken ? "opacity-50 cursor-not-allowed" : "hover:opacity-90"
              }`}
              aria-label={`${t.medication_taken} - ${med.name}`}
            >
              {med.taken ? `✓ ${t.medication_taken}` : t.medication_taken}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
