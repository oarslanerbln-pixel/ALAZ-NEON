"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Check, Clock, Pill } from "lucide-react";

interface Medication {
  id: string;
  name: string;
  dosage: string;
  time: string;
  taken: boolean;
}

const MOCK_MEDICATIONS: Medication[] = [
  {
    id: "1",
    name: "Tansiyon İlacı",
    dosage: "1 Tablet",
    time: "Sabah Tok - 09:00",
    taken: false,
  },
  {
    id: "2",
    name: "Demir Hapı",
    dosage: "1 Tablet",
    time: "Öğle Aç - 12:00",
    taken: false,
  },
  {
    id: "3",
    name: "Vitamin C",
    dosage: "1 Adet",
    time: "Akşam Tok - 19:00",
    taken: false,
  },
];

export function MedicationDashboard() {
  const [meds, setMeds] = useState<Medication[]>(MOCK_MEDICATIONS);

  const toggleTaken = (id: string) => {
    setMeds((prev) =>
      prev.map((med) =>
        med.id === id ? { ...med, taken: !med.taken } : med
      )
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleTaken(id);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-6">
      <h2 className="text-4xl font-bold text-center border-b-4 border-[#ffff00] pb-4 mb-4">
        Bugünkü İlaçlarınız
      </h2>

      <div className="flex flex-col gap-6">
        {meds.map((med) => (
          <motion.div
            key={med.id}
            layout
            role="button"
            tabIndex={0}
            onClick={() => toggleTaken(med.id)}
            onKeyDown={(e) => handleKeyDown(e, med.id)}
            className={`
              flex flex-col sm:flex-row items-center justify-between p-6 rounded-2xl border-4 transition-all cursor-pointer outline-none focus-visible:outline-4 focus-visible:outline-white
              ${
                med.taken
                  ? "bg-[#1a1a00] border-gray-600 opacity-80"
                  : "bg-black border-[#ffff00] hover:bg-[#1a1a00]"
              }
            `}
          >
            <div className="flex flex-col gap-3 w-full sm:w-auto mb-6 sm:mb-0">
              <div className="flex items-center gap-3">
                <Pill size={32} className={med.taken ? "text-gray-400" : "text-[#ffff00]"} />
                <span className={`text-3xl font-bold ${med.taken ? "text-gray-400 line-through" : "text-white"}`}>
                  {med.name}
                </span>
              </div>
              <div className="flex items-center gap-3 text-xl">
                <Clock size={24} className="text-gray-400" />
                <span className="text-gray-300">{med.time}</span>
                <span className="text-gray-400">|</span>
                <span className="font-bold text-[#ffff00]">{med.dosage}</span>
              </div>
            </div>

            <button
              tabIndex={-1} // Prevent double tab stops
              className={`
                flex items-center gap-3 py-4 px-8 rounded-xl font-bold text-2xl w-full sm:w-auto justify-center transition-colors
                ${
                  med.taken
                    ? "bg-transparent border-4 border-gray-500 text-gray-400"
                    : "bg-[#ffff00] border-4 border-[#ffff00] text-black hover:bg-white hover:border-white"
                }
              `}
            >
              {med.taken ? (
                <>
                  <span>Alındı</span>
                </>
              ) : (
                <>
                  <Check size={32} />
                  <span>AL</span>
                </>
              )}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
