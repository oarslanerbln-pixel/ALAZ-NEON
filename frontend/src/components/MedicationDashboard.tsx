"use client";

import React, { useState } from "react";
import { CheckCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";

type Medication = {
  id: string;
  name: string;
  dosage: string;
  time: string;
  taken: boolean;
};

const initialMedications: Medication[] = [
  { id: "1", name: "Parol", dosage: "1 Tablet", time: "08:00", taken: false },
  { id: "2", name: "Tansiyon İlacı", dosage: "1 Tablet", time: "20:00", taken: false },
];

export function MedicationDashboard() {
  const [medications, setMedications] = useState<Medication[]>(initialMedications);

  const toggleTaken = (id: string) => {
    setMedications(meds =>
      meds.map(m => m.id === id ? { ...m, taken: !m.taken } : m)
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleTaken(id);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto mt-12 bg-zinc-900 p-4 border-2 border-zinc-700 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-white text-center">Günlük İlaçlarım</h2>

      <div className="space-y-4">
        {medications.map((med) => (
          <div
            key={med.id}
            role="button"
            tabIndex={0}
            aria-pressed={med.taken}
            aria-label={`${med.name}, ${med.dosage}, Saat ${med.time}. ${med.taken ? 'Alındı' : 'Alınmadı'}. Durumu değiştirmek için tıklayın.`}
            onKeyDown={(e) => handleKeyDown(e, med.id)}
            onClick={() => toggleTaken(med.id)}
            className={`flex items-center justify-between p-4 rounded-xl border-4 cursor-pointer transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white ${
              med.taken
                ? "bg-green-900 border-green-500"
                : "bg-zinc-800 border-zinc-600 hover:border-zinc-500"
            }`}
          >
            <div className="flex flex-col">
              <span className={`text-xl font-bold ${med.taken ? 'text-green-100 line-through' : 'text-white'}`}>
                {med.name}
              </span>
              <span className={`text-lg mt-1 ${med.taken ? 'text-green-300' : 'text-zinc-400'}`}>
                {med.dosage}
              </span>
              <div className="flex items-center mt-2">
                <Clock className={`w-5 h-5 mr-1 ${med.taken ? 'text-green-300' : 'text-zinc-400'}`} aria-hidden="true" />
                <span className={`text-md font-semibold ${med.taken ? 'text-green-300' : 'text-zinc-400'}`}>
                  {med.time}
                </span>
              </div>
            </div>

            <motion.div
              initial={false}
              animate={{ scale: med.taken ? 1.2 : 1 }}
              className={`w-16 h-16 flex items-center justify-center rounded-full border-4 ${
                med.taken ? 'bg-green-500 border-green-300' : 'bg-zinc-700 border-zinc-500'
              }`}
            >
              {med.taken ? (
                <CheckCircle className="w-10 h-10 text-white" aria-hidden="true" />
              ) : (
                <span className="text-sm font-bold text-zinc-300">AL</span>
              )}
            </motion.div>
          </div>
        ))}
      </div>
    </div>
  );
}
