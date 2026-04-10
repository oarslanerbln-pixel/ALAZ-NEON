import UploadDocument from "@/components/UploadDocument";
import MedicationDashboard from "@/components/MedicationDashboard";

export default function Home() {
  return (
    <div className="flex flex-col gap-12">
      <section aria-labelledby="upload-section">
        <h2 id="upload-section" className="text-2xl font-bold mb-6 text-yellow-400 border-b-2 border-yellow-400 pb-2">Rapor Yükle</h2>
        <UploadDocument />
      </section>

      <section aria-labelledby="medications-section">
        <h2 id="medications-section" className="text-2xl font-bold mb-6 text-cyan-400 border-b-2 border-cyan-400 pb-2">Günlük İlaçlarım</h2>
        <MedicationDashboard />
      </section>
    </div>
  );
}
