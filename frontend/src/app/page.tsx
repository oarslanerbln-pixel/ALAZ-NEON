import UploadDocument from "@/components/UploadDocument";
import MedicationDashboard from "@/components/MedicationDashboard";

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto space-y-12">
      <section className="bg-gray-100 p-6 rounded-2xl border-4 border-black">
        <UploadDocument />
      </section>

      <section className="bg-gray-100 p-6 rounded-2xl border-4 border-black">
        <MedicationDashboard />
      </section>
    </div>
  );
}
