"use client";

import { useEffect, useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Circle, Trash2, Loader2, ArrowLeft } from 'lucide-react';
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
        <Loader2 size={44} className="animate-spin text-gold-400" />
        <p className="text-ink-300">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-up">
      <div className="flex items-center gap-3 mb-2">
        <Link
          href="/"
          aria-label="Geri"
          className="grid place-items-center size-11 rounded-xl bg-navy-800 border border-white/10 hover:bg-navy-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">İlaçlarım</h1>
      </div>

      <form onSubmit={handleAdd} className="flex flex-col gap-3 bg-navy-800 p-5 rounded-2xl border border-white/10 shadow-lg shadow-black/30">
        <h2 className="font-bold text-lg text-gold-400">Yeni İlaç Ekle</h2>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="İlaç adı (örn: Parol 500mg)"
          aria-label="İlaç adı"
          className="p-3 rounded-xl bg-navy-900 border border-white/10 text-ink-100 placeholder:text-ink-500 focus-visible:outline-none focus-visible:border-gold-500 focus-visible:ring-2 focus-visible:ring-gold-500/40 transition-colors"
        />
        <input
          value={dosage}
          onChange={(e) => setDosage(e.target.value)}
          placeholder="Doz (örn: 1 tablet)"
          aria-label="Doz"
          className="p-3 rounded-xl bg-navy-900 border border-white/10 text-ink-100 placeholder:text-ink-500 focus-visible:outline-none focus-visible:border-gold-500 focus-visible:ring-2 focus-visible:ring-gold-500/40 transition-colors"
        />
        <input
          value={timeOfDay}
          onChange={(e) => setTimeOfDay(e.target.value)}
          placeholder="Zaman (örn: Sabah)"
          aria-label="Zaman"
          className="p-3 rounded-xl bg-navy-900 border border-white/10 text-ink-100 placeholder:text-ink-500 focus-visible:outline-none focus-visible:border-gold-500 focus-visible:ring-2 focus-visible:ring-gold-500/40 transition-colors"
        />
        <button
          type="submit"
          disabled={isAdding}
          className="bg-gold-500 hover:bg-gold-400 disabled:opacity-50 text-navy-950 p-3 rounded-xl font-bold transition-colors duration-200 mt-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-800"
        >
          {isAdding ? 'Ekleniyor...' : 'Ekle'}
        </button>
      </form>

      {error && (
        <div role="alert" aria-live="assertive" className="bg-coral-500/10 border border-coral-500/40 text-coral-400 p-4 rounded-xl font-medium">
          {error}
        </div>
      )}

      <div className="flex flex-col gap-3">
        {meds.length === 0 && (
          <p className="text-center text-ink-500">Henüz eklenmiş bir ilaç yok.</p>
        )}
        {meds.map((med) => (
          <div
            key={med.id}
            className={`flex items-center justify-between p-5 rounded-2xl border transition-colors duration-200 ${
              med.taken ? 'bg-sage-500/10 border-sage-500/40' : 'bg-navy-800 border-white/10'
            }`}
          >
            <button
              onClick={() => handleToggle(med)}
              className="flex items-center gap-4 text-left flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-500 rounded-xl"
              aria-pressed={med.taken}
              aria-label={`${med.name}, ${med.taken ? 'alındı, değiştirmek için dokun' : 'alınmadı, işaretlemek için dokun'}`}
            >
              {med.taken ? (
                <CheckCircle2 size={36} className="text-sage-400 shrink-0" />
              ) : (
                <Circle size={36} className="text-ink-500 shrink-0" />
              )}
              <div>
                <h2 className="text-xl font-bold">{med.name}</h2>
                <p className="text-ink-500 mt-0.5">{med.dosage} · {med.timeOfDay}</p>
              </div>
            </button>
            <button
              onClick={() => handleDelete(med.id)}
              aria-label={`${med.name} ilacını sil`}
              className="p-2 text-ink-500 hover:text-coral-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-coral-400 rounded-lg transition-colors"
            >
              <Trash2 size={22} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
