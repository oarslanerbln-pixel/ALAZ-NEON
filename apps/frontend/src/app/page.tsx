import UploadDocument from "@/components/UploadDocument";
import MedicationDashboard from "@/components/MedicationDashboard";

export default function Home() {
  return (
    <div className="max-w-md mx-auto space-y-8">
      <section>
        <UploadDocument />
      </section>

      <section>
        <MedicationDashboard />
      </section>
    </div>
  );
}
