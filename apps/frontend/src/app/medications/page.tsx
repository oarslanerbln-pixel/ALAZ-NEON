"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { api, type Medication } from '@/lib/api';

export default function MedicationsPage() {
  const [meds, setMeds] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getMedications()
      .then(setMeds)
      .catch(() => setError('İlaçlar yüklenemedi. Backend çalışıyor mu?'))
      .finally(() => setLoading(false));
  }, []);

  const toggleMed = async (id: string) => {
    const target = meds.find(m => m.id === id);
    if (!target) return;

    const nextTaken = !target.taken;
    setMeds(meds.map(m => m.id === id ? { ...m, taken: nextTaken } : m));

    try {
      await api.setMedicationTaken(id, nextTaken);
    } catch {
      setMeds(meds.map(m => m.id === id ? { ...m, taken: target.taken } : m));
      setError('Güncelleme kaydedilemedi.');
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4 mb-4">
        <Link href="/" className="px-4 py-2 bg-gray-800 rounded-lg font-bold">Geri</Link>
        <h1 className="text-2xl font-bold">İlaçlarım</h1>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-gray-300">
          <Loader2 size={24} className="animate-spin" /> Yükleniyor...
        </div>
      )}

      {error && <p className="text-red-400">{error}</p>}

      {!loading && !error && meds.length === 0 && (
        <p className="text-gray-400">Henüz kayıtlı ilaç yok.</p>
      )}

      <div className="flex flex-col gap-4">
        {meds.map(med => (
          <button
            key={med.id}
            onClick={() => toggleMed(med.id)}
            className={`flex items-center justify-between p-6 rounded-xl text-left transition-colors border-2 ${med.taken ? 'bg-green-900 border-green-600' : 'bg-gray-800 border-gray-600 hover:bg-gray-700'}`}
            aria-pressed={med.taken}
          >
            <div>
              <h2 className="text-2xl font-bold">{med.name}</h2>
              <p className="text-gray-300 mt-1">{med.timeOfDay} · {med.dosage}</p>
            </div>
            {med.taken ? <CheckCircle2 size={40} className="text-green-400" /> : <Circle size={40} className="text-gray-400" />}
          </button>
        ))}
      </div>
    </div>
  );
}
