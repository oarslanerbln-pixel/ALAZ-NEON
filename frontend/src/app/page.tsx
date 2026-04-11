import UploadDocument from "@/components/UploadDocument";
import MedicationDashboard from "@/components/MedicationDashboard";

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8">
      <section>
        <h2 className="text-3xl font-bold text-primary mb-4">Hoş Geldiniz</h2>
        <p className="text-lg">
          Lütfen tıbbi raporunuzu yükleyin veya günlük ilaçlarınızı takip edin.
        </p>
      </section>

      <UploadDocument />

      <MedicationDashboard />
    </div>
  );
}
