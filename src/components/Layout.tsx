import { Outlet } from 'react-router-dom';
import { ParticleBackground } from './ParticleBackground';

export function Layout() {
    return (
        <div className="min-h-screen w-full bg-dark-bg text-white relative font-sans">
            {/* Ambient Animated Background - separate element so position:fixed doesn't affect layout */}
            <div className="ambient-bg" />

            {/* Global Particle System */}
            <ParticleBackground />

            {/* Main Content Render Area */}
            <main className="relative z-10 min-h-screen flex flex-col">
                <Outlet />
            </main>
        </div>
    );
}
