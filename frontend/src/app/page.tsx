import UploadDocument from "@/components/UploadDocument";
import MedicationDashboard from "@/components/MedicationDashboard";

export default function Home() {
  return (
    <>
      <header className="mb-8 text-center border-b-4 border-[var(--color-hc-border)] pb-4">
        <h1 className="text-4xl font-black text-[var(--color-hc-accent)]">MediSade</h1>
        <p className="text-xl font-bold mt-2">Sağlığınız, Sade ve Anlaşılır</p>
      </header>

      <UploadDocument />

      <MedicationDashboard />
    </>
  );
}
