"use client";

import { useState } from "react";
import { Upload } from "lucide-react";

export default function UploadDocument() {
  const [isScanning, setIsScanning] = useState(false);
  const [language, setLanguage] = useState("en");

  const handleUpload = () => {
    setIsScanning(true);
    // Simulate OCR scanning process
    setTimeout(() => {
      setIsScanning(false);
    }, 3000);
  };

  return (
    <div style={{ padding: "24px", border: "2px solid #ffff00", borderRadius: "8px", marginBottom: "24px" }}>
      <h2 style={{ fontSize: "24px", marginBottom: "16px" }}>Rapor Yükle (Kamera / Dosya)</h2>

      <div style={{ marginBottom: "16px" }}>
        <label htmlFor="lang-select" style={{ marginRight: "8px" }}>Özet Dili:</label>
        <select
          id="lang-select"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          style={{ backgroundColor: "#000000", color: "#00ffff", border: "2px solid #00ffff", padding: "8px", fontSize: "16px" }}
        >
          <option value="en">İngilizce (English)</option>
          <option value="ar">Arapça (Arabic)</option>
        </select>
      </div>

      {isScanning ? (
        <div style={{ fontSize: "20px", color: "#00ffff", display: "flex", alignItems: "center", gap: "8px" }}>
          <span>Raporunuz taranıyor...</span>
          <span className="animate-pulse">⏳</span>
        </div>
      ) : (
        <button
          onClick={handleUpload}
          style={{
            backgroundColor: "#000000",
            color: "#00ffff",
            border: "2px solid #00ffff",
            padding: "16px",
            fontSize: "20px",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            cursor: "pointer",
            width: "100%",
            justifyContent: "center"
          }}
          aria-label="Rapor yüklemek için tıklayın"
        >
          <Upload size={24} />
          <span>Fotoğraf Çek veya Yükle</span>
        </button>
      )}
    </div>
  );
}
