'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Pill, CheckCircle2, Clock } from 'lucide-react';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  schedule: string;
  taken: boolean;
}

const INITIAL_MEDICATIONS: Medication[] = [
  { id: '1', name: 'Tansiyon İlacı', dosage: '50mg', schedule: 'Sabah (Tok Karnına)', taken: false },
  { id: '2', name: 'Şeker İlacı', dosage: '1000mg', schedule: 'Öğle (Yemekle)', taken: true },
  { id: '3', name: 'Kan Sulandırıcı', dosage: '100mg', schedule: 'Akşam (Aç Karnına)', taken: false },
];

export default function MedicationPanel() {
  const [medications, setMedications] = useState<Medication[]>(INITIAL_MEDICATIONS);

  const toggleMedication = (id: string) => {
    setMedications(prev =>
      prev.map(med => med.id === id ? { ...med, taken: !med.taken } : med)
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto p-4 bg-[var(--card-bg)] rounded-xl border-2 border-[var(--border)] shadow-lg mt-8">
      <div className="flex items-center mb-6">
        <Pill size={32} className="mr-3 text-[var(--interactive)]" />
        <h2 className="text-2xl font-bold">Günlük İlaç Takibi</h2>
      </div>

      <div className="space-y-4">
        {medications.map((med) => (
          <motion.div
            key={med.id}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex flex-col sm:flex-row items-center p-4 rounded-xl border-2 transition-colors ${
              med.taken
                ? 'bg-green-900 border-green-500'
                : 'bg-black border-[var(--border)]'
            }`}
          >
            <div className="flex-grow w-full sm:w-auto mb-4 sm:mb-0">
              <h3 className="text-xl font-bold mb-1">{med.name} - {med.dosage}</h3>
              <div className="flex items-center opacity-90 text-lg">
                <Clock size={20} className="mr-2" />
                <span>{med.schedule}</span>
              </div>
            </div>

            <button
              onClick={() => toggleMedication(med.id)}
              className={`w-full sm:w-auto min-w-[140px] px-6 py-4 rounded-xl flex items-center justify-center font-bold text-xl transition-all focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400 ${
                med.taken
                  ? 'bg-green-500 text-black border-2 border-transparent'
                  : 'bg-[var(--interactive)] text-black hover:bg-[var(--interactive-hover)] border-2 border-transparent'
              }`}
              aria-label={`${med.name} ilacını ${med.taken ? 'alınmadı' : 'alındı'} olarak işaretle`}
              aria-pressed={med.taken}
            >
              {med.taken ? (
                <>
                  <CheckCircle2 size={28} className="mr-2" />
                  Alındı
                </>
              ) : (
                'İşaretle'
              )}
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
