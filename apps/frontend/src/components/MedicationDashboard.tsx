'use client';

import React, { useState } from 'react';
import { t } from '@/lib/i18n';
import { Check } from 'lucide-react';

export default function MedicationDashboard() {
  const [meds, setMeds] = useState([
    { id: 'med-1', name: 'Tansiyon İlacı (Sabah)', taken: false },
    { id: 'med-2', name: 'Kalp İlacı (Öğle)', taken: false },
    { id: 'med-3', name: 'Şeker İlacı (Akşam)', taken: false },
  ]);

  const toggleMed = (id: string) => {
    setMeds(meds.map(med => med.id === id ? { ...med, taken: !med.taken } : med));
  };

  return (
    <div className="max-w-md mx-auto p-6 border-2 border-yellow-500 rounded-lg">
      <h2 className="text-3xl font-bold mb-6 text-yellow-500">{t('meds_title')}</h2>

      <div className="space-y-4">
        {meds.map(med => (
          <div key={med.id} className="flex items-center justify-between p-4 bg-gray-900 border border-cyan-500 rounded-lg">
            <label htmlFor={med.id} className="text-xl text-yellow-500 flex-1 cursor-pointer">
              {med.name}
            </label>
            <input
              id={med.id}
              type="checkbox"
              checked={med.taken}
              onChange={() => toggleMed(med.id)}
              className="hidden"
            />
            <button
              onClick={() => toggleMed(med.id)}
              className={`ml-4 px-6 py-4 text-xl font-bold rounded-lg transition-colors flex items-center ${
                med.taken ? 'bg-green-500 text-black' : 'bg-cyan-500 text-black'
              }`}
            >
              {med.taken ? <Check className="mr-2" /> : null}
              {med.taken ? t('taken') : 'Al'}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-8 text-sm text-center text-yellow-600 bg-black p-2 border border-yellow-600">
        {t('disclaimer')}
      </div>
    </div>
  );
}
