"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle } from 'lucide-react';

type Medication = {
  id: string;
  name: string;
  dosage: string;
  time: string;
  taken: boolean;
};

export default function MedicationDashboard() {
  const [medications, setMedications] = useState<Medication[]>([
    { id: '1', name: 'Tansiyon İlacı', dosage: '1 Tablet', time: 'Sabah (08:00)', taken: false },
    { id: '2', name: 'Şeker İlacı', dosage: '1 Tablet', time: 'Akşam (20:00)', taken: false },
  ]);

  const toggleMedication = (id: string) => {
    setMedications(medications.map(med =>
      med.id === id ? { ...med, taken: !med.taken } : med
    ));
  };

  return (
    <div className="border-4 border-cyan-400 p-6 rounded-xl bg-black mt-8">
      <h2 className="text-2xl font-bold mb-6 text-cyan-400">Günlük İlaçlarım</h2>

      <div className="space-y-4">
        {medications.map((med) => (
          <motion.div
            key={med.id}
            role="button"
            tabIndex={0}
            onClick={() => toggleMedication(med.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleMedication(med.id);
              }
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`flex items-center justify-between p-6 rounded-xl border-4 cursor-pointer focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400 ${
              med.taken ? 'border-green-500 bg-green-900/30' : 'border-yellow-400 bg-black'
            }`}
          >
            <div>
              <h3 className="text-2xl font-bold text-yellow-400">{med.name}</h3>
              <p className="text-xl text-cyan-400">{med.dosage} - {med.time}</p>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xl font-bold text-yellow-400">
                {med.taken ? 'ALINDI' : 'BEKLİYOR'}
              </span>
              {med.taken ? (
                <CheckCircle2 className="w-12 h-12 text-green-500" />
              ) : (
                <Circle className="w-12 h-12 text-yellow-400" />
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
