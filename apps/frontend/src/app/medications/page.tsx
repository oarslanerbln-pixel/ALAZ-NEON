"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CheckCircle2, Circle, LogOut, Loader2, Plus, Trash2, X } from 'lucide-react';
import { api, type Medication } from '@/lib/api';
import { clearToken } from '@/lib/auth';
import AuthGuard from '@/components/AuthGuard';

const TIME_OPTIONS = ['Sabah', 'Öğle', 'Akşam', 'Gece'];

export default function MedicationsPage() {
  return (
    <AuthGuard>
      <MedicationsView />
    </AuthGuard>
  );
}

function MedicationsView() {
  const router = useRouter();
  const [meds, setMeds] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);

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

  const addMedication = async (data: { name: string; dosage: string; timeOfDay: string }) => {
    const created = await api.createMedication(data);
    setMeds(prev => [...prev, created]);
    setFormOpen(false);
  };

  const removeMedication = async (id: string) => {
    const previous = meds;
    setMeds(meds.filter(m => m.id !== id));
    try {
      await api.deleteMedication(id);
    } catch {
      setMeds(previous);
      setError('İlaç silinemedi.');
    }
  };

  const handleLogout = () => {
    clearToken();
    router.push('/login');
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4 mb-4">
        <Link href="/" className="px-4 py-2 bg-gray-800 rounded-lg font-bold">Geri</Link>
        <h1 className="text-2xl font-bold flex-1">İlaçlarım</h1>
        <button
          onClick={() => setFormOpen(v => !v)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg font-bold transition-colors"
        >
          {formOpen ? <X size={20} /> : <Plus size={20} />}
          {formOpen ? 'Vazgeç' : 'İlaç Ekle'}
        </button>
        <button
          onClick={handleLogout}
          aria-label="Çıkış yap"
          className="p-2 text-gray-400 hover:text-red-400 transition-colors"
        >
          <LogOut size={24} />
        </button>
      </div>

      {formOpen && (
        <AddMedicationForm onSubmit={addMedication} onError={setError} />
      )}

      {loading && (
        <div className="flex items-center gap-2 text-gray-300">
          <Loader2 size={24} className="animate-spin" /> Yükleniyor...
        </div>
      )}

      {error && <p className="text-red-400">{error}</p>}

      {!loading && meds.length === 0 && (
        <p className="text-gray-400">Henüz kayıtlı ilaç yok.</p>
      )}

      <div className="flex flex-col gap-4">
        {meds.map(med => (
          <div
            key={med.id}
            className={`flex items-center justify-between p-6 rounded-xl border-2 transition-colors ${med.taken ? 'bg-green-900 border-green-600' : 'bg-gray-800 border-gray-600'}`}
          >
            <button
              onClick={() => toggleMed(med.id)}
              className="flex items-center justify-between flex-1 text-left"
              aria-pressed={med.taken}
            >
              <div>
                <h2 className="text-2xl font-bold">{med.name}</h2>
                <p className="text-gray-300 mt-1">{med.timeOfDay} · {med.dosage}</p>
              </div>
              {med.taken ? <CheckCircle2 size={40} className="text-green-400" /> : <Circle size={40} className="text-gray-400" />}
            </button>
            <button
              onClick={() => removeMedication(med.id)}
              aria-label={`${med.name} ilacını sil`}
              className="ml-4 p-2 text-gray-400 hover:text-red-400 transition-colors"
            >
              <Trash2 size={24} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function AddMedicationForm({
  onSubmit,
  onError,
}: {
  onSubmit: (data: { name: string; dosage: string; timeOfDay: string }) => Promise<void>;
  onError: (message: string) => void;
}) {
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [timeOfDay, setTimeOfDay] = useState(TIME_OPTIONS[0]);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !dosage.trim()) return;

    setSubmitting(true);
    try {
      await onSubmit({ name: name.trim(), dosage: dosage.trim(), timeOfDay });
      setName('');
      setDosage('');
      setTimeOfDay(TIME_OPTIONS[0]);
    } catch {
      onError('İlaç eklenemedi.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-6 bg-gray-800 rounded-xl border-2 border-gray-600">
      <div className="flex flex-col gap-1">
        <label htmlFor="med-name" className="text-sm text-gray-300">İlaç Adı</label>
        <input
          id="med-name"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Örn. Parol 500mg"
          required
          className="p-3 rounded-lg bg-gray-900 border border-gray-600 focus:outline-none focus:border-green-500"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="med-dosage" className="text-sm text-gray-300">Doz</label>
        <input
          id="med-dosage"
          value={dosage}
          onChange={e => setDosage(e.target.value)}
          placeholder="Örn. 1 tablet"
          required
          className="p-3 rounded-lg bg-gray-900 border border-gray-600 focus:outline-none focus:border-green-500"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="med-time" className="text-sm text-gray-300">Zaman</label>
        <select
          id="med-time"
          value={timeOfDay}
          onChange={e => setTimeOfDay(e.target.value)}
          className="p-3 rounded-lg bg-gray-900 border border-gray-600 focus:outline-none focus:border-green-500"
        >
          {TIME_OPTIONS.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="flex items-center justify-center gap-2 p-3 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg font-bold transition-colors"
      >
        {submitting ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
        Kaydet
      </button>
    </form>
  );
}
