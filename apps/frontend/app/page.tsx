import UploadDocument from "@/components/UploadDocument";
import MedicationPanel from "@/components/MedicationPanel";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 sm:p-8 space-y-12 pb-24">
      <header className="w-full text-center py-6">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-[var(--foreground)] tracking-tight">
          MediSade
        </h1>
        <p className="mt-4 text-xl sm:text-2xl text-[var(--foreground)] opacity-90 max-w-3xl mx-auto">
          Tıbbi raporlarınızı kolayca anlayın ve ilaçlarınızı takip edin.
        </p>
      </header>

      <main className="w-full max-w-4xl mx-auto flex flex-col gap-12">
        <UploadDocument />
        <MedicationPanel />
      </main>
    </div>
  );
}
