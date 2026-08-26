import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc } from "firebase/firestore";
import { db, auth } from "../../lib/firebase";
import { motion } from "framer-motion";
import { NeonIcon } from "../../components/NeonIcon";
import { KineticSpark } from "../../components/KineticSpark";
import { LanguageSwitcher } from "../../components/LanguageSwitcher";
import { ParticleBackground } from "../../components/ParticleBackground";
import { useLocale } from "../../hooks/useLocale";
import { useToast } from "../../contexts/ToastContextCore";
import { errorMessage } from "../../lib/errors";
import { useVenue } from "../../contexts/VenueContextCore";

// Premium Glass Panel with Looping Neon Animation
function GlassPanel({ 
  children, 
  className = "", 
  neonColor = "rgba(255,215,0,0.8)",
  delay = "0s"
}: { 
  children: React.ReactNode; 
  className?: string;
  neonColor?: string;
  delay?: string;
}) {
  return (
    <div 
      className={`relative overflow-hidden rounded-none border-[0.5px] border-white/20 group shadow-[0_10px_30px_rgba(0,0,0,0.8)] ${className}`}
    >
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0 bg-[linear-gradient(45deg,transparent_35%,var(--neon-color)_50%,transparent_65%)] bg-[length:300%_300%] animate-shine opacity-20" 
          style={{ '--neon-color': neonColor, animationDelay: delay } as React.CSSProperties}
        />
        <div 
          className="absolute inset-[1px] bg-black/80 backdrop-blur-2xl rounded-none z-10 transition-colors duration-500 group-hover:bg-black/90" 
        />
      </div>
      <div className="relative z-20 h-full">
        {children}
      </div>
    </div>
  );
}

