import UploadDocument from '@/components/UploadDocument';
import MedicationDashboard from '@/components/MedicationDashboard';

export default function Home() {
  return (
    <div className="max-w-md mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">MediSade</h1>
      <UploadDocument />
      <MedicationDashboard />
    </div>
  );
}
