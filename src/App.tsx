import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { PlayerJoin } from './pages/player/PlayerJoin';
import { PlayerGame } from './pages/player/PlayerGame';
import { HostSetup } from './pages/host/HostSetup';
import { HostDisplay } from './pages/host/HostDisplay';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Core Layout Wraps Everything */}
        <Route element={<Layout />}>
          {/* New Landing Page as Root */}
          <Route path="/" element={<LandingPage />} />
          {/* Player Routes (Mobile) */}
          <Route path="/join" element={<PlayerJoin />} />
          <Route path="/play" element={<PlayerGame />} />
          {/* Host Routes (TV/iPad) */}
          <Route path="/host/setup" element={<HostSetup />} />
          <Route path="/host/display" element={<HostDisplay />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
