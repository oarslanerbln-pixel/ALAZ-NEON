import UploadDocument from "@/components/UploadDocument";
import MedicationDashboard from "@/components/MedicationDashboard";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-yellow-400 p-4 sm:p-8">
      <div className="max-w-4xl mx-auto space-y-12">
        <header className="text-center mb-12 border-b-4 border-cyan-400 pb-8">
          <h1 className="text-5xl font-extrabold text-cyan-400 mb-4 tracking-tight">MediSade</h1>
          <p className="text-2xl font-bold">Sağlığınız için sade ve anlaşılır bilgiler.</p>
        </header>

        <UploadDocument />
        <MedicationDashboard />
      </div>
    </main>
  );
}
