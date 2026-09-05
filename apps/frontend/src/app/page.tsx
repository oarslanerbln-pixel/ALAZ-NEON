import UploadDocument from "../components/UploadDocument";
import MedicationDashboard from "../components/MedicationDashboard";

export default function Home() {
  return (
    <main className="container mx-auto max-w-4xl p-4">
      <header className="mb-8">
        <h1 className="text-4xl font-bold text-interactive mb-2">MediSade</h1>
        <p className="text-2xl font-bold">Sağlığınız için anlaşılır rehberiniz.</p>
      </header>

      <UploadDocument />
      <MedicationDashboard />
    </main>
  );
}