// Helper to generate a 4-character random code
const generateRoomCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export function HostSetup() {
  const navigate = useNavigate();
  const { t, locale } = useLocale();
  const { showToast } = useToast();
  const { venue } = useVenue();
  const [isCreating, setIsCreating] = useState(false);

  const startLobby = async () => {
    setIsCreating(true);
    // Defaults for the room, to be overridden by individual games
    localStorage.setItem("cafe_game_timer", "60");
    localStorage.setItem("cafe_game_mode", "individual");

    try {
      const roomCode = generateRoomCode();

      const docRef = await addDoc(collection(db, "rooms"), {
          code: roomCode,
          status: "night_lobby",
          active_game: "none",
          categories: [],
          timer_setting: 60,
          total_rounds: 3,
          current_round: 0,
          time_left: 0,
          game_mode: "individual",
          locale: locale,
          created_at: Date.now(),
          host_uid: auth.currentUser?.uid || "anonymous",
          // Aktif mekan markasının anlık kopyası — canlı referans değil,
          // bkz. types/database.ts Room.venue_* alanlarındaki not.
          venue_name: venue.name,
          venue_logo_url: venue.logo_url || null,
          venue_primary_color: venue.primary_color || null,
        });
        
        navigate(`/host/display?roomId=${docRef.id}`);
      } catch (err) {
        console.error("Error creating room:", err);
        showToast(t("setup.errorCreate") + errorMessage(err), "error");
        setIsCreating(false);
      }
  };

  return (
    <div className="flex-1 w-full min-h-screen relative overflow-hidden bg-black">
      {/* Deep Cinematic Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,77,0,0.15),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(0,243,255,0.1),transparent_50%)] pointer-events-none" />
      <ParticleBackground speedMultiplier={0.3} />

      <div className="p-10 max-w-5xl mx-auto w-full relative z-10">
        <motion.div
          key="content"
          initial={{ opacity: 0, y: 40, filter: "blur(20px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full h-full relative"
        >
          <header className="mb-12 pointer-events-none opacity-90 scale-[0.6] origin-left">
            <div className="absolute top-10 w-full h-[120px] opacity-20 pointer-events-none">
              <KineticSpark
                className="scale-50"
                delay={-1}
              />
            </div>
          </header>

          <button
            onClick={() => navigate("/")}
            className="mb-8 flex items-center gap-2 text-alaz-orange/70 hover:text-alaz-orange transition-colors text-xs font-bold uppercase tracking-widest relative z-20"
          >
            <span className="text-xl">←</span> {t("common.back", "ANA SAYFA")}
          </button>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 auto-rows-[minmax(220px,auto)]">
            {/* Main Settings Panel */}
            <GlassPanel className="md:col-span-3 md:row-span-2" neonColor="rgba(255,215,0,0.8)">
              <div className="p-10 flex flex-col h-full relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-neon-blue/10 blur-[100px] -mr-32 -mt-32 pointer-events-none" />

              <div className="flex justify-between items-start mb-10 relative z-10">
                <div>
                  <h2 className="text-3xl font-sans font-black text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-alaz-orange tracking-tighter uppercase">
                    {t("setup.title")}
                  </h2>
                  <p className="text-gray-400 font-bold text-xs mt-1 uppercase tracking-widest">{t("setup.subtitle")}</p>
                </div>
              </div>

              <div className="flex-1 relative z-10 w-full max-w-md mx-auto">
                {/* Language Selector */}
                <div>
                  <label className="block text-[10px] uppercase tracking-[0.2em] font-medium text-gray-500 mb-3">
                    {t("setup.languageLabel")}
                  </label>
                  <LanguageSwitcher
                    className="w-full"
                    fullWidth
                  />
                </div>
              </div>

              <div className="mt-10 relative z-10">
                <button
                  onClick={startLobby}
                  disabled={isCreating}
                  className="w-full py-6 bg-gradient-to-r from-neon-blue to-teal-400 text-black font-black text-lg uppercase tracking-[0.2em] transition-all hover:scale-[1.01] hover:shadow-[0_0_40px_rgba(0,229,255,0.4)] disabled:opacity-50 disabled:hover:scale-100 rounded-none shadow-[0_0_20px_rgba(0,0,0,0.5)]"
                >
                  {isCreating
                    ? t("setup.starting")
                    : "GECEYİ BAŞLAT →"}
                </button>
              </div>
            </div>
            </GlassPanel>

            {/* Status Bento */}
            <GlassPanel neonColor="rgba(255,0,60,0.8)" delay="-1s">
              <div className="p-8 flex flex-col justify-center h-full relative">
                <div className="absolute -bottom-4 -right-4 opacity-5 group-hover:opacity-10 transition-opacity">
                  <NeonIcon type="crown" color="pink" className="w-24 h-24" />
                </div>
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <span className="text-[#ff003c] text-[10px] font-semibold tracking-widest uppercase">
                  {t("setup.statusTitle")}
                </span>
              </div>
              <h3 className="text-2xl font-sans font-semibold mb-3 text-white tracking-tight uppercase">
                {t("setup.statusWaiting")}
              </h3>
              <p className="text-gray-400 text-xs leading-relaxed font-medium">
                {t("setup.statusDesc")}
              </p>
              </div>
            </GlassPanel>

            {/* Games Info Bento */}
            <GlassPanel neonColor="rgba(0,243,255,0.8)" delay="-2s">
              <div className="p-8 flex flex-col h-full relative">
              <h3 className="text-lg font-sans font-semibold mb-5 text-white uppercase tracking-tight relative z-10">
                {t("setup.gamesTitle", "OYUN KATALOĞU")}
              </h3>
              <div className="space-y-3 relative z-10">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-gray-400 font-bold">HENGAME QUIZ</span>
                  <span className="text-neon-blue font-black border border-neon-blue/30 px-2 py-0.5 rounded-full text-[9px]">KELİME</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-gray-400 font-bold">HENGAME BOMB</span>
                  <span className="text-neon-pink font-black border border-neon-pink/30 px-2 py-0.5 rounded-full text-[9px]">ZAMAN</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-gray-400 font-bold">HENGAME SENSÖR</span>
                  <span className="text-purple-400 font-black border border-purple-500/30 px-2 py-0.5 rounded-full text-[9px]">HAREKET</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-gray-400 font-bold">HENGAME ÇARK</span>
                  <span className="text-cyber-yellow font-black border border-cyber-yellow/30 px-2 py-0.5 rounded-full text-[9px]">ŞANS</span>
                </div>
              </div>
                <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-neon-blue/5 blur-3xl rounded-full" />
              </div>
            </GlassPanel>

            {/* History Bento */}
            <GlassPanel className="md:col-span-1" neonColor="rgba(255,0,60,0.8)" delay="-3s">
              <div className="p-6 flex items-center justify-between h-full opacity-60 hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-5">
                  <div>
                    <h3 className="text-xs font-sans font-semibold text-gray-500 uppercase tracking-widest mb-1">
                      {t("setup.historyTitle")}
                    </h3>
                    <p className="text-[10px] text-gray-600">
                      {t("setup.historyEmpty")}
                    </p>
                  </div>
                </div>
              </div>
            </GlassPanel>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
