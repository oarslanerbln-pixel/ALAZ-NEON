'use client';

import React, { useState } from 'react';
import { Pill, CheckCircle2, Circle } from 'lucide-react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Utility for Tailwind classes
export function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

type Medication = {
  id: string;
  name: string;
  dosage: string;
  time: string;
  taken: boolean;
};

const initialMedications: Medication[] = [
  { id: '1', name: 'Tansiyon İlacı', dosage: '1 Tablet', time: 'Sabah (Tok)', taken: false },
  { id: '2', name: 'Demir Hapı', dosage: '1 Kapsül', time: 'Öğle (Aç)', taken: false },
  { id: '3', name: 'Vitamin', dosage: '1 Adet', time: 'Akşam (Tok)', taken: true },
];

export default function MedicationDashboard() {
  const [medications, setMedications] = useState<Medication[]>(initialMedications);

  const toggleTaken = (id: string) => {
    setMedications((prev) =>
      prev.map((med) => (med.id === id ? { ...med, taken: !med.taken } : med))
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleTaken(id);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-4 flex flex-col gap-6">
      <h2 className="text-2xl font-bold text-cyan-400 text-center mb-2 flex items-center justify-center gap-3">
        <Pill size={32} />
        Günlük İlaç Takibi
      </h2>

      <div className="flex flex-col gap-4">
        {medications.map((med) => (
          <motion.div
            key={med.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "p-6 rounded-2xl border-4 transition-colors flex flex-col gap-4",
              med.taken ? "border-cyan-800 bg-black" : "border-yellow-400 bg-black"
            )}
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className={cn("text-2xl font-bold mb-1", med.taken ? "text-cyan-600 line-through" : "text-yellow-400")}>
                  {med.name}
                </h3>
                <p className={cn("text-lg font-medium", med.taken ? "text-cyan-700" : "text-cyan-400")}>
                  {med.dosage} - {med.time}
                </p>
              </div>
            </div>

            <button
              onClick={() => toggleTaken(med.id)}
              onKeyDown={(e) => handleKeyDown(e, med.id)}
              className={cn(
                "mt-2 w-full py-4 px-6 rounded-xl text-xl font-bold flex items-center justify-center gap-3 transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white",
                med.taken
                  ? "bg-transparent border-2 border-cyan-800 text-cyan-700 hover:border-cyan-600 hover:text-cyan-600"
                  : "bg-yellow-400 text-black border-2 border-yellow-400 hover:bg-yellow-300"
              )}
              aria-label={`${med.name} ilacını ${med.taken ? 'alınmadı' : 'alındı'} olarak işaretle`}
              aria-pressed={med.taken}
            >
              {med.taken ? (
                <>
                  <CheckCircle2 size={28} />
                  <span>Alındı</span>
                </>
              ) : (
                <>
                  <Circle size={28} />
                  <span>Alındı İşaretle</span>
                </>
              )}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
