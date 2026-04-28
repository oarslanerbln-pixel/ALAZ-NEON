import UploadDocument from "@/components/UploadDocument";
import MedicationDashboard from "@/components/MedicationDashboard";

export default function Home() {
  return (
    <div className="flex flex-col gap-8 pb-12">
      <header className="text-center pb-8 border-b-4 border-yellow-400">
        <h1 className="text-4xl md:text-5xl font-black mb-2">MediSade</h1>
        <p className="text-xl font-bold">Sağlık Asistanınız</p>
      </header>

      <UploadDocument />

      <MedicationDashboard />
    </div>
  );
}
