import { UploadDocument } from "@/components/UploadDocument";
import { MedicationDashboard } from "@/components/MedicationDashboard";

export default function Home() {
  return (
    <div className="min-h-screen p-8 flex flex-col items-center gap-12 max-w-4xl mx-auto">
      <header className="text-center">
        <h1 className="text-4xl font-extrabold text-foreground mb-4">MediSade</h1>
        <p className="text-xl text-foreground">Karmaşık raporlarınızı sadeleştirin, ilaçlarınızı takip edin.</p>
      </header>

      <main className="flex flex-col w-full gap-12 items-center">
        <UploadDocument />
        <MedicationDashboard />
      </main>

      <footer className="w-full p-6 mt-auto border-t-2 border-interactive text-center">
        <p className="text-lg font-bold">
          Bu bir tıbbi tavsiye değildir, yalnızca dil sadeleştirme aracıdır. Lütfen doktorunuza danışın.
        </p>
      </footer>
    </div>
  );
}
