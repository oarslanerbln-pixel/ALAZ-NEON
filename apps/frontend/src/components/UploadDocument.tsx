"use client";

import { useState } from "react";
import { Upload } from "lucide-react";

export default function UploadDocument() {
  const [isScanning, setIsScanning] = useState(false);
  const [language, setLanguage] = useState("tr"); // Default tr or any

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
        <p style={{ marginRight: "8px", marginBottom: "8px", fontSize: "18px" }}>Özet Dili Seçin:</p>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          {[
            { id: "tr", label: "Türkçe" },
            { id: "en", label: "İngilizce (English)" },
            { id: "ar", label: "Arapça (Arabic)" }
          ].map((lang) => (
            <button
              key={lang.id}
              onClick={() => setLanguage(lang.id)}
              style={{
                backgroundColor: language === lang.id ? "#00ffff" : "#000000",
                color: language === lang.id ? "#000000" : "#00ffff",
                border: "2px solid #00ffff",
                padding: "12px 16px",
                fontSize: "18px",
                cursor: "pointer",
                borderRadius: "8px"
              }}
              aria-label={`${lang.label} dilini seç`}
            >
              {lang.label}
            </button>
          ))}
        </div>
      </div>

      {isScanning ? (
        <div style={{ fontSize: "20px", color: "#00ffff", display: "flex", alignItems: "center", gap: "8px", padding: "16px", border: "2px dashed #00ffff", borderRadius: "8px", justifyContent: "center" }}>
          <span>Raporunuz taranıyor...</span>
          <span className="animate-pulse" aria-hidden="true">⏳</span>
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
            justifyContent: "center",
            borderRadius: "8px"
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
