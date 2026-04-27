import UploadDocument from "@/components/UploadDocument";
import MedicationDashboard from "@/components/MedicationDashboard";

export default function Home() {
  return (
    <main className="flex flex-col flex-1 items-center py-10 px-4 w-full max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-8 text-center text-yellow-400">MediSade</h1>
      <p className="text-xl mb-12 text-center max-w-2xl">
        Tıbbi raporlarınızı yükleyin ve sizin için anında anlaşılır bir dile çevirelim. İlaçlarınızı düzenli takip edin.
      </p>

      <div className="w-full flex flex-col gap-16">
        <UploadDocument />
        <MedicationDashboard />
      </div>
    </main>
  );
}
