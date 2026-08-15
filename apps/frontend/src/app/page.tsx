"use client";

import UploadDocument from "@/components/UploadDocument";
import MedicationDashboard from "@/components/MedicationDashboard";

export default function Home() {
  return (
    <div className="flex-1 p-4 md:p-8 space-y-12 max-w-4xl mx-auto w-full">
      <header className="text-center py-8">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">MediSade</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Sağlığınız için anlaşılır rehberiniz
        </p>
      </header>

      <section>
        <MedicationDashboard />
      </section>

      <section>
        <UploadDocument />
      </section>
    </div>
  );
}
