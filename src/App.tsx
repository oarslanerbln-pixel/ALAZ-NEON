import { Suspense, lazy } from "react";
import { MotionConfig } from "framer-motion";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { ToastProvider } from "./contexts/ToastContext";
import { VenueProvider } from "./contexts/VenueContext";
import { LandingPage } from "./pages/LandingPage";
import { useAuth } from "./hooks/useAuth";
import { useLocale } from "./hooks/useLocale";

/**
 * Rota bazlı kod bölme.
 * Landing eager kalıyor (ilk boyanan ekran); geri kalan her sayfa
 * ayrı chunk'a çıkıyor. Telefondan katılan oyuncu artık host/quiz
 * ekranlarının JS'ini indirmek zorunda değil.
 */
const PlayerJoin = lazy(() =>
  import("./pages/player/PlayerJoin").then((m) => ({ default: m.PlayerJoin }))
);
const PlayerGame = lazy(() =>
  import("./pages/player/PlayerGame").then((m) => ({ default: m.PlayerGame }))
);
const HostSetup = lazy(() =>
  import("./pages/host/HostSetup").then((m) => ({ default: m.HostSetup }))
);
const HostDisplay = lazy(() =>
  import("./pages/host/HostDisplay").then((m) => ({ default: m.HostDisplay }))
);
const Leaderboard = lazy(() =>
  import("./pages/Leaderboard").then((m) => ({ default: m.Leaderboard }))
);
const LoginPage = lazy(() =>
  import("./pages/auth/LoginPage").then((m) => ({ default: m.LoginPage }))
);
const RegisterPage = lazy(() =>
  import("./pages/auth/RegisterPage").then((m) => ({ default: m.RegisterPage }))
);
const VenueSettings = lazy(() =>
  import("./pages/admin/VenueSettings").then((m) => ({ default: m.VenueSettings }))
);
const RewardVerify = lazy(() =>
  import("./pages/admin/RewardVerify").then((m) => ({ default: m.RewardVerify }))
);
const NightlyReport = lazy(() =>
  import("./pages/admin/NightlyReport").then((m) => ({ default: m.NightlyReport }))
);

function RouteFallback() {
  const { t } = useLocale();

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center font-mono">
      <div className="text-alaz-orange text-sm uppercase tracking-[0.5em] animate-pulse">
        {t("common.loading")}
      </div>
    </div>
  );
}

function App() {
  useAuth(); // Initialize anonymous auth

  return (
    <ErrorBoundary>
    {/*
      reducedMotion="user": işletim sistemi "hareketi azalt" diyorsa framer
      transform/layout animasyonlarını atlar, opaklık geçişlerini korur.
      Tek satırla 80+ dosyadaki tüm motion bileşenleri erişilebilir oluyor
      (WCAG 2.3.3). CSS keyframe tarafı index.css'teki media query'de.
    */}
    <MotionConfig reducedMotion="user">
    <BrowserRouter>
      <VenueProvider>
        <ToastProvider>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              {/* Core Layout Wraps Everything */}
              <Route element={<Layout />}>
                {/* New Landing Page as Root */}
                <Route path="/" element={<LandingPage />} />
                {/* Player Routes (Mobile) */}
                <Route path="/join" element={<PlayerJoin />} />
                {/* Player Game Container (Shared) */}
                <Route path="/play" element={<PlayerGame />} />
                {/* Host Routes (TV/iPad) */}
                <Route path="/host/setup" element={<HostSetup />} />
                <Route path="/host/display" element={<HostDisplay />} />
                {/* New Feature Routes */}
                <Route path="/leaderboard" element={<Leaderboard />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                {/* Satıcı/işletme: aktif mekan markasını değiştirme ekranı */}
                <Route path="/admin/venue" element={<VenueSettings />} />
                {/* Personel: barda ödül kodu doğrulama ekranı */}
                <Route path="/admin/rewards" element={<RewardVerify />} />
                {/* Mekan sahibi: gecelik/haftalık/aylık özet rapor */}
                <Route path="/admin/report" element={<NightlyReport />} />
              </Route>
            </Routes>
          </Suspense>
        </ToastProvider>
      </VenueProvider>
    </BrowserRouter>
    </MotionConfig>
    </ErrorBoundary>
  );
}

export default App;
