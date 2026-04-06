'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, Circle, Pill, Plus, Loader2, AlertCircle } from 'lucide-react';

interface Medication {
  id: string;
  name: string;
  dosage: string;
  time: string;
  isTaken: boolean;
}

export default function MedicationDashboard() {
  const [medications, setMedications] = useState<Medication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Yeni ilaç ekleme formu state
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDosage, setNewDosage] = useState('');
  const [newTime, setNewTime] = useState('');

  useEffect(() => {
    fetchMedications();
  }, []);

  const fetchMedications = async () => {
    try {
      const res = await fetch('/api/medications');
      if (res.status === 401) {
        setError('İlaçlarınızı görmek için lütfen giriş yapın.');
        setIsLoading(false);
        return;
      }
      if (!res.ok) throw new Error('İlaçlar yüklenemedi.');
      const data = await res.json();
      setMedications(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMedication = async (id: string, currentStatus: boolean) => {
    // Optimistic update
    setMedications(meds =>
      meds.map(med => med.id === id ? { ...med, isTaken: !currentStatus } : med)
    );

    try {
      await fetch('/api/medications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, isTaken: !currentStatus })
      });
    } catch (err) {
      // Revert on error
      setMedications(meds =>
        meds.map(med => med.id === id ? { ...med, isTaken: currentStatus } : med)
      );
      alert('Durum güncellenirken bir hata oluştu.');
    }
  };

  const handleAddMedication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;

    try {
      const res = await fetch('/api/medications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newName, dosage: newDosage, time: newTime })
      });

      if (!res.ok) throw new Error('İlaç eklenemedi.');

      setNewName('');
      setNewDosage('');
      setNewTime('');
      setIsAdding(false);
      fetchMedications(); // Listeyi yenile
    } catch (err) {
      alert('İlaç eklenirken hata oluştu.');
    }
  };

  return (
    <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-xl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-yellow-400 flex items-center gap-3">
          <Pill className="w-8 h-8" />
          Günlük İlaç Takibi
        </h2>

        {!error && (
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-3 rounded-xl font-bold flex items-center gap-2 outline-none focus:ring-4 focus:ring-yellow-400 w-full sm:w-auto justify-center"
          >
            <Plus className="w-6 h-6" /> Yeni İlaç Ekle
          </button>
        )}
      </div>

      {error ? (
        <div className="bg-red-900/50 border border-red-500 p-4 rounded-xl flex flex-col items-center gap-3 text-center">
          <AlertCircle className="w-12 h-12 text-red-400" />
          <p className="text-red-100 font-bold text-xl">{error}</p>
          {error.includes('giriş') && (
            <a href="/login" className="mt-2 bg-yellow-400 hover:bg-yellow-300 text-gray-900 px-6 py-3 rounded-xl font-bold text-lg inline-block">
              Giriş Yap
            </a>
          )}
        </div>
      ) : isLoading ? (
        <div className="flex justify-center p-8">
          <Loader2 className="w-12 h-12 text-yellow-400 animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">

          {isAdding && (
            <form onSubmit={handleAddMedication} className="bg-gray-700 p-4 rounded-xl border-2 border-blue-500 mb-6 space-y-4">
              <div>
                <label className="block text-white font-bold mb-1">İlaç Adı *</label>
                <input required value={newName} onChange={e => setNewName(e.target.value)} className="w-full bg-gray-900 text-white p-3 rounded-lg border border-gray-600 focus:border-yellow-400 outline-none" placeholder="Örn: Parol 500mg" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-white font-bold mb-1">Kullanım (Doz)</label>
                  <input value={newDosage} onChange={e => setNewDosage(e.target.value)} className="w-full bg-gray-900 text-white p-3 rounded-lg border border-gray-600 focus:border-yellow-400 outline-none" placeholder="Örn: Günde 2 kez" />
                </div>
                <div className="flex-1">
                  <label className="block text-white font-bold mb-1">Zaman</label>
                  <input value={newTime} onChange={e => setNewTime(e.target.value)} className="w-full bg-gray-900 text-white p-3 rounded-lg border border-gray-600 focus:border-yellow-400 outline-none" placeholder="Örn: Sabah tok" />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsAdding(false)} className="flex-1 bg-gray-600 hover:bg-gray-500 text-white p-3 rounded-lg font-bold">İptal</button>
                <button type="submit" className="flex-1 bg-green-600 hover:bg-green-500 text-white p-3 rounded-lg font-bold">Kaydet</button>
              </div>
            </form>
          )}

          {medications.length === 0 && !isAdding && (
            <p className="text-gray-400 text-center text-lg p-4 bg-gray-900 rounded-xl border border-gray-700">Henüz eklenmiş ilacınız yok. Yukarıdan ekleyebilirsiniz.</p>
          )}

          {medications.map((med) => (
            <button
              key={med.id}
              onClick={() => toggleMedication(med.id, med.isTaken)}
              className={`w-full text-left p-5 rounded-xl border-2 flex items-center justify-between transition-all outline-none focus:ring-4 focus:ring-yellow-400 ${
                med.isTaken
                  ? 'bg-green-900/30 border-green-500'
                  : 'bg-gray-700 border-gray-600 hover:border-gray-500'
              }`}
            >
              <div className="flex-1">
                <h3 className={`text-xl font-bold ${med.isTaken ? 'text-green-400 line-through opacity-70' : 'text-white'}`}>
                  {med.name}
                </h3>
                <p className="text-gray-300 text-lg mt-1">{med.time} - {med.dosage}</p>
              </div>

              <div className="shrink-0 ml-4">
                {med.isTaken ? (
                  <div className="flex flex-col items-center">
                    <CheckCircle className="w-12 h-12 text-green-500" />
                    <span className="text-green-400 font-bold mt-1 text-sm">ALINDI</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Circle className="w-12 h-12 text-gray-400" />
                    <span className="text-gray-400 font-bold mt-1 text-sm">BEKLİYOR</span>
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
