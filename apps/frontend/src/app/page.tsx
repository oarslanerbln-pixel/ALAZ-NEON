import { UploadDocument } from "@/components/UploadDocument";
import { MedicationDashboard } from "@/components/MedicationDashboard";

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <header className="text-center py-8 border-b-4 border-black">
        <h1 className="text-5xl font-bold mb-4">MediSade</h1>
        <p className="text-2xl">
          Sağlığınız için raporlarınızı anlaşılır dile çeviriyoruz.
        </p>
      </header>

      <UploadDocument />
      <MedicationDashboard />
    </div>
  );
}
