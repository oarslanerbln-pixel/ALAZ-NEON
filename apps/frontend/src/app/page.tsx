import MedicationDashboard from "@/components/MedicationDashboard";
import UploadDocument from "@/components/UploadDocument";

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto w-full flex flex-col gap-8 pb-12">
      <h1 className="text-4xl font-bold text-center mt-6 text-[#00ffff]">MediSade</h1>
      <p className="text-2xl text-center mb-4">Sağlığınız için anlaşılır asistanınız</p>

      <MedicationDashboard />
      <UploadDocument />
    </div>
  );
}
