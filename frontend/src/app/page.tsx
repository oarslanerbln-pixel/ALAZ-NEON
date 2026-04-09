import UploadDocument from "@/components/UploadDocument";
import MedicationDashboard from "@/components/MedicationDashboard";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white p-4 font-sans selection:bg-white selection:text-black">
      <div className="max-w-2xl mx-auto space-y-12">
        <header className="text-center py-8">
          <h1 className="text-4xl font-extrabold tracking-tight border-b-4 border-white pb-4 inline-block">MediSade</h1>
          <p className="mt-4 text-xl font-bold">Sağlığınız İçin Sade Çözüm</p>
        </header>

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
