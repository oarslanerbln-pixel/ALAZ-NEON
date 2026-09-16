import UploadDocument from "@/components/UploadDocument";
import MedicationDashboard from "@/components/MedicationDashboard";

export default function Home() {
  return (
    <main className="max-w-4xl mx-auto p-4 md:p-8">
      <header className="mb-8 border-b-4 border-interactive pb-4">
        <h1 className="text-4xl font-bold text-interactive">MediSade</h1>
        <p className="text-xl mt-2">Sağlığınız için sade ve anlaşılır raporlar</p>
      </header>

      <section className="mb-12">
        <UploadDocument />
      </section>

      <section>
        <MedicationDashboard />
      </section>
    </main>
  );
}
