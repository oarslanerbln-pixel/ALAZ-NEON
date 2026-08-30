import UploadDocument from "./components/UploadDocument";
import MedicationDashboard from "./components/MedicationDashboard";

export default function Home() {
  return (
    <div className="flex flex-col gap-12 py-8 pb-16">
      <header className="px-4 text-center">
        <h1 className="text-4xl font-extrabold text-yellow-400 tracking-tight">
          MediSade
        </h1>
        <p className="mt-2 text-xl text-cyan-400 font-medium">
          Sağlığınız İçin Sade Çözüm
        </p>
      </header>

      <section>
        <MedicationDashboard />
      </section>

      <div className="w-full max-w-md mx-auto px-4">
        <div className="h-1 w-full bg-cyan-900 rounded-full" />
      </div>

      <section>
        <UploadDocument />
      </section>
    </div>
  );
}
