import { UploadDocument } from "../components/UploadDocument";
import { MedicationDashboard } from "../components/MedicationDashboard";

export default function Home() {
  return (
    <main className="w-full max-w-md flex flex-col gap-8">
      <h1 className="text-3xl font-bold text-center mb-8">MediSade</h1>
      <UploadDocument />
      <MedicationDashboard />
    </main>
  );
}