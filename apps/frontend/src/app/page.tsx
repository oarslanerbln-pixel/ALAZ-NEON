import UploadDocument from '../components/UploadDocument';
import MedicationDashboard from '../components/MedicationDashboard';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center p-8 max-w-4xl mx-auto gap-8">
      <header className="w-full text-center py-6 border-b-4 border-cyan-400">
        <h1 className="text-5xl font-extrabold text-cyan-400 tracking-wider">MediSade</h1>
        <p className="text-2xl mt-4 text-yellow-400 font-bold">Sağlığınız İçin Sade Bir Dil</p>
      </header>

      <div className="w-full">
        <UploadDocument />
      </div>

      <div className="w-full">
        <MedicationDashboard />
      </div>
    </main>
  );
}
