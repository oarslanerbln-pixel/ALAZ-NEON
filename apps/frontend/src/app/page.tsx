import UploadDocument from '@/components/UploadDocument';
import MedicationDashboard from '@/components/MedicationDashboard';

export default function Home() {
  return (
    <div className="flex flex-col gap-16 py-8">
      <header className="text-center">
        <h1 className="text-4xl font-bold text-primary mb-4">MediSade</h1>
        <p className="text-xl">Sağlık Raporlarınız Artık Daha Anlaşılır</p>
      </header>

      <UploadDocument />

      <MedicationDashboard />
    </div>
  );
}
