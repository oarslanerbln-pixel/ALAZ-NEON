import UploadDocument from '@/components/UploadDocument';
import MedicationDashboard from '@/components/MedicationDashboard';

export default function Home() {
  return (
    <main className="min-h-screen p-8 text-lg bg-black text-yellow-500 font-sans">
      <h1 className="text-4xl font-bold text-center text-cyan-500 mb-12">MediSade</h1>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
        <section>
          <UploadDocument />
        </section>
        <section>
          <MedicationDashboard />
        </section>
      </div>
    </main>
  );
}
