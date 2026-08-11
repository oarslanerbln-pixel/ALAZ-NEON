"use client";
import { useState } from 'react';
import { CheckCircle } from 'lucide-react';

export default function MedicationDashboard() {
  const [taken, setTaken] = useState(false);

  return (
    <div className="p-4 mt-6 border-2 border-yellow-400 rounded-lg bg-black text-yellow-400">
      <h2 className="text-xl font-bold mb-4">Bugünkü İlaçlarınız</h2>
      <div className="flex items-center justify-between p-4 border border-yellow-400 rounded">
        <div>
          <p className="text-lg font-bold">Tansiyon İlacı</p>
          <p className="text-base">Sabah - Tok karnına</p>
        </div>
        <button
          onClick={() => setTaken(true)}
          disabled={taken}
          className={`flex items-center gap-2 p-4 font-bold text-lg rounded-lg focus-visible:ring-4 focus-visible:ring-yellow-400 focus-visible:outline-none ${
            taken ? 'bg-green-600 text-white border-2 border-transparent' : 'bg-yellow-400 text-black border-2 border-yellow-400'
          }`}
        >
          <CheckCircle size={24} />
          {taken ? 'Alındı' : 'Alındı İşaretle'}
        </button>
      </div>
    </div>
  );
}
