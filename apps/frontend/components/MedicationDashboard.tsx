"use client";
import { useState } from "react";

export function MedicationDashboard() {
  const [taken, setTaken] = useState(false);

  return (
    <div className="w-full p-4 border-2 border-yellow-400 rounded-lg bg-black text-cyan-400 flex flex-col gap-4">
      <h2 className="text-2xl font-bold">Bugünkü İlaçlarınız</h2>
      <div className="flex justify-between items-center p-4 bg-gray-900 rounded-md">
        <span className="text-xl">Parol 500mg (Sabah)</span>
        <button
          onClick={() => setTaken(!taken)}
          className={`px-6 py-3 text-lg font-bold rounded ${taken ? 'bg-green-600 text-white' : 'bg-cyan-400 text-black'} focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400`}
        >
          {taken ? "Alındı" : "Al"}
        </button>
      </div>
    </div>
  );
}
