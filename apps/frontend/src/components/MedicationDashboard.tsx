"use client";
import { useState } from "react";

export default function MedicationDashboard() {
  const [meds, setMeds] = useState([
    { id: '1', name: 'Tansiyon İlacı', dosage: 'Sabah 1 Tok', taken: false },
    { id: '2', name: 'Şeker İlacı', dosage: 'Akşam 1 Aç', taken: true }
  ]);

  const toggleMed = (id: string) => {
    setMeds(meds.map(m => m.id === id ? { ...m, taken: !m.taken } : m));
  };

  return (
    <div className="p-6 bg-black text-white rounded-lg border-4 border-yellow-400 w-full max-w-xl mx-auto my-4">
      <h2 className="text-3xl font-bold mb-6 text-yellow-400 border-b-4 border-yellow-400 pb-2">Günlük İlaçlarım</h2>
      <div className="space-y-6">
        {meds.map(med => (
          <div key={med.id} className="flex flex-col sm:flex-row items-center justify-between p-6 border-4 border-white rounded-xl gap-4">
            <div>
              <p className="text-2xl font-bold">{med.name}</p>
              <p className="text-xl text-gray-300">{med.dosage}</p>
            </div>
            <button
              onClick={() => toggleMed(med.id)}
              aria-label={`${med.name} ilacını ${med.taken ? 'alınmadı' : 'alındı'} olarak işaretle`}
              className={`px-8 py-4 text-2xl font-bold rounded-xl border-4 focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none w-full sm:w-auto ${
                med.taken
                  ? "bg-green-600 text-white border-green-600"
                  : "bg-black text-white border-white hover:bg-gray-800"
              }`}
            >
              {med.taken ? "ALINDI" : "ALINMADI"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
