import { UploadDocument } from "@/components/UploadDocument";
import { MedicationDashboard } from "@/components/MedicationDashboard";

export default function Home() {
  return (
    <div className="flex flex-col gap-8 w-full">
      <header className="text-center py-4">
        <h1 className="text-3xl font-bold">MediSade</h1>
        <p className="text-lg opacity-80 mt-2">Sağlığınız için anlaşılır rehber</p>
      </header>

      <section aria-labelledby="upload-section">
        <h2 id="upload-section" className="text-2xl font-bold mb-4">Rapor Yükle</h2>
        <UploadDocument />
      </section>

      <section aria-labelledby="medication-section">
        <h2 id="medication-section" className="text-2xl font-bold mb-4">Günlük İlaçlarım</h2>
        <MedicationDashboard />
      </section>
    </div>
  );
}
