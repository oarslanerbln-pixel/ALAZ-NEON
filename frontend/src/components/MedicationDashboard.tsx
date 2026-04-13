"use client";

import React, { useState } from 'react';
import { Pill, CheckCircle } from 'lucide-react';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  taken: boolean;
}

export default function MedicationDashboard() {
  const [medications, setMedications] = useState<Medication[]>([
    { id: '1', name: 'Tansiyon İlacı', dosage: 'Sabah 1 Tok', taken: false },
    { id: '2', name: 'Kalp Hapı', dosage: 'Öğle 1 Aç', taken: false },
  ]);

  const toggleTaken = (id: string) => {
    setMedications(prev =>
      prev.map(med => med.id === id ? { ...med, taken: !med.taken } : med)
    );
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <h2 className="text-3xl font-extrabold text-black dark:text-white border-b-4 border-black dark:border-white pb-2">
        Günlük İlaçlarım
      </h2>

      <div className="space-y-4">
        {medications.map((med) => (
          <div
            key={med.id}
            role="button"
            tabIndex={0}
            aria-pressed={med.taken}
            aria-label={`${med.name}, ${med.dosage}. Durum: ${med.taken ? 'Alındı' : 'Alınmadı'}. Alındı olarak işaretlemek için tıklayın.`}
            onClick={() => toggleTaken(med.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleTaken(med.id);
              }
            }}
            className={`flex items-center justify-between p-6 border-4 rounded-xl cursor-pointer transition-all focus-visible:ring-4 focus-visible:ring-offset-2 focus-visible:outline-none ${
              med.taken
                ? 'bg-green-100 border-green-800 text-green-900'
                : 'bg-white border-black text-black hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center space-x-4">
              <Pill size={40} className={med.taken ? 'text-green-800' : 'text-black'} />
              <div>
                <p className="text-2xl font-bold">{med.name}</p>
                <p className="text-xl font-medium opacity-90">{med.dosage}</p>
              </div>
            </div>

            <div className="flex flex-col items-center">
              {med.taken ? (
                <CheckCircle size={48} className="text-green-800" />
              ) : (
                <div className="w-12 h-12 border-4 border-black rounded-full flex items-center justify-center">
                  <span className="sr-only">Alınmadı</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
