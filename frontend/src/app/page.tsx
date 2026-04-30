import UploadDocument from "@/components/UploadDocument";
import MedicationDashboard from "@/components/MedicationDashboard";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">MediSade</h1>
        <p className="text-xl">Sağlığınız için sade çözümler</p>
      </header>

      <div className="flex flex-col gap-8 items-center w-full">
        <UploadDocument />
        <MedicationDashboard />
      </div>
    </div>
  );
}
