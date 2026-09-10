import UploadDocument from "@/components/UploadDocument";
import MedicationDashboard from "@/components/MedicationDashboard";

export default function Home() {
  return (
    <div className="flex flex-col gap-12 w-full max-w-4xl mx-auto py-8">
      <header className="text-center mb-8">
        <h1 className="text-5xl font-extrabold text-cyan-400 mb-4 tracking-tight">MediSade</h1>
        <p className="text-2xl text-yellow-400 font-medium">Sağlığınız için sade ve anlaşılır.</p>
      </header>

      <section className="w-full">
        <UploadDocument />
      </section>

      <div className="h-1 w-full bg-zinc-800 rounded-full my-4" />

      <section className="w-full">
        <MedicationDashboard />
      </section>
    </div>
  );
}
