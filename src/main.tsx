import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

const firebaseApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
const firebaseProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

// Development ortamında (localhost), eğer env ayarlanmadıysa
// projenin patlamasını engellemek için mock modunda başlatma seçeneği eklenebilir
// Şimdilik strict kontrol yapıyoruz:
if (!firebaseApiKey || !firebaseProjectId) {
  document.getElementById("root")!.innerHTML = `
    <div style="display:flex;justify-content:center;align-items:center;height:100vh;background:#000;color:#fff;font-family:monospace;text-align:center;padding:2rem;">
      <div>
      <h1 style="color:#ff4d00;font-size:3rem;margin-bottom:1rem;">⚠️ FIREBASE BAĞLANTI HATASI</h1>
      <p style="font-size:1.2rem;color:#888;max-width:600px;">Ortam değişkenleri (Environment Variables) bulunamadı. Vercel Dashboard'dan veya .env.local dosyanızdan VITE_FIREBASE_API_KEY ve VITE_FIREBASE_PROJECT_ID eklenip yeniden başlatılmalı.</p>
      <div style="margin-top:2rem;padding:1rem;background:#111;border:1px solid #333;border-radius:8px;text-align:left;display:inline-block;">
        <p>VITE_FIREBASE_API_KEY: <span style="color:${firebaseApiKey ? "#00ff00" : "#ff0000"}">${firebaseApiKey ? "✅ OK" : "❌ MISSING"}</span></p>
        <p>VITE_FIREBASE_PROJECT_ID: <span style="color:${firebaseProjectId ? "#00ff00" : "#ff0000"}">${firebaseProjectId ? "✅ OK" : "❌ MISSING"}</span></p>
      </div>
      </div>
    </div>
  `;
} else {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
}
