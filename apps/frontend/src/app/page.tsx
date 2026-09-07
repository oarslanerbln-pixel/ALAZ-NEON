import { UploadDocument } from "@/components/UploadDocument";
import { MedicationDashboard } from "@/components/MedicationDashboard";

export default function Home() {
  return (
    <main className="min-h-screen pb-24">
      <header className="p-6 border-b-2 border-[#00ffff] mb-8">
        <h1 className="text-4xl font-bold text-center tracking-wider text-[#00ffff]">MediSade</h1>
      </header>

      <div className="space-y-16">
        <section>
          <div className="text-center mb-8 px-4">
            <h2 className="text-2xl font-bold">Raporunuzu Yükleyin</h2>
            <p className="text-lg mt-2 text-gray-300">Karmaşık tıbbi metinleri kolayca anlayın.</p>
          </div>
          <UploadDocument />
        </section>

        <section>
          <MedicationDashboard />
        </section>
      </div>

      <footer className="fixed bottom-0 left-0 right-0 p-4 bg-black border-t-2 border-red-500 z-50">
        <p className="text-red-400 font-bold text-center text-sm sm:text-base">
          Bu bir tıbbi tavsiye değildir, yalnızca dil sadeleştirme aracıdır. Lütfen doktorunuza danışın.
        </p>
      </footer>
    </main>
  );
}
