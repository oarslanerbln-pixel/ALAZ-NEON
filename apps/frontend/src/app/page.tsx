import UploadDocument from "@/components/UploadDocument";
import MedicationDashboard from "@/components/MedicationDashboard";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center bg-black text-white font-sans p-4">
      <main className="flex flex-1 w-full max-w-4xl flex-col items-center gap-8 py-8">
        <h1 className="text-4xl font-bold text-yellow-400 text-center mb-8">MediSade</h1>

        <UploadDocument />
        <MedicationDashboard />

      </main>
    </div>
  );
}
