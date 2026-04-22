import UploadDocument from "@/components/UploadDocument";
import MedicationDashboard from "@/components/MedicationDashboard";

export default function Home() {
  return (
    <div className="flex flex-col items-center gap-12 w-full max-w-4xl mx-auto">
      <header className="w-full text-center py-6 border-b-4 border-hc-text">
        <h1 className="text-4xl md:text-5xl font-extrabold text-hc-accent">MediSade</h1>
        <p className="mt-2 text-xl font-bold">Sağlığınız, Sade ve Anlaşılır</p>
      </header>

      <section className="w-full">
        <UploadDocument />
      </section>

      <section className="w-full">
        <MedicationDashboard />
      </section>
    </div>
  );
}
