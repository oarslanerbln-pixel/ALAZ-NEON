import { UploadDocument } from "@/components/UploadDocument";
import { MedicationDashboard } from "@/components/MedicationDashboard";

export default function Home() {
  return (
    <div className="w-full flex flex-col items-center justify-start pb-20">
      <h1 className="text-4xl font-extrabold mb-2 text-center mt-4">MediSade</h1>
      <p className="text-xl text-zinc-300 text-center mb-8">Sağlığınız için anlaşılır rehber</p>

      <UploadDocument />
      <MedicationDashboard />
    </div>
  );
}
