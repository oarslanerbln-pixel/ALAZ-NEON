"use client";

import { useState } from "react";
import { CheckCircle, Clock } from "lucide-react";
import { t, type Locale } from "@/lib/i18n";

type Medication = {
  id: string;
  name: string;
  time: string;
  taken: boolean;
};

const initialMedications: Medication[] = [
  { id: "1", name: "Tansiyon İlacı", time: "08:00", taken: false },
  { id: "2", name: "Kalp İlacı", time: "12:00", taken: true },
  { id: "3", name: "Şeker İlacı", time: "20:00", taken: false },
];

export default function MedicationDashboard({ locale = "tr" }: { locale?: Locale }) {
  const [medications, setMedications] = useState<Medication[]>(initialMedications);

  const toggleTaken = (id: string) => {
    setMedications(medications.map(med =>
      med.id === id ? { ...med, taken: !med.taken } : med
    ));
  };

  return (
    <div className="flex flex-col p-6 bg-black border-2 border-cyan-400 rounded-xl max-w-md w-full mx-auto my-8">
      <h2 className="text-3xl font-bold text-yellow-300 mb-6 text-center border-b-2 border-cyan-400 pb-4">
        {t("medication_dashboard", locale)}
      </h2>

      <div className="space-y-6">
        {medications.map((med) => (
          <div
            key={med.id}
            className="flex items-center justify-between p-4 border-2 border-cyan-400 rounded-lg bg-gray-900"
          >
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-yellow-300">{med.name}</span>
              <div className="flex items-center text-cyan-400 mt-1">
                <Clock size={20} className="mr-2" />
                <span className="text-lg font-semibold">{med.time}</span>
              </div>
            </div>

            <button
              onClick={() => toggleTaken(med.id)}
              className={`flex items-center justify-center px-6 py-4 rounded-lg font-bold text-xl transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-400 ${
                med.taken
                  ? "bg-green-700 text-white border-2 border-green-400"
                  : "bg-cyan-700 text-yellow-300 border-2 border-cyan-400 hover:bg-cyan-600"
              }`}
              aria-label={`${med.name} ilacı için alındı işaretle`}
              aria-pressed={med.taken}
            >
              {med.taken ? (
                <>
                  <CheckCircle size={28} className="mr-2" />
                  {t("medication_taken", locale)}
                </>
              ) : (
                "Al"
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
