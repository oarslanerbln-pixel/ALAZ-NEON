import UploadDocument from "@/components/UploadDocument";
import MedicationDashboard from "@/components/MedicationDashboard";

export default function Home() {
  return (
    <>
      <div className="mb-4">
        <h1 className="text-4xl font-bold text-center mb-2">Merhaba, Ali Amca</h1>
        <p className="text-xl text-center">İşte bugünkü sağlığınızın özeti.</p>
      </div>

      <MedicationDashboard />

      <div className="border-t-4 border-yellow-400 my-4" />

      <UploadDocument />
    </>
  );
}
