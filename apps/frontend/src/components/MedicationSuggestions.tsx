"use client";

import { useState } from 'react';
import { CheckCircle2, Loader2, Plus } from 'lucide-react';
import { api, type MedicationCandidate } from '@/lib/api';

const TIME_OPTIONS = ['Sabah', 'Öğle', 'Akşam', 'Gece'];

export default function MedicationSuggestions({ candidates }: { candidates: MedicationCandidate[] }) {
  if (candidates.length === 0) return null;

  return (
    <div className="w-full bg-gray-800 p-6 rounded-xl mt-4 flex flex-col gap-4">
      <div>
        <h2 className="text-xl font-bold text-yellow-400">Raporda Tespit Edilen İlaçlar</h2>
        <p className="text-sm text-gray-400 mt-1">
          Bunlar sadece öneridir, sistem hiçbir şeyi otomatik eklemez. Eklemeden önce bilgileri kontrol et.
        </p>
      </div>
      {candidates.map((candidate, i) => (
        <SuggestionRow key={i} candidate={candidate} />
      ))}
    </div>
  );
}

function SuggestionRow({ candidate }: { candidate: MedicationCandidate }) {
  const [name, setName] = useState(candidate.name);
  const [dosage, setDosage] = useState(candidate.dosage);
  const [timeOfDay, setTimeOfDay] = useState(
    TIME_OPTIONS.includes(candidate.timeOfDay) ? candidate.timeOfDay : TIME_OPTIONS[0]
  );
  const [status, setStatus] = useState<'idle' | 'adding' | 'added' | 'error'>('idle');

  const handleAdd = async () => {
    setStatus('adding');
    try {
      await api.createMedication({ name: name.trim(), dosage: dosage.trim(), timeOfDay });
      setStatus('added');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'added') {
    return (
      <div className="flex items-center gap-3 p-4 bg-green-900 border-2 border-green-600 rounded-lg">
        <CheckCircle2 size={24} className="text-green-400 shrink-0" />
        <span className="font-bold">{name}</span>
        <span className="text-gray-300">{timeOfDay} · {dosage}</span>
        <span className="ml-auto text-sm text-green-400">İlaçlarım&apos;a eklendi</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4 bg-gray-900 border-2 border-gray-600 rounded-lg">
      <div className="grid grid-cols-2 gap-3">
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          aria-label="İlaç adı"
          className="p-2 rounded-lg bg-gray-800 border border-gray-600 focus:outline-none focus:border-green-500"
        />
        <input
          value={dosage}
          onChange={e => setDosage(e.target.value)}
          aria-label="Doz"
          className="p-2 rounded-lg bg-gray-800 border border-gray-600 focus:outline-none focus:border-green-500"
        />
      </div>
      <select
        value={timeOfDay}
        onChange={e => setTimeOfDay(e.target.value)}
        aria-label="Zaman"
        className="p-2 rounded-lg bg-gray-800 border border-gray-600 focus:outline-none focus:border-green-500"
      >
        {TIME_OPTIONS.map(option => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>

      {status === 'error' && <p className="text-red-400 text-sm">Eklenemedi, tekrar dene.</p>}

      <button
        onClick={handleAdd}
        disabled={!name.trim() || !dosage.trim() || status === 'adding'}
        className="flex items-center justify-center gap-2 p-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 rounded-lg font-bold transition-colors"
      >
        {status === 'adding' ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
        İlaçlarım&apos;a Ekle
      </button>
    </div>
  );
}
