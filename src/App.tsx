import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ToastProvider } from "./contexts/ToastContext";
import { LandingPage } from "./pages/LandingPage";
import { PlayerJoin } from "./pages/player/PlayerJoin";
import { PlayerGame } from "./pages/player/PlayerGame";
import { HostSetup } from "./pages/host/HostSetup";
import { HostDisplay } from "./pages/host/HostDisplay";
import { Leaderboard } from "./pages/Leaderboard";
import { LoginPage } from "./pages/auth/LoginPage";
import { RegisterPage } from "./pages/auth/RegisterPage";

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
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
          </Route>
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
