import { UploadDocument } from "@/components/UploadDocument";
import { MedicationPanel } from "@/components/MedicationPanel";

export default function Home() {
  return (
    <div className="flex flex-col gap-16 py-8">
      <header className="text-center mb-8">
        <h1 className="text-5xl font-black mb-4">MediSade</h1>
        <p className="text-2xl font-bold">Sağlık Raporlarınızı Anlayın, İlaçlarınızı Takip Edin</p>
      </header>

      <UploadDocument />

      <MedicationPanel />
    </div>
  );
}
