import UploadDocument from "@/components/UploadDocument";
import MedicationDashboard from "@/components/MedicationDashboard";

export default function Home() {
  return (
    <div className="min-h-screen p-4 sm:p-8 font-[family-name:var(--font-geist-sans)] pb-20">
      <main className="flex flex-col gap-12 items-center justify-center">
        <div className="text-center mt-8">
          <h1 className="text-5xl font-extrabold text-cyan-400 mb-4 tracking-wider uppercase">MediSade</h1>
          <p className="text-xl text-yellow-300 font-bold">Sağlığınız için Sade Çözümler</p>
        </div>

        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
          <UploadDocument locale="tr" />
          <MedicationDashboard locale="tr" />
        </div>
      </main>
    </div>
  );
}
