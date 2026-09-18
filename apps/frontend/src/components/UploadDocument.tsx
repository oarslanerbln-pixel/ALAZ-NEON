"use client";

import { useState } from "react";
import { Upload } from "lucide-react";

export const SYSTEM_PROMPT = "Tıbbi metni 70 yaşındaki birinin anlayacağı sadelikte 3 başlıkta özetle: 1. Durumunuz Nedir? 2. Doktorunuz Ne Demek İstiyor? 3. Dikkat Etmeniz Gerekenler.";

export default function UploadDocument() {
  const [isScanning, setIsScanning] = useState(false);
  const [language, setLanguage] = useState("tr");

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
        <div style={{ fontSize: "18px", marginBottom: "8px" }}>Özet Dili:</div>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <button
            onClick={() => setLanguage("tr")}
            style={{
              backgroundColor: language === "tr" ? "#00ffff" : "#000000",
              color: language === "tr" ? "#000000" : "#00ffff",
              border: "2px solid #00ffff",
              padding: "16px 24px",
              fontSize: "18px",
              cursor: "pointer",
              borderRadius: "8px",
              flex: "1",
              minWidth: "120px"
            }}
            aria-label="Özeti Türkçe dilinde oluştur"
          >
            Türkçe
          </button>
          <button
            onClick={() => setLanguage("en")}
            style={{
              backgroundColor: language === "en" ? "#00ffff" : "#000000",
              color: language === "en" ? "#000000" : "#00ffff",
              border: "2px solid #00ffff",
              padding: "16px 24px",
              fontSize: "18px",
              cursor: "pointer",
              borderRadius: "8px",
              flex: "1",
              minWidth: "120px"
            }}
            aria-label="Özeti İngilizce dilinde oluştur"
          >
            İngilizce
          </button>
          <button
            onClick={() => setLanguage("ar")}
            style={{
              backgroundColor: language === "ar" ? "#00ffff" : "#000000",
              color: language === "ar" ? "#000000" : "#00ffff",
              border: "2px solid #00ffff",
              padding: "16px 24px",
              fontSize: "18px",
              cursor: "pointer",
              borderRadius: "8px",
              flex: "1",
              minWidth: "120px"
            }}
            aria-label="Özeti Arapça dilinde oluştur"
          >
            Arapça
          </button>
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
            justifyContent: "center",
            borderRadius: "8px"
          }}
          aria-label="Rapor yüklemek için tıklayın"
        >
          <Upload size={24} />
          <span>Fotoğraf Çek veya Yükle</span>
        </button>
      )}

      <div style={{ marginTop: "32px", padding: "16px", backgroundColor: "#333333", color: "#ffff00", fontSize: "16px", borderRadius: "8px", textAlign: "center" }}>
        <p><strong>Dikkat:</strong> Bu bir tıbbi tavsiye değildir, yalnızca dil sadeleştirme aracıdır. Lütfen doktorunuza danışın.</p>
      </div>
    </div>
  );
}
