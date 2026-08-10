import UploadDocument from "./components/UploadDocument";
import MedicationDashboard from "./components/MedicationDashboard";

export default function Home() {
  return (
    <div className="space-y-12 py-8">
      <header className="text-center px-4">
        <h1 className="text-4xl font-bold text-yellow-400 mb-2">MediSade</h1>
        <p className="text-xl text-neutral-300">
          Sağlığınız için anlaşılır çözümler
        </p>
      </header>

      <UploadDocument />

      <div className="w-full h-px bg-neutral-800 my-8" />

      <MedicationDashboard />
    </div>
  );
}
