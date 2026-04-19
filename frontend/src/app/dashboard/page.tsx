"use client";

import { useState } from "react";
import { CheckCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";

type Medication = {
  id: string;
  name: string;
  time: string;
  taken: boolean;
};

export default function DashboardPage() {
  const [meds, setMeds] = useState<Medication[]>([
    { id: "1", name: "Tansiyon İlacı", time: "Sabah (08:00)", taken: false },
    { id: "2", name: "Vitamin D", time: "Öğle (13:00)", taken: false },
    { id: "3", name: "Kalp İlacı", time: "Akşam (20:00)", taken: false },
  ]);

  const toggleTaken = (id: string) => {
    setMeds(meds.map(med => med.id === id ? { ...med, taken: !med.taken } : med));
  };

  return (
    <div className="flex flex-col p-6 space-y-6 max-w-2xl mx-auto w-full">
      <h1 className="text-3xl font-bold border-b-2 border-white pb-2">
        Günlük İlaçlarım
      </h1>

      <div className="flex flex-col space-y-4">
        {meds.map((med) => (
          <div
            key={med.id}
            className={`p-6 rounded-2xl border-4 transition-colors flex items-center justify-between ${
              med.taken ? 'bg-green-900 border-green-500' : 'bg-gray-900 border-gray-600'
            }`}
          >
            <div className="flex flex-col space-y-2">
              <h2 className="text-2xl font-bold">{med.name}</h2>
              <div className="flex items-center text-gray-300 text-lg">
                <Clock className="w-5 h-5 mr-2" />
                {med.time}
              </div>
            </div>

            <button
              onClick={() => toggleTaken(med.id)}
              className={`p-4 rounded-xl font-bold text-lg flex items-center focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400 ${
                med.taken ? 'bg-green-500 text-black' : 'bg-white text-black hover:bg-gray-200'
              }`}
              aria-pressed={med.taken}
              aria-label={`${med.name} alındı olarak işaretle`}
            >
              {med.taken ? (
                <>
                  <CheckCircle className="w-6 h-6 mr-2" />
                  Alındı
                </>
              ) : (
                "Almadım"
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
