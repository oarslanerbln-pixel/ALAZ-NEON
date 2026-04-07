import UploadDocument from "@/components/UploadDocument";
import MedicationDashboard from "@/components/MedicationDashboard";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-12 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-primary">MediSade</h1>
        <p className="text-xl md:text-2xl">Karmaşık raporlarınızı anlar, ilaçlarınızı takip eder.</p>
      </header>

      <div className="space-y-16">
        <section>
          <UploadDocument />
        </section>

        <section>
          <MedicationDashboard />
        </section>
      </div>
    </div>
  );
}
