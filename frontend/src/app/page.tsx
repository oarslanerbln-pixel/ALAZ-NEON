"use client";

import { useState } from "react";
import UploadDocument from "@/components/UploadDocument";

// Mock medication data for the MVP skeleton
const initialMedications = [
  { id: "1", name: "Parol 500mg", dosage: "Sabah 1 Tok", taken: false },
  { id: "2", name: "Tansiyon İlacı", dosage: "Akşam 1 Aç", taken: false },
];

export default function Home() {
  const [medications, setMedications] = useState(initialMedications);
  const [activeTab, setActiveTab] = useState<"dashboard" | "upload">("dashboard");

  const toggleMedication = (id: string) => {
    setMedications(medications.map(med =>
      med.id === id ? { ...med, taken: !med.taken } : med
    ));
  };

  const handleKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleMedication(id);
    }
  };

  return (
    <div className="flex flex-col gap-8 max-w-2xl mx-auto w-full">
      <header className="flex flex-col gap-4 border-b border-gray-700 pb-6">
        <h1 className="text-4xl font-bold text-center tracking-tight">MediSade</h1>

        {/* Navigation Tabs */}
        <div className="flex rounded-lg overflow-hidden border border-gray-700 mt-2">
          <button
            className={`flex-1 py-4 text-xl font-bold transition-colors ${activeTab === "dashboard" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}
            onClick={() => setActiveTab("dashboard")}
            aria-pressed={activeTab === "dashboard"}
          >
            İlaç Takibi
          </button>
          <button
            className={`flex-1 py-4 text-xl font-bold transition-colors ${activeTab === "upload" ? "bg-blue-600 text-white" : "bg-gray-800 text-gray-300 hover:bg-gray-700"}`}
            onClick={() => setActiveTab("upload")}
            aria-pressed={activeTab === "upload"}
          >
            Rapor Yükle
          </button>
        </div>
      </header>

      {activeTab === "dashboard" && (
        <section aria-labelledby="medications-heading" className="flex flex-col gap-6">
          <h2 id="medications-heading" className="text-2xl font-bold">Günlük İlaçlarım</h2>

          <div className="flex flex-col gap-4">
            {medications.map((med) => (
              <div
                key={med.id}
                role="button"
                tabIndex={0}
                aria-pressed={med.taken}
                onClick={() => toggleMedication(med.id)}
                onKeyDown={(e) => handleKeyDown(e, med.id)}
                className={`flex justify-between items-center p-6 rounded-xl border-4 transition-all focus:outline-none focus-visible:ring-4 focus-visible:ring-blue-400 cursor-pointer ${
                  med.taken
                    ? "bg-green-900 border-green-500 opacity-90"
                    : "bg-gray-800 border-gray-600 hover:border-gray-400"
                }`}
              >
                <div>
                  <h3 className={`text-3xl font-bold ${med.taken ? "line-through text-gray-300" : "text-white"}`}>
                    {med.name}
                  </h3>
                  <p className="text-xl text-gray-300 mt-2">{med.dosage}</p>
                </div>

                <div className={`flex items-center justify-center w-16 h-16 rounded-full border-4 ${
                  med.taken ? "bg-green-500 border-green-400" : "bg-transparent border-gray-500"
                }`}>
                  {med.taken && (
                    <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {activeTab === "upload" && (
        <section aria-labelledby="upload-heading">
          <h2 id="upload-heading" className="sr-only">Rapor Yükleme</h2>
          <UploadDocument />
        </section>
      )}
    </div>
  );
}
