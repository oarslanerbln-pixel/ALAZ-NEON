"use client";

import { useState } from "react";
import { CheckCircle2, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  schedule: string;
  taken: boolean;
}

const mockMedications: Medication[] = [
  {
    id: "1",
    name: "Tansiyon İlacı",
    dosage: "1 Tablet",
    schedule: "Sabah - Tok Karnına",
    taken: false,
  },
  {
    id: "2",
    name: "Şeker İlacı",
    dosage: "1 Tablet",
    schedule: "Akşam - Aç Karnına",
    taken: true,
  },
];

export default function MedicationDashboard() {
  const [medications, setMedications] = useState<Medication[]>(mockMedications);

  const toggleMedication = (id: string) => {
    setMedications((prev) =>
      prev.map((med) =>
        med.id === id ? { ...med, taken: !med.taken } : med
      )
    );
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 space-y-6">
      <h2 className="text-2xl font-bold text-center mb-6">Günlük İlaç Takibi</h2>

      <div className="space-y-4">
        {medications.map((med) => (
          <motion.div
            key={med.id}
            role="button"
            tabIndex={0}
            onClick={() => toggleMedication(med.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                toggleMedication(med.id);
              }
            }}
            whileTap={{ scale: 0.98 }}
            className={`p-6 rounded-2xl border-2 cursor-pointer transition-colors focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none ${
              med.taken
                ? "bg-green-900/30 border-green-500"
                : "bg-neutral-800 border-neutral-700 hover:border-yellow-400"
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-2xl font-bold">{med.name}</h3>
              {med.taken ? (
                <CheckCircle2 size={32} className="text-green-500" />
              ) : (
                <div className="w-8 h-8 rounded-full border-2 border-neutral-500" />
              )}
            </div>

            <div className="space-y-2">
              <p className="text-xl font-medium text-neutral-200">
                Doz: {med.dosage}
              </p>
              <div className="flex items-center gap-2 text-neutral-300">
                <Clock size={20} />
                <span className="text-lg">{med.schedule}</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                className={`w-full py-4 text-xl font-bold rounded-xl transition-colors ${
                  med.taken
                    ? "bg-green-600 text-white"
                    : "bg-yellow-500 text-black hover:bg-yellow-400"
                }`}
                tabIndex={-1}
                aria-hidden="true"
              >
                {med.taken ? "Alındı" : "Alındı İşaretle"}
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
