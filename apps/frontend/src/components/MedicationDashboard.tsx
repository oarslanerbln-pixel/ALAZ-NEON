'use client';

import { useState } from 'react';
import { CheckCircle2, Circle } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface Medication {
  id: string;
  name: string;
  time: string;
  taken: boolean;
}

export default function MedicationDashboard() {
  const { t } = useTranslation();
  const [meds, setMeds] = useState<Medication[]>([
    { id: '1', name: 'Tansiyon İlacı (Amlodipin)', time: '08:00', taken: false },
    { id: '2', name: 'Şeker İlacı (Metformin)', time: '09:00', taken: true },
    { id: '3', name: 'Kan Sulandırıcı (Aspirin)', time: '20:00', taken: false },
  ]);

  const toggleMed = (id: string) => {
    setMeds(meds.map(med =>
      med.id === id ? { ...med, taken: !med.taken } : med
    ));
  };

  return (
    <div className="w-full max-w-2xl mx-auto my-8">
      <h2 className="text-3xl font-bold mb-6 text-yellow-400 border-b-4 border-cyan-400 pb-2">
        Günlük İlaç Takibi
      </h2>

      <div className="flex flex-col gap-4">
        {meds.map((med) => (
          <div
            key={med.id}
            className="flex items-center justify-between p-6 border-4 border-cyan-400 rounded-xl bg-black"
          >
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-yellow-400">{med.name}</span>
              <span className="text-xl text-cyan-400">Saat: {med.time}</span>
            </div>

            <button
              onClick={() => toggleMed(med.id)}
              aria-label={`${med.name} için ${med.taken ? 'alınmadı' : 'alındı'} olarak işaretle`}
              className={`flex items-center gap-2 px-6 py-4 rounded-lg font-bold text-2xl border-4 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400 transition-colors ${
                med.taken
                  ? 'bg-cyan-900 border-cyan-400 text-cyan-400'
                  : 'bg-black border-yellow-400 text-yellow-400 hover:bg-gray-900'
              }`}
            >
              {med.taken ? (
                <>
                  <CheckCircle2 size={32} />
                  <span>{t('Alındı')}</span>
                </>
              ) : (
                <>
                  <Circle size={32} />
                  <span>Alınmadı</span>
                </>
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
