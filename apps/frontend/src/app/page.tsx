import UploadDocument from "@/components/UploadDocument";
import MedicationDashboard from "@/components/MedicationDashboard";

export default function Home() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-4xl mb-8 text-center">MediSade</h1>
      <UploadDocument />
      <MedicationDashboard />
    </div>
  );
}
