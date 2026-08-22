'use client';

import { useState } from 'react';
import { Pill, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

type Medication = {
  id: string;
  name: string;
  dosage: string;
  time: string;
  taken: boolean;
};

export default function MedicationDashboard() {
  const [medications, setMedications] = useState<Medication[]>([
    { id: '1', name: 'Tansiyon İlacı', dosage: '1 Tablet', time: 'Sabah 09:00', taken: false },
    { id: '2', name: 'Demir Hapı', dosage: '1 Tablet', time: 'Öğle 13:00', taken: false },
    { id: '3', name: 'Vitamin', dosage: '1 Kapsül', time: 'Akşam 20:00', taken: true },
  ]);

  const toggleMedication = (id: string) => {
    setMedications(medications.map(med =>
      med.id === id ? { ...med, taken: !med.taken } : med
    ));
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-12">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
        <Pill className="w-8 h-8 text-primary" />
        Günlük İlaç Takibi
      </h2>

      <div className="flex flex-col gap-4">
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
            className={`p-6 rounded-xl border-4 cursor-pointer flex items-center justify-between transition-colors focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary ${
              med.taken ? 'bg-primary/20 border-primary' : 'bg-gray-900 border-gray-600'
            }`}
          >
            <div>
              <h3 className="text-2xl font-bold">{med.name}</h3>
              <p className="text-xl mt-2">{med.dosage} - {med.time}</p>
            </div>

            <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 ${
              med.taken ? 'bg-primary text-black border-primary' : 'border-gray-500 text-transparent'
            }`}>
              <CheckCircle className="w-10 h-10" />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
