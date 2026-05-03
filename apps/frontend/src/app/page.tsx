import UploadDocument from "@/components/UploadDocument";
import MedicationDashboard from "@/components/MedicationDashboard";

export default function Home() {
  return (
    <div className="flex flex-col gap-12 pb-12">
      <header className="w-full text-center py-6 border-b-4 border-yellow-400">
        <h1 className="text-4xl font-bold tracking-tight">MediSade</h1>
        <p className="text-xl mt-2 font-medium">
          Sağlığınız İçin Basit Çözümler
        </p>
      </header>

      <UploadDocument />
      <MedicationDashboard />
    </div>
  );
}
