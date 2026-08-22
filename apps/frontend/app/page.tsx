import UploadDocument from "@/components/UploadDocument";
import MedicationDashboard from "@/components/MedicationDashboard";

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto space-y-12 pb-20">
      <header className="py-6 border-b-4 border-yellow-400 mb-8">
        <h1 className="text-4xl font-bold text-yellow-400 text-center">
          MediSade
        </h1>
        <p className="text-xl text-cyan-400 text-center mt-2">
          Sağlığınız için sade ve anlaşılır
        </p>
      </header>

      <UploadDocument />
      <MedicationDashboard />
    </div>
  );
}
