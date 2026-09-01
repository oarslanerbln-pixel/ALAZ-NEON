import UploadDocument from "@/components/UploadDocument";
import MedicationDashboard from "@/components/MedicationDashboard";

export default function Home() {
  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-[#00ffff]">MediSade</h1>
      <UploadDocument />
      <MedicationDashboard />
    </div>
  );
}
