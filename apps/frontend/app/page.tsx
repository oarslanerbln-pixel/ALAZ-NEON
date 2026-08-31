import UploadDocument from "@/components/UploadDocument";

export default function Home() {
  return (
    <div className="min-h-screen p-8 bg-black text-yellow-400 font-sans text-base">
      <main className="flex flex-col gap-8 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">MediSade Ana Panel</h1>

        <UploadDocument />

        <section className="bg-gray-900 p-6 rounded-lg w-full max-w-md mx-auto">
          <h2 className="text-2xl mb-6 text-[#ffff00]">Günlük İlaçlar</h2>
          <div className="flex flex-col gap-4">
            <button className="w-full bg-[#00ffff] text-black text-2xl font-bold py-6 rounded-lg active:bg-cyan-600 transition-colors">
              Parol - Alındı
            </button>
            <button className="w-full bg-[#00ffff] text-black text-2xl font-bold py-6 rounded-lg active:bg-cyan-600 transition-colors">
              Tansiyon İlacı - Alındı
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}