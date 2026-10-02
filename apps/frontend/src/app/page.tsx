"use client";

import { useState } from "react";
import Link from "next/link";
import { t, Language } from "@/lib/i18n";

export default function Home() {
  const [lang, setLang] = useState<Language>("TR");
  const [medications, setMedications] = useState([
    { id: 1, name: "Aspirin 100mg", taken: false },
    { id: 2, name: "Tansiyon İlacı 50mg", taken: false },
  ]);

  const handleTaken = (id: number) => {
    setMedications((prev) =>
      prev.map((med) => (med.id === id ? { ...med, taken: true } : med))
    );
  };

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-8">
      <div className="flex justify-center gap-4 mb-8">
        {(["TR", "EN", "AR"] as Language[]).map((l) => (
          <button
            key={l}
            onClick={() => setLang(l)}
            aria-label={`Select ${l} language`}
            className={`px-6 py-3 font-bold text-xl rounded-lg focus-visible-ring ${
              lang === l ? "bg-yellow-400 text-black" : "bg-black text-yellow-400 border-2 border-yellow-400"
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      <h1 className="text-4xl font-bold text-center mb-8">{t("medication.title", lang)}</h1>

      <div className="space-y-4">
        {medications.map((med) => (
          <div
            key={med.id}
            className="flex items-center justify-between p-6 bg-gray-900 border-2 border-cyan-500 rounded-xl"
          >
            <span className="text-2xl font-bold">{med.name}</span>
            <button
              onClick={() => handleTaken(med.id)}
              disabled={med.taken}
              aria-label={`${t("medication.taken", lang)} ${med.name}`}
              className={`px-8 py-4 font-bold text-2xl rounded-xl focus-visible-ring ${
                med.taken
                  ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                  : "bg-cyan-500 text-black hover:bg-cyan-400"
              }`}
            >
              {med.taken ? "✔" : t("medication.taken", lang)}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-12 flex justify-center">
        <Link
          href="/upload"
          className="inline-block px-8 py-4 bg-yellow-400 text-black font-bold text-2xl rounded-xl hover:bg-yellow-300 focus-visible-ring"
        >
          {t("upload.title", lang)}
        </Link>
      </div>
    </div>
  );
}
