import UploadDocument from "@/components/UploadDocument";
import MedicationDashboard from "@/components/MedicationDashboard";

export default function Home() {
  return (
    <div style={{ padding: "24px", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "32px", marginBottom: "32px", textAlign: "center" }}>MediSade</h1>
      <UploadDocument />
      <MedicationDashboard />
    </div>
  );
}
