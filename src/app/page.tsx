import MedicationDashboard from "@/components/MedicationDashboard";
import UploadDocument from "@/components/UploadDocument";

export default function Home() {
  return (
    <div className="flex flex-col gap-12 w-full max-w-4xl mx-auto py-8">
      <section className="bg-[var(--background)] p-6 border-4 border-[var(--foreground)] rounded-2xl">
        <UploadDocument />
      </section>

      <section className="bg-[var(--background)] p-6 border-4 border-[var(--foreground)] rounded-2xl">
        <MedicationDashboard />
      </section>
    </div>
  );
}