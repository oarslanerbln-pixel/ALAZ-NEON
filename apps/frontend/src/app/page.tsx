import UploadDocument from "@/components/UploadDocument";
import MedicationDashboard from "@/components/MedicationDashboard";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center p-8 gap-16 min-h-full">
      <h1 className="text-4xl font-bold text-center">MediSade</h1>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-12">
        <section className="flex flex-col border-4 border-current rounded-2xl p-6">
          <UploadDocument locale="tr" />
        </section>

        <section className="flex flex-col border-4 border-current rounded-2xl p-6">
          <MedicationDashboard locale="tr" />
        </section>
      </div>
    </div>
  );
}
