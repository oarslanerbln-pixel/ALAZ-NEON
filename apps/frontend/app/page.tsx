import { UploadDocument } from "@/components/UploadDocument";
import { MedicationDashboard } from "@/components/MedicationDashboard";

export default function Home() {
  return (
    <div className="flex flex-col gap-16 pb-20">

      <section className="bg-black border-4 border-[#ffff00] rounded-3xl p-6 sm:p-10 shadow-[0_0_20px_rgba(255,255,0,0.2)]">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-center mb-8 uppercase tracking-wide">
          Raporunuzu Yükleyin
        </h1>
        <UploadDocument />
      </section>

      <section className="bg-black border-4 border-[#ffff00] rounded-3xl p-6 sm:p-10 shadow-[0_0_20px_rgba(255,255,0,0.2)]">
        <MedicationDashboard />
      </section>

    </div>
  );
}
