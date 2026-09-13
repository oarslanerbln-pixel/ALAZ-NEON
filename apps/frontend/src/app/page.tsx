import UploadDocument from "@/components/UploadDocument";
import MedicationDashboard from "@/components/MedicationDashboard";

export default function Home() {
  return (
    <div className="flex flex-col gap-16 pb-20">
      <header className="text-center">
        <h1 className="text-5xl font-extrabold mb-4 text-[--color-interactive]">MediSade</h1>
        <p className="text-2xl font-bold">Sağlığınız için sade ve anlaşılır bilgiler.</p>
      </header>

      <UploadDocument />
      <MedicationDashboard />
    </div>
  );
}
