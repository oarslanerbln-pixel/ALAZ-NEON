import { Outlet } from "react-router-dom";
import { ParticleBackground } from "./ParticleBackground";
import { OfflineOverlay } from "./OfflineOverlay";

export function Layout() {
  return (
    <div className="min-h-screen w-full bg-dark-bg text-white relative font-sans">
      {/* Ambient Animated Background (Removed for Pure OLED Black) */}

      {/* Global Particle System */}
      <ParticleBackground />

      {/* Global Reconnection UI */}
      <OfflineOverlay />

      {/* Main Content Render Area */}
      <main className="relative z-10 min-h-screen flex flex-col">
        <Outlet />
      </main>
    </div>
  );
}
