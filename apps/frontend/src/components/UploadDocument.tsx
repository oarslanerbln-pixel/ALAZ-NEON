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

      <fieldset style={{ marginBottom: "16px", border: "none", padding: 0 }}>
        <legend style={{ marginBottom: "8px", fontSize: "16px", fontWeight: "bold" }}>Özet Dili:</legend>
        <div style={{ display: "flex", gap: "16px" }}>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "18px" }}>
            <input
              type="radio"
              name="language"
              value="en"
              checked={language === "en"}
              onChange={() => setLanguage("en")}
              style={{ width: "24px", height: "24px", accentColor: "#00ffff" }}
              aria-label="İngilizce (English)"
            />
            İngilizce (English)
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer", fontSize: "18px" }}>
            <input
              type="radio"
              name="language"
              value="ar"
              checked={language === "ar"}
              onChange={() => setLanguage("ar")}
              style={{ width: "24px", height: "24px", accentColor: "#00ffff" }}
              aria-label="Arapça (Arabic)"
            />
            Arapça (Arabic)
          </label>
        </div>
      </fieldset>

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
