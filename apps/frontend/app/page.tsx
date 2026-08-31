import UploadDocument from "./components/UploadDocument";
import MedicationDashboard from "./components/MedicationDashboard";

export default function Home() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <section>
        <h2 className="text-3xl font-bold mb-4">Rapor Sadeleştirme</h2>
        <UploadDocument />
      </section>

      <section>
        <h2 className="text-3xl font-bold mb-4">Günlük Takip</h2>
        <MedicationDashboard />
      </section>
    </div>
  );
}
