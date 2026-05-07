import UploadDocument from "@/components/UploadDocument";
import MedicationDashboard from "@/components/MedicationDashboard";

export default function Home() {
  return (
    <div className="flex flex-col gap-12 p-4 md:p-8 pb-24">
      <header className="w-full text-center py-6 border-b-4 border-yellow-400">
        <h1 className="text-4xl md:text-5xl font-black text-yellow-400 uppercase tracking-wider">
          MediSade
        </h1>
        <p className="text-xl mt-2 font-bold">Sağlık Asistanınız</p>
      </header>

      <div className="flex flex-col lg:flex-row gap-12 justify-center max-w-6xl mx-auto w-full">
        <section className="flex-1 border-4 border-yellow-400 rounded-3xl p-4 md:p-6 bg-black">
          <UploadDocument />
        </section>

        <section className="flex-1 border-4 border-yellow-400 rounded-3xl p-4 md:p-6 bg-black">
          <MedicationDashboard />
        </section>
      </div>
    </div>
  );
}
