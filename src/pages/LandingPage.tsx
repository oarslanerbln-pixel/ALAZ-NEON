import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { KineticSpark } from "../components/KineticSpark";
import { SoundManager, sounds } from "../lib/audio";
import { useLocale } from "../hooks/useLocale";
import { useVenue } from "../contexts/VenueContextCore";
import { AttractMode } from "../components/AttractMode";
import { Smartphone, Tv, Trophy, LogIn, ArrowRight, RotateCcw } from "lucide-react";
import { AuroraBackdrop, BeamBorder, GridPattern, ShimmerButton } from "../components/fx";
import { useAuth } from "../hooks/useAuth";
import { fetchRoomById } from "../lib/roomQueries";
import { canResumeHostRoom, readHostRoomId } from "../lib/roomSession";

export function LandingPage() {
  const navigate = useNavigate();
  const { t } = useLocale();
  const { venue } = useVenue();
  const [isIdle, setIsIdle] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const [resumableRoom, setResumableRoom] = useState<{ id: string; code: string } | null>(null);

  // Bu cihaz bu gece zaten bir oda açtıysa ve oda hâlâ açıksa, yeni oda
  // açtırmak yerine ona dönmeyi öneriyoruz: yeni oda yeni kod demek, salondaki
  // herkes QR'ı yeniden okutmak zorunda kalıyordu.
  useEffect(() => {
    if (authLoading) return;
    const roomId = readHostRoomId(localStorage);
    if (!roomId) return;
    let cancelled = false;
    fetchRoomById(roomId)
      .then((room) => {
        if (!cancelled && canResumeHostRoom(room, user?.uid)) {
          setResumableRoom({ id: room.id, code: room.code });
        }
      })
      .catch((err) => console.error("[LandingPage] Son oda okunamadı:", err));
    return () => {
      cancelled = true;
    };
  }, [authLoading, user?.uid]);

  // Idle Timer logic for Nightclub Attract Screen
  useEffect(() => {
    let idleTimeout: number;

    const resetIdleTimer = () => {
      if (isIdle) setIsIdle(false);
      clearTimeout(idleTimeout);
      idleTimeout = window.setTimeout(() => {
        setIsIdle(true);
      }, 35000); 
    };

    window.addEventListener("mousemove", resetIdleTimer);
    window.addEventListener("keydown", resetIdleTimer);
    window.addEventListener("touchstart", resetIdleTimer);
    window.addEventListener("click", resetIdleTimer);

    resetIdleTimer();

    return () => {
      clearTimeout(idleTimeout);
      window.removeEventListener("mousemove", resetIdleTimer);
      window.removeEventListener("keydown", resetIdleTimer);
      window.removeEventListener("touchstart", resetIdleTimer);
      window.removeEventListener("click", resetIdleTimer);
    };
  }, [isIdle]);

  return (
    <div className="w-full h-screen max-h-screen bg-[#030307] text-white overflow-hidden relative select-none flex flex-col justify-between p-4 sm:p-8 font-sans">
      
      {/* ════════════════ OLED Deep Black Background Layer ════════════════ */}
      <div className="fixed inset-0 z-0 bg-[#030307] pointer-events-none" />
      <AuroraBackdrop colors={["255,85,0", "0,229,255", "179,0,255"]} intensity={0.18} className="z-0 pointer-events-none" />
      <GridPattern className="z-0 pointer-events-none" />

      {/* ════════════════ Cinematic Glowing Amber Aurora in the Center ════════════════ */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <div className="w-[75vw] max-w-[850px] h-[340px] bg-gradient-to-r from-amber-600/20 via-alaz-orange/25 to-yellow-500/20 blur-[130px] rounded-full pointer-events-none" />
      </div>

      {/* ════════════════ TOP HEADER BAR ════════════════ */}
      <header className="w-full max-w-6xl mx-auto flex justify-between items-center relative z-30 shrink-0 mt-8 sm:mt-0">
        <ShimmerButton
          color="yellow"
          thickness={1.5}
          radius="1rem"
          onClick={() => {
            SoundManager.getInstance().playSFX(sounds.CLICK);
            navigate("/leaderboard");
          }}
          innerClassName="flex items-center gap-2.5 px-4 sm:px-6 py-2.5 bg-[#0e0e18]/85 text-white backdrop-blur-2xl"
        >
          <Trophy className="w-4 h-4 text-yellow-400" />
          <span className="text-[10px] sm:text-xs font-mono font-black uppercase tracking-[0.2em]">
            {t("leaderboard.title")}
          </span>
        </ShimmerButton>

        <ShimmerButton
          color="blue"
          thickness={1.5}
          radius="1rem"
          onClick={() => {
            SoundManager.getInstance().playSFX(sounds.CLICK);
            navigate("/login");
          }}
          innerClassName="flex items-center gap-2.5 px-4 sm:px-6 py-2.5 bg-[#0e0e18]/85 text-white backdrop-blur-2xl"
        >
          <LogIn className="w-4 h-4 text-cyan-400" />
          <span className="text-[10px] sm:text-xs font-mono font-black uppercase tracking-[0.2em]">
            {t("auth.login")}
          </span>
        </ShimmerButton>
      </header>

      {/* ════════════════ HERO 3D TITLE SECTION (KineticSpark) ════════════════ */}
      <main className="flex-1 flex flex-col items-center justify-center min-h-0 w-full max-w-5xl mx-auto px-4 relative z-20 my-auto">
        <div className="w-full flex items-center justify-center max-h-[38vh]">
          <KineticSpark 
            showTagline 
            delay={-1} 
            text={venue.name && venue.name !== "ALAZ NEON" && venue.name !== "ALAZ" ? venue.name : "HENGAME"} 
            tagline="DAS ULTIMATIVE NIGHTLIFE PARTY-GAME" 
          />
        </div>
      </main>

      {/* ════════════════ ACTION BUTTONS SECTION ════════════════ */}
      <footer className="w-full max-w-4xl mx-auto pb-4 sm:pb-8 relative z-30 shrink-0">
        {resumableRoom && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              SoundManager.getInstance().playSFX(sounds.CLICK);
              navigate(`/host/display?roomId=${resumableRoom.id}`);
            }}
            className="w-full mb-5 sm:mb-6 flex items-center justify-between gap-3 px-5 py-4 rounded-2xl bg-cyan-400/10 hover:bg-cyan-400/20 border border-cyan-400/50 text-left cursor-pointer transition-colors shadow-[0_0_25px_rgba(0,210,255,0.25)]"
          >
            <span className="min-w-0">
              <span className="block text-sm sm:text-base font-mono font-black uppercase tracking-[0.15em] text-white truncate">
                {t("landing.resumeRoom", resumableRoom.code)}
              </span>
              <span className="block text-[11px] text-cyan-200/80 font-bold mt-0.5">
                {t("landing.resumeRoomHint")}
              </span>
            </span>
            <RotateCcw className="w-6 h-6 text-cyan-300 shrink-0" />
          </motion.button>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-8 w-full">
          
          {/* BUTTON 1: JETZT BEITRETEN (SPIELER / GAST) */}
          <BeamBorder rgb="255,85,0" duration={4} thickness={2} radius="1.25rem" className="w-full shadow-[0_15px_45px_rgba(255,60,0,0.4)]">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                SoundManager.getInstance().playSFX(sounds.CLICK);
                navigate("/join");
              }}
              className="w-full relative group overflow-hidden p-6 sm:p-7 text-left cursor-pointer bg-gradient-to-r from-[#ff0844] via-[#ff5100] to-[#ffb700] flex items-center justify-between"
            >
              {/* Glass Specular Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/35 via-transparent to-black/20 pointer-events-none" />

              <div className="flex-1 pr-3 relative z-10">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-black animate-ping" />
                  <span className="text-[11px] font-mono uppercase tracking-[0.22em] font-black text-black/90">
                    SPIELER / GAST
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black font-sans leading-none drop-shadow-sm">
                  JETZT BEITRETEN
                </h2>
                <p className="text-xs text-black/90 font-bold mt-2 font-sans flex items-center gap-1.5">
                  <span>Mit Smartphone beitreten</span>
                  <ArrowRight className="w-4 h-4 inline group-hover:translate-x-2 transition-transform stroke-[2.5]" />
                </p>
              </div>

              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-black/20 backdrop-blur-md border border-black/25 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-transform relative z-10 ml-2 rounded-xl">
                <Smartphone className="w-8 h-8 text-black stroke-[2.5]" />
              </div>
            </motion.button>
          </BeamBorder>

          {/* BUTTON 2: RAUM ERSTELLEN (HOST / TV) */}
          <BeamBorder rgb="0,210,255" duration={4} thickness={2} radius="1.25rem" className="w-full shadow-[0_15px_45px_rgba(0,210,255,0.4)]">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                SoundManager.getInstance().playSFX(sounds.CLICK);
                navigate("/host/setup");
              }}
              className="w-full relative group overflow-hidden p-6 sm:p-7 text-left cursor-pointer bg-gradient-to-r from-[#0052d4] via-[#00d2ff] to-[#00f5d4] flex items-center justify-between"
            >
              {/* Glass Specular Overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-white/35 via-transparent to-black/20 pointer-events-none" />

              <div className="flex-1 pr-3 relative z-10">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-black animate-ping" />
                  <span className="text-[11px] font-mono uppercase tracking-[0.22em] font-black text-black/90">
                    MODERATOR / TV
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black font-sans leading-none drop-shadow-sm">
                  RAUM ERSTELLEN
                </h2>
                <p className="text-xs text-black/90 font-bold mt-2 font-sans flex items-center gap-1.5">
                  <span>TV-Lobby & Dashboard</span>
                  <ArrowRight className="w-4 h-4 inline group-hover:translate-x-2 transition-transform stroke-[2.5]" />
                </p>
              </div>

              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-black/20 backdrop-blur-md border border-black/25 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 group-hover:rotate-3 transition-transform relative z-10 ml-2 rounded-xl">
                <Tv className="w-8 h-8 text-black stroke-[2.5]" />
              </div>
            </motion.button>
          </BeamBorder>

        </div>
      </footer>

      {/* Attract Mode Overlay */}
      <AnimatePresence>
        {isIdle && <AttractMode onClose={() => setIsIdle(false)} />}
      </AnimatePresence>
    </div>
  );
}
