import UploadDocument from '@/components/UploadDocument';
import MedicationDashboard from '@/components/MedicationDashboard';

export default function Home() {
  return (
    <div className="space-y-8 pb-12">
      <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 shadow-xl">
        <h2 className="text-3xl font-bold text-white mb-2">Merhaba, hoş geldiniz!</h2>
        <p className="text-gray-300 text-xl">
          Doktorunuzun verdiği raporu kameradan okutarak sade bir dille anlayabilir veya günlük ilaçlarınızı takip edebilirsiniz.
        </p>
      </div>

      <UploadDocument />
      <MedicationDashboard />
    </div>
  );
}
