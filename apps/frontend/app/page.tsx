import { UploadDocument } from "../components/UploadDocument";
import { MedicationDashboard } from "../components/MedicationDashboard";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center font-sans space-y-8 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold text-center">MediSade</h1>
      <UploadDocument />
      <MedicationDashboard />
    </div>
  );
}
