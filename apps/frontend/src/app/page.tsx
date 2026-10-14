import { UploadDocument } from "@/components/UploadDocument";
import { MedicationDashboard } from "@/components/MedicationDashboard";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center font-sans p-8">
      <main className="w-full max-w-3xl flex flex-col gap-12">
        <UploadDocument />
        <MedicationDashboard />
      </main>
    </div>
  );
}
