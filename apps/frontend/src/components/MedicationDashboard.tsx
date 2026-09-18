"use client";

import { useState } from "react";
import { CheckCircle } from "lucide-react";

export default function MedicationDashboard() {
  const [medications, setMedications] = useState([
    { id: 1, name: "Tansiyon İlacı", time: "Sabah", taken: false },
    { id: 2, name: "Kalp İlacı", time: "Akşam", taken: false }
  ]);

  const toggleTaken = (id: number) => {
    setMedications(medications.map(med =>
      med.id === id ? { ...med, taken: !med.taken } : med
    ));
  };

  return (
    <div style={{ padding: "24px", border: "2px solid #ffff00", borderRadius: "8px" }}>
      <h2 style={{ fontSize: "24px", marginBottom: "16px" }}>İlaç Takibi</h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {medications.map(med => (
          <div key={med.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #ffff00", paddingBottom: "16px" }}>
            <div>
              <div style={{ fontSize: "20px" }}>{med.name}</div>
              <div style={{ fontSize: "16px" }}>{med.time}</div>
            </div>
            <button
              onClick={() => toggleTaken(med.id)}
              style={{
                backgroundColor: med.taken ? "#00ffff" : "#000000",
                color: med.taken ? "#000000" : "#00ffff",
                border: "2px solid #00ffff",
                padding: "24px 32px",
                fontSize: "24px",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                cursor: "pointer",
                borderRadius: "8px",
                fontWeight: "bold"
              }}
              aria-label={`${med.name} alındı olarak işaretle`}
            >
              <CheckCircle size={32} />
              {med.taken ? "Alındı" : "Alınmadı"}
            </button>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "32px", padding: "16px", backgroundColor: "#333333", color: "#ffff00", fontSize: "16px", borderRadius: "8px", textAlign: "center" }}>
        <p><strong>Dikkat:</strong> Bu bir tıbbi tavsiye değildir, yalnızca dil sadeleştirme aracıdır. Lütfen doktorunuza danışın.</p>
      </div>
    </div>
  );
}
