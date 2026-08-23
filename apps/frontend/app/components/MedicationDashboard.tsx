"use client";

import React, { useState } from "react";
import { useTranslation } from "react-i18next";

export default function MedicationDashboard() {
  const { t } = useTranslation();

  // Dummy data for MVP
  const [meds, setMeds] = useState([
    { id: 1, name: "Tansiyon İlacı", time: "Sabah", taken: false },
    { id: 2, name: "Vitamin", time: "Öğle", taken: false }
  ]);

  const toggleTaken = (id: number) => {
    setMeds(meds.map(m => m.id === id ? { ...m, taken: !m.taken } : m));
  };

  return (
    <div className="border-4 border-foreground p-6 my-4">
      <h2 className="text-2xl font-bold mb-4">{t("medications")}</h2>
      <div className="flex flex-col gap-4">
        {meds.map((med) => (
          <div key={med.id} className="flex justify-between items-center p-4 border-2 border-foreground">
            <div>
              <p className="text-xl font-bold">{med.name}</p>
              <p className="text-lg">{med.time}</p>
            </div>
            <button
              onClick={() => toggleTaken(med.id)}
              className={`px-6 py-3 text-xl font-bold border-4 focus:outline-none focus:ring-4 focus:ring-interactive ${
                med.taken ? "bg-success text-black border-success" : "bg-transparent border-foreground hover:bg-foreground hover:text-black"
              }`}
              aria-pressed={med.taken}
            >
              {med.taken ? t("taken") : t("taken")}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
