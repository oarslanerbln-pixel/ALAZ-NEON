import { UploadDocument } from "@/components/UploadDocument";
import { MedicationDashboard } from "@/components/MedicationDashboard";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-start min-h-screen p-8 gap-16 w-full max-w-5xl mx-auto">
      <header className="w-full text-center">
        <h1 className="text-5xl font-extrabold text-yellow-300 tracking-tight">MediSade</h1>
        <p className="mt-4 text-2xl text-gray-300 font-medium">Sağlık Raporu Sadeleştirici ve İlaç Takibi</p>
      </header>

      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-start">
        <section aria-labelledby="upload-section-title">
          <h2 id="upload-section-title" className="sr-only">Rapor Yükleme</h2>
          <UploadDocument />
        </section>

        <section aria-labelledby="medication-section-title">
          <h2 id="medication-section-title" className="sr-only">İlaç Takibi</h2>
          <MedicationDashboard />
        </section>
      </div>
    </main>
  );
}
