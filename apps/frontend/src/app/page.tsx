import { UploadDocument } from "@/components/UploadDocument";
import { MedicationDashboard } from "@/components/MedicationDashboard";
import { t } from "@/lib/i18n";

export default function Home() {
  return (
    <div className="flex flex-col gap-8 pb-20">
      <header className="text-center py-8">
        <h1 className="text-4xl font-bold text-interactive tracking-wider">
          {t("app.title", "tr")}
        </h1>
        <p className="text-xl mt-2 text-yellow-200">
          Tıbbi Rapor Çeviri ve İlaç Takip Asistanı
        </p>
      </header>

      <div className="flex flex-col md:flex-row gap-8 justify-center items-start">
        <UploadDocument lang="tr" />
        <MedicationDashboard lang="tr" />
      </div>
    </div>
  );
}
