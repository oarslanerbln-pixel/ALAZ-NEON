"use client";

import { useState } from "react";
import UploadDocument from "@/components/UploadDocument";
import { CheckCircle2, Clock } from "lucide-react";

type Medication = {
  id: string;
  name: string;
  dosage: string;
  time: string;
  taken: boolean;
};

const initialMedications: Medication[] = [
  { id: "1", name: "Parol", dosage: "500mg", time: "08:00", taken: false },
  { id: "2", name: "Tansiyon İlacı", dosage: "1 Adet", time: "09:00", taken: false },
  { id: "3", name: "Vitamin C", dosage: "1000mg", time: "12:00", taken: true },
];

export default function Home() {
  const [medications, setMedications] = useState<Medication[]>(initialMedications);

  const toggleTaken = (id: string) => {
    setMedications(medications.map(med =>
      med.id === id ? { ...med, taken: !med.taken } : med
    ));
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-extrabold text-yellow-400 mb-2">MediSade</h1>
        <p className="text-xl font-medium">Sağlığınız İçin Sade Çözüm</p>
      </header>

      <UploadDocument />

      <section className="mt-12">
        <h2 className="text-3xl font-bold mb-6 text-yellow-400 border-b-2 border-yellow-600 pb-2">
          Bugünkü İlaçlarınız
        </h2>

        <div className="flex flex-col gap-4">
          {medications.map((med) => (
            <div
              key={med.id}
              className={`p-6 rounded-xl border-4 transition-colors flex items-center justify-between ${
                med.taken ? 'border-green-600 bg-green-950' : 'border-yellow-400 bg-black'
              }`}
            >
              <div>
                <h3 className="text-2xl font-bold mb-1">{med.name}</h3>
                <p className="text-lg opacity-90">{med.dosage}</p>
                <div className="flex items-center mt-2 opacity-80">
                  <Clock size={20} className="mr-2" />
                  <span className="text-lg font-bold">{med.time}</span>
                </div>
              </div>

              <button
                onClick={() => toggleTaken(med.id)}
                aria-pressed={med.taken}
                className={`flex items-center justify-center p-4 rounded-full border-4 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white transition-transform active:scale-95 ${
                  med.taken ? 'border-green-400 text-green-400 bg-green-900' : 'border-yellow-400 text-yellow-400 hover:bg-yellow-900'
                }`}
                aria-label={`${med.name} ilacını ${med.taken ? 'alınmadı' : 'alındı'} olarak işaretle`}
              >
                <CheckCircle2 size={40} />
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
