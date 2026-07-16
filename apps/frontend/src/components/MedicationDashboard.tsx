"use client";
import { useState } from "react";
import { Pill } from "lucide-react";

export default function MedicationDashboard() {
  const [taken, setTaken] = useState(false);

  return (
    <div className="flex flex-col gap-6 w-full">
      <h2 className="text-3xl font-bold text-yellow-400 mb-2">Günlük İlaçlarım</h2>

      <div className="bg-black p-6 rounded-2xl border-4 border-gray-600 flex flex-col gap-6">
        <div className="flex items-center gap-6">
          <Pill size={64} className="text-yellow-400" />
          <div>
            <h3 className="text-2xl font-bold text-white mb-1">Parol 500mg</h3>
            <p className="text-xl text-gray-400">Sabah - Tok Karnına</p>
          </div>
        </div>

        <button
          onClick={() => setTaken(true)}
          disabled={taken}
          className={`w-full py-8 rounded-xl text-3xl font-bold transition-colors focus-visible:ring-4 focus-visible:ring-white focus-visible:outline-none ${
            taken
            ? "bg-green-600 text-white border-4 border-green-500 disabled:cursor-not-allowed opacity-80"
            : "bg-black text-yellow-400 border-4 border-yellow-400 hover:bg-gray-900"
          }`}
        >
          {taken ? "Alındı" : "İlacı Aldım"}
        </button>
      </div>
    </div>
  );
}