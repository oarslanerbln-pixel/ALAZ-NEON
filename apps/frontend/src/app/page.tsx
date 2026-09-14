import UploadDocument from "@/components/UploadDocument";
import MedicationDashboard from "@/components/MedicationDashboard";

export default function Home() {
  return (
    <main className="flex flex-col items-center w-full">
      <h1 className="text-4xl font-bold my-6 text-center tracking-wider text-[#00ffff]">MediSade</h1>

      <UploadDocument />
      <MedicationDashboard />
    </main>
  );
}
