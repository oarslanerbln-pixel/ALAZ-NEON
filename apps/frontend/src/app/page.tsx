import UploadDocument from "@/components/UploadDocument";
import MedicationDashboard from "@/components/MedicationDashboard";

export default function Home() {
  return (
    <div className="flex flex-col gap-8 pb-12">
      <header className="text-center py-6">
        <h1 className="text-4xl font-bold text-[var(--primary)] mb-2">MediSade</h1>
        <p className="text-xl">Sağlığınız için sade ve anlaşılır.</p>
      </header>

      <section>
        <UploadDocument />
      </section>

      <section>
        <MedicationDashboard />
      </section>
    </div>
  );
}
