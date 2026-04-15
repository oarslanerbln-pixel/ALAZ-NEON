import UploadDocument from "@/components/UploadDocument";
import MedicationDashboard from "@/components/MedicationDashboard";

export default function Home() {
  return (
    <div className="flex flex-col gap-12 pb-20">
      <header className="text-center mb-8">
        <h1 className="text-5xl font-black mb-4">MediSade</h1>
        <p className="text-xl font-bold max-w-2xl mx-auto">
          Tıbbi raporlarınızı kolayca anlayın ve ilaçlarınızı güvenle takip edin.
        </p>
      </header>

      <section>
        <UploadDocument />
      </section>

      <section>
        <MedicationDashboard />
      </section>
    </div>
  );
}
