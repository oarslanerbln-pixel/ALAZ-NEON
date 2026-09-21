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
        <div style={{ marginBottom: "8px", fontSize: "16px" }}>Özet Dili:</div>
        <div style={{ display: "flex", gap: "8px", flexDirection: "column" }}>
          {["tr", "en", "ar"].map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              style={{
                backgroundColor: language === lang ? "#00ffff" : "#000000",
                color: language === lang ? "#000000" : "#00ffff",
                border: "2px solid #00ffff",
                padding: "16px",
                fontSize: "20px",
                cursor: "pointer",
                borderRadius: "8px",
                textAlign: "left"
              }}
              aria-label={`${lang === "tr" ? "Türkçe" : lang === "en" ? "İngilizce" : "Arapça"} seçeneği`}
              aria-pressed={language === lang}
            >
              {lang === "tr" ? "Türkçe" : lang === "en" ? "İngilizce (English)" : "Arapça (Arabic)"}
            </button>
          ))}
        </div>
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
