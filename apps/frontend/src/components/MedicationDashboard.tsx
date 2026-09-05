"use client";

import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2, Pill } from "lucide-react";

type Medication = {
  id: string;
  name: string;
  dosage: string;
  time: string;
  taken: boolean;
};

export default function MedicationDashboard() {
  const { t } = useTranslation();

  const [medications, setMedications] = useState<Medication[]>([
    { id: "1", name: "Parol", dosage: "1 Tablet", time: "Sabah tok", taken: false },
    { id: "2", name: "Tansiyon İlacı", dosage: "1 Tablet", time: "Akşam aç", taken: false },
  ]);

  const toggleTaken = (id: string) => {
    setMedications(meds =>
      meds.map(med => med.id === id ? { ...med, taken: !med.taken } : med)
    );
  };

  return (
    <div className="p-6 border-4 border-interactive rounded-xl bg-background my-8">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Pill size={32} color="var(--color-interactive)" aria-hidden="true" />
        Bugün Alınacak İlaçlar
      </h2>

      <div className="space-y-4">
        {medications.map(med => (
          <div
            key={med.id}
            className={`p-4 border-4 rounded-xl flex items-center justify-between transition-colors ${
              med.taken
                ? "border-green-500 bg-green-900 bg-opacity-20 opacity-80"
                : "border-interactive"
            }`}
          >
            <div>
              <h3 className="text-2xl font-bold">{med.name}</h3>
              <p className="text-xl">{med.dosage} - {med.time}</p>
            </div>

            <button
              onClick={() => toggleTaken(med.id)}
              className={`p-4 font-bold text-xl rounded-xl border-4 focus:outline-none focus:ring-4 focus:ring-white transition-colors flex items-center gap-2 ${
                med.taken
                  ? "bg-green-500 text-black border-green-500"
                  : "bg-interactive text-black border-interactive hover:bg-black hover:text-interactive"
              }`}
              aria-pressed={med.taken}
              aria-label={`${med.name} ilacını ${med.taken ? "alınmadı" : "alındı"} olarak işaretle`}
            >
              {med.taken ? (
                <>
                  <CheckCircle2 size={32} aria-hidden="true" />
                  {t("taken")}
                </>
              ) : (
                "Alınmadı"
              )}
            </button>
          </div>
        ))}
        {medications.length === 0 && (
          <p className="text-xl font-bold text-center py-8 border-4 border-dashed border-interactive rounded-xl">
            Bugün alınacak ilaç bulunmuyor.
          </p>
        )}
      </div>
    </div>
  );
}
