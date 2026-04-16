import UploadDocument from "@/components/UploadDocument";
import MedicationDashboard from "@/components/MedicationDashboard";

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      <header className="mb-8 border-b-2 border-gray-800 pb-4">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
          Hoş Geldiniz, <span className="text-blue-400">Ahmet Bey</span>
        </h1>
        <p className="text-xl text-gray-300 mt-2 font-medium">
          Sağlığınız için bugünkü ilaçlarınızı ve raporlarınızı buradan takip edebilirsiniz.
        </p>
      </header>

      <div className="flex flex-col xl:flex-row gap-8 w-full">
        {/* Sol Kolon - İlaç Takibi (Daha önemli olduğu için önce) */}
        <div className="w-full xl:w-2/3">
          <MedicationDashboard />
        </div>

        {/* Sağ Kolon - Rapor Yükleme */}
        <div className="w-full xl:w-1/3">
          <UploadDocument />
        </div>
      </div>
    </div>
  );
}
