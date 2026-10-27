import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { KineticSpark } from "../components/KineticSpark";
import { SoundManager, sounds } from "../lib/audio";
import { useLocale } from "../hooks/useLocale";
import { useVenue } from "../contexts/VenueContextCore";
import { Smartphone, Tv, LogIn, ArrowRight, RotateCcw } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { fetchRoomById } from "../lib/roomQueries";
import { canResumeHostRoom, readHostRoomId } from "../lib/roomSession";

export function LandingPage() {
  const navigate = useNavigate();
  const { t } = useLocale();
  const { venue } = useVenue();
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

  return (
    <div className="w-full h-screen max-h-screen bg-[#030307] text-white overflow-hidden relative select-none flex flex-col justify-between p-4 sm:p-8 font-sans">

      {/* ════════════════ TOP HEADER BAR ════════════════ */}
      <header className="w-full max-w-6xl mx-auto flex justify-end items-center relative z-30 shrink-0 mt-8 sm:mt-0">
        <button
          type="button"
          className="btn-secondary flex items-center gap-2.5 px-4 sm:px-6 py-2.5 rounded-2xl"
          onClick={() => {
            SoundManager.getInstance().playSFX(sounds.CLICK);
            navigate("/login");
          }}
        >
          <LogIn className="w-4 h-4 text-accent" />
          <span className="text-xs sm:text-xs tabular-nums font-black uppercase tracking-[0.2em]">
            {t("auth.login")}
          </span>
        </button>
      </header>

      {/* ════════════════ HERO TITLE SECTION (KineticSpark) ════════════════ */}
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
            transition={{ duration: 0.25 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              SoundManager.getInstance().playSFX(sounds.CLICK);
              navigate(`/host/display?roomId=${resumableRoom.id}`);
            }}
            className="w-full mb-5 sm:mb-6 flex items-center justify-between gap-3 px-5 py-4 rounded-2xl bg-accent/10 hover:bg-accent/20 border border-accent/50 text-left cursor-pointer transition-colors"
          >
            <span className="min-w-0">
              <span className="block text-sm sm:text-base tabular-nums font-black uppercase tracking-[0.15em] text-white truncate">
                {t("landing.resumeRoom", resumableRoom.code)}
              </span>
              <span className="block text-xs text-accent/80 font-bold mt-0.5">
                {t("landing.resumeRoomHint")}
              </span>
            </span>
            <RotateCcw className="w-6 h-6 text-accent shrink-0" />
          </motion.button>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-8 w-full">

          {/* BUTTON 1: JETZT BEITRETEN (SPIELER / GAST) */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              SoundManager.getInstance().playSFX(sounds.CLICK);
              navigate("/join");
            }}
            className="btn-primary w-full relative group p-6 sm:p-7 text-left cursor-pointer rounded-[1.25rem] flex items-center justify-between"
          >
            <div className="flex-1 pr-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-black" />
                <span className="text-xs tabular-nums uppercase tracking-[0.22em] font-black text-black/90">
                  SPIELER / GAST
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-black font-sans leading-none">
                JETZT BEITRETEN
              </h2>
              <p className="text-xs text-black/90 font-bold mt-2 font-sans flex items-center gap-1.5">
                <span>Mit Smartphone beitreten</span>
                <ArrowRight className="w-4 h-4 inline stroke-[2.5]" />
              </p>
            </div>

            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-black/20 border border-black/25 flex items-center justify-center shrink-0 ml-2 rounded-xl">
              <Smartphone className="w-8 h-8 text-black stroke-[2.5]" />
            </div>
          </motion.button>

          {/* BUTTON 2: RAUM ERSTELLEN (HOST / TV) */}
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => {
              SoundManager.getInstance().playSFX(sounds.CLICK);
              navigate("/host/setup");
            }}
            className="surface w-full relative group p-6 sm:p-7 text-left cursor-pointer rounded-[1.25rem] flex items-center justify-between hover:border-accent/60 transition-colors"
          >
            <div className="flex-1 pr-3">
              <div className="flex items-center gap-1.5 mb-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-accent" />
                <span className="text-xs tabular-nums uppercase tracking-[0.22em] font-black text-white/70">
                  MODERATOR / TV
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white font-sans leading-none">
                RAUM ERSTELLEN
              </h2>
              <p className="text-xs text-white/70 font-bold mt-2 font-sans flex items-center gap-1.5">
                <span>TV-Lobby & Dashboard</span>
                <ArrowRight className="w-4 h-4 inline stroke-[2.5]" />
              </p>
            </div>

            <div className="w-14 h-14 sm:w-16 sm:h-16 surface-2 flex items-center justify-center shrink-0 ml-2 rounded-xl">
              <Tv className="w-8 h-8 text-accent stroke-[2.5]" />
            </div>
          </motion.button>

        </div>
      </footer>

    </div>
  );
}
