import MedicationDashboard from "@/components/MedicationDashboard";
import UploadDocument from "@/components/UploadDocument";

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-8">
      <section>
        <h2 className="text-3xl font-bold mb-4">Hoş Geldiniz</h2>
        <p className="text-xl">Aşağıdan tıbbi raporunuzu yükleyebilir veya günlük ilaçlarınızı takip edebilirsiniz.</p>
      </section>

      <UploadDocument />

      <MedicationDashboard />
    </div>
  );
}
