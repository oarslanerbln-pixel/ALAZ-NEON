import UploadDocument from "@/components/UploadDocument";

export default function Home() {
  return (
    <div className="max-w-md mx-auto p-4 space-y-8 mt-8">
      <header>
        <h1 className="text-3xl font-bold">MediSade</h1>
        <p className="text-lg mt-2">Günlük İlaç Takibi</p>
      </header>

      <section className="space-y-4">
        <div className="p-4 border-2 border-yellow-400 rounded-lg flex items-center justify-between">
          <span className="text-xl font-bold">Tansiyon İlacı - Sabah</span>
          <button className="bg-yellow-400 text-black px-6 py-3 rounded-lg font-bold text-lg hover:bg-yellow-500 focus-visible:ring-4 focus-visible:ring-white focus-visible:outline-none">
            Alındı
          </button>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4">Yeni Rapor Ekle</h2>
        <UploadDocument />
      </section>
    </div>
  );
}
