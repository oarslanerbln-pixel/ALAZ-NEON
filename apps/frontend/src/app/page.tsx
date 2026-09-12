import { UploadDocument } from "@/components/UploadDocument";
import { MedicineDashboard } from "@/components/MedicineDashboard";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] gap-12 w-full max-w-4xl mx-auto">
      <header className="w-full text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-[#ffff00] mb-4">
          MediSade
        </h1>
        <p className="text-xl md:text-2xl text-[#00ffff] font-semibold">
          Sağlık Raporunuzu Sadeleştirin & İlaçlarınızı Takip Edin
        </p>
      </header>

      <div className="w-full grid md:grid-cols-2 gap-8">
        <UploadDocument />
        <MedicineDashboard />
      </div>
    </div>
  );
}
