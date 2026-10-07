"use client";

import { useState } from "react";
import UploadDocument from "@/components/UploadDocument";
import MedicationDashboard from "@/components/MedicationDashboard";
import { type Locale } from "@/lib/i18n";

export default function Home() {
  const [locale, setLocale] = useState<Locale>("tr");

  return (
    <main className="min-h-screen p-4 pb-20 max-w-2xl mx-auto">
      <header className="flex justify-between items-center mb-8 border-b-4 border-yellow-400 pb-4">
        <h1 className="text-4xl font-extrabold text-cyan-400">MediSade</h1>

        {/* Accessible Language Selector */}
        <fieldset className="flex gap-4 p-2 border-2 border-cyan-400 rounded-lg">
          <legend className="sr-only">Dil Seçimi</legend>
          <label className="flex items-center gap-2 cursor-pointer text-xl font-bold">
            <input
              type="radio"
              name="locale"
              value="tr"
              checked={locale === "tr"}
              onChange={() => setLocale("tr")}
              className="w-6 h-6 accent-cyan-400"
            />
            TR
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-xl font-bold">
            <input
              type="radio"
              name="locale"
              value="en"
              checked={locale === "en"}
              onChange={() => setLocale("en")}
              className="w-6 h-6 accent-cyan-400"
            />
            EN
          </label>
          <label className="flex items-center gap-2 cursor-pointer text-xl font-bold">
            <input
              type="radio"
              name="locale"
              value="ar"
              checked={locale === "ar"}
              onChange={() => setLocale("ar")}
              className="w-6 h-6 accent-cyan-400"
            />
            AR
          </label>
        </fieldset>
      </header>

      <UploadDocument locale={locale} />
      <MedicationDashboard locale={locale} />
    </main>
  );
}
