import UploadDocument from "@/components/UploadDocument";
import MedicationDashboard from "@/components/MedicationDashboard";

export default function Home() {
  return (
    <div className="flex flex-col gap-12 pb-12">
      <header className="py-6 border-b-2 border-yellow-800 mb-4">
        <h1 className="text-4xl font-extrabold text-center">MediSade</h1>
        <p className="text-center text-xl mt-2 opacity-90">Sağlığınız İçin Sadeleştirilmiş Rehberiniz</p>
      </header>

      <UploadDocument />
      <MedicationDashboard />
    </div>
  );
}
