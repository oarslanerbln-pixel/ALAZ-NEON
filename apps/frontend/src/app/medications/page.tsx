"use client";

import { useEffect, useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Circle, Trash2, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import {
  addMedication,
  deleteMedication,
  getMedications,
  toggleMedication,
  ApiError,
  Medication,
} from '@/lib/api';

export default function MedicationsPage() {
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useAuth();
  const [meds, setMeds] = useState<Medication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [timeOfDay, setTimeOfDay] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (isAuthLoading) return;

    if (!user) {
      router.push('/login');
      return;
    }

    getMedications()
      .then(setMeds)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'İlaçlar yüklenemedi.'))
      .finally(() => setIsLoading(false));
  }, [user, isAuthLoading, router]);

  const handleToggle = async (med: Medication) => {
    try {
      const updated = await toggleMedication(med.id, !med.taken);
      setMeds((prev) => prev.map((m) => (m.id === med.id ? updated : m)));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'İlaç güncellenemedi.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMedication(id);
      setMeds((prev) => prev.filter((m) => m.id !== id));
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'İlaç silinemedi.');
    }
  };

  const handleAdd = async (event: FormEvent) => {
    event.preventDefault();
    if (!name.trim() || !dosage.trim() || !timeOfDay.trim()) return;

    setIsAdding(true);
    setError(null);
    try {
      const med = await addMedication({ name, dosage, timeOfDay });
      setMeds((prev) => [...prev, med]);
      setName('');
      setDosage('');
      setTimeOfDay('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'İlaç eklenemedi.');
    } finally {
      setIsAdding(false);
    }
  };

  if (isAuthLoading || !user || isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <Loader2 size={48} className="animate-spin text-blue-300" />
        <p>Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4 mb-4">
        <Link href="/" className="px-4 py-2 bg-gray-800 rounded-lg font-bold">Geri</Link>
        <h1 className="text-2xl font-bold">İlaçlarım</h1>
      </div>

      <form onSubmit={handleAdd} className="flex flex-col gap-3 bg-[#0a0a0a] p-4 rounded-none border border-gray-800">
        <h2 className="font-bold text-lg text-blue-400">Yeni İlaç Ekle</h2>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="İlaç adı (örn: Parol 500mg)"
          aria-label="İlaç adı"
          className="p-3 rounded-none bg-[#111] border-2 border-gray-800 focus-visible:outline-none focus-visible:border-blue-500 transition-colors"
        />
        <input
          value={dosage}
          onChange={(e) => setDosage(e.target.value)}
          placeholder="Doz (örn: 1 tablet)"
          aria-label="Doz"
          className="p-3 rounded-none bg-[#111] border-2 border-gray-800 focus-visible:outline-none focus-visible:border-blue-500 transition-colors"
        />
        <input
          value={timeOfDay}
          onChange={(e) => setTimeOfDay(e.target.value)}
          placeholder="Zaman (örn: Sabah)"
          aria-label="Zaman"
          className="p-3 rounded-none bg-[#111] border-2 border-gray-800 focus-visible:outline-none focus-visible:border-blue-500 transition-colors"
        />
        <button
          type="submit"
          disabled={isAdding}
          className="bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white p-3 rounded-none font-bold transition-all animate-glow-pulse-green border border-green-400/20"
        >
          {isAdding ? 'Ekleniyor...' : 'Ekle'}
        </button>
      </form>

      {error && (
        <div role="alert" aria-live="assertive" className="bg-red-900/50 border border-red-500 text-red-200 p-4 rounded-none">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-4">
        {meds.length === 0 && (
          <p className="text-center text-gray-400">Henüz eklenmiş bir ilaç yok.</p>
        )}
        {meds.map((med) => (
          <div
            key={med.id}
            className={`flex items-center justify-between p-6 rounded-none border ${
              med.taken ? 'bg-[#051105] border-green-500/50' : 'bg-[#0a0a0a] border-gray-800'
            } transition-colors`}
          >
            <button
              onClick={() => handleToggle(med)}
              className="flex items-center gap-4 text-left flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 rounded-none"
              aria-pressed={med.taken}
              aria-label={`${med.name}, ${med.taken ? 'alındı, değiştirmek için dokun' : 'alınmadı, işaretlemek için dokun'}`}
            >
              {med.taken ? (
                <CheckCircle2 size={40} className="text-green-400 shrink-0" />
              ) : (
                <Circle size={40} className="text-gray-400 shrink-0" />
              )}
              <div>
                <h2 className="text-2xl font-bold">{med.name}</h2>
                <p className="text-gray-300 mt-1">{med.dosage} · {med.timeOfDay}</p>
              </div>
            </button>
            <button
              onClick={() => handleDelete(med.id)}
              aria-label={`${med.name} ilacını sil`}
              className="p-2 text-red-400 hover:text-red-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 rounded-lg"
            >
              <Trash2 size={24} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
