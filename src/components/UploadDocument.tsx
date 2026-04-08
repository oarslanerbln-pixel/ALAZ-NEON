"use client";

import { useState, useRef } from "react";
import Tesseract from "tesseract.js";
import { Camera, Upload, Loader2 } from "lucide-react";

export default function UploadDocument() {
  const [isScanning, setIsScanning] = useState(false);
  const [extractedText, setExtractedText] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);

  const handleImageCapture = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    setExtractedText(null);

    try {
      const result = await Tesseract.recognize(file, "tur", {
        logger: (m) => console.log(m),
      });

      // Securely set the text content to avoid DOM-based XSS, as requested by memory/instructions
      if (textContainerRef.current) {
        textContainerRef.current.textContent = result.data.text;
      }
      setExtractedText(result.data.text);
    } catch (error) {
      console.error("OCR Error:", error);
      if (textContainerRef.current) {
        textContainerRef.current.textContent = "Tarama sırasında bir hata oluştu. Lütfen tekrar deneyin.";
      }
    } finally {
      setIsScanning(false);
    }
  };

  const triggerFileInput = (capture: boolean) => {
    if (fileInputRef.current) {
      if (capture) {
        fileInputRef.current.setAttribute("capture", "environment");
      } else {
        fileInputRef.current.removeAttribute("capture");
      }
      fileInputRef.current.click();
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 w-full max-w-md mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-center">Rapor Yükle / Tara</h2>

      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        onChange={handleImageCapture}
        className="hidden"
      />

      <div className="flex flex-col sm:flex-row gap-4 w-full">
        <button
          onClick={() => triggerFileInput(true)}
          disabled={isScanning}
          className="btn-large flex-1 flex flex-col items-center justify-center gap-2 border-[var(--accent-primary)] text-[var(--accent-primary)] hover:bg-[var(--accent-primary)] hover:text-[var(--background)] disabled:opacity-50"
        >
          <Camera size={48} />
          <span>Kamera</span>
        </button>

        <button
          onClick={() => triggerFileInput(false)}
          disabled={isScanning}
          className="btn-large flex-1 flex flex-col items-center justify-center gap-2 border-[var(--accent-secondary)] text-[var(--accent-secondary)] hover:bg-[var(--accent-secondary)] hover:text-[var(--background)] disabled:opacity-50"
        >
          <Upload size={48} />
          <span>Dosya Seç</span>
        </button>
      </div>

      {isScanning && (
        <div className="flex flex-col items-center justify-center space-y-4 p-8 border-4 border-dashed border-[var(--foreground)] rounded-xl w-full">
          <Loader2 className="animate-spin text-[var(--accent-primary)]" size={64} />
          <p className="text-2xl font-bold animate-pulse text-center">Raporunuz taranıyor...</p>
        </div>
      )}

      <div
        className={`w-full p-6 border-4 border-[var(--foreground)] rounded-xl bg-[var(--background)] ${!extractedText && !isScanning ? 'hidden' : ''}`}
      >
        <h3 className="text-xl font-bold mb-4 border-b-2 border-[var(--foreground)] pb-2">Tarama Sonucu</h3>
        <div
          ref={textContainerRef}
          className="whitespace-pre-wrap font-mono text-lg"
        >
          {/* Text is securely inserted here via textContent */}
        </div>
      </div>
    </div>
  );
}