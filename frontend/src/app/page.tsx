import UploadDocument from "@/components/UploadDocument";
import MedicationDashboard from "@/components/MedicationDashboard";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8">
      <h1 className="text-3xl font-bold mb-8">MediSade</h1>
      <div className="w-full max-w-md flex flex-col gap-8">
        <UploadDocument />
        <MedicationDashboard />
      </div>
    </main>
  );
}