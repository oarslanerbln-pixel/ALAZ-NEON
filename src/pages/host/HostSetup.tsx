import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { collection, addDoc } from "firebase/firestore";
import { db, auth } from "../../lib/firebase";
import { motion } from "framer-motion";
import { NeonIcon } from "../../components/NeonIcon";
import { KineticSpark } from "../../components/KineticSpark";
import { LanguageSwitcher } from "../../components/LanguageSwitcher";
import { useLocale } from "../../hooks/useLocale";
import { useToast } from "../../contexts/ToastContextCore";
import { errorMessage } from "../../lib/errors";
import { useVenue } from "../../contexts/VenueContextCore";

// Premium Dynamic Glass Panel with Spinning Neon Core
function GlassPanel({ 
  children, 
  className = "", 
  neonColor = "rgba(255,85,0,1)", // Default to alaz-orange
  delay = "0s"
}: { 
  children: React.ReactNode; 
  className?: string;
  neonColor?: string;
  delay?: string;
}) {
  return (
    <div 
      className={`relative overflow-hidden group shadow-[0_0_30px_rgba(0,0,0,0.9)] ${className}`}
    >
      <div className="absolute inset-0 z-0 bg-black/40 backdrop-blur-2xl border border-white/10 group-hover:border-transparent transition-all duration-500 rounded-sm" />
      
      {/* Animated glowing border background */}
      <div 
        className="absolute inset-[-50%] z-0 animate-[spin_3s_linear_infinite] opacity-0 group-hover:opacity-100 transition-opacity duration-500" 
        style={{ 
          background: `conic-gradient(from 0deg, transparent 0 270deg, ${neonColor} 360deg)`,
          animationDelay: delay 
        }} 
      />
      <div className="absolute inset-[2px] bg-black/90 backdrop-blur-xl z-10 rounded-sm" />
      <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent pointer-events-none z-10 rounded-sm" />

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
  const isCreatingRef = useRef(false);

  const startLobby = async () => {
    if (isCreatingRef.current) return;
    isCreatingRef.current = true;
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
        isCreatingRef.current = false;
        setIsCreating(false);
      }
  };

  return (
    <div className="flex-1 w-full min-h-screen relative overflow-hidden bg-black">
      {/* PREMIUM CINEMATIC BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <motion.div
          className="absolute inset-0 bg-[url('/images/bg-neon.jpg')] bg-cover bg-center"
          animate={{ scale: [1, 1.08, 1], opacity: [0.15, 0.4, 0.15] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-black/50" />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[10px]" />
      </div>

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
            <GlassPanel className="md:col-span-3 md:row-span-2" neonColor="rgba(255,85,0,1)">
              <div className="p-8 sm:p-12 flex flex-col h-full relative">
                <div className="absolute top-0 right-0 w-64 h-64 bg-alaz-orange/10 blur-[100px] -mr-32 -mt-32 pointer-events-none group-hover:bg-alaz-orange/20 transition-colors" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-neon-blue/10 blur-[100px] -ml-32 -mb-32 pointer-events-none group-hover:bg-neon-blue/20 transition-colors" />

              <div className="flex flex-col items-center justify-center mb-12 relative z-10 text-center">
                <NeonIcon type="settings" color="orange" className="w-16 h-16 mb-4 opacity-80" />
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-black text-transparent bg-clip-text bg-gradient-to-r from-alaz-orange to-yellow-500 tracking-tighter uppercase drop-shadow-[0_0_20px_rgba(255,85,0,0.5)]">
                  {t("setup.title")}
                </h2>
                <p className="text-gray-400 font-bold text-xs mt-3 uppercase tracking-[0.3em]">{t("setup.subtitle")}</p>
              </div>

              <div className="flex-1 relative z-10 w-full max-w-md mx-auto flex flex-col justify-center">
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

              <div className="mt-12 relative z-10 w-full max-w-md mx-auto">
                <button
                  onClick={startLobby}
                  disabled={isCreating}
                  className="relative w-full py-5 sm:py-7 bg-black hover:bg-[#001014] border-2 border-[#00f3ff]/70 hover:border-[#00f3ff] transition-all text-lg sm:text-2xl font-sans font-black uppercase tracking-[0.18em] group shadow-[0_0_40px_rgba(0,243,255,0.45)] hover:shadow-[0_0_60px_rgba(0,243,255,0.7)] hover:scale-[1.02] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none"
                  style={{ clipPath: "polygon(22px 0, calc(100% - 22px) 0, 100% 22px, 100% calc(100% - 22px), calc(100% - 22px) 100%, 22px 100%, 0 calc(100% - 22px), 0 22px)" }}
                >
                  <motion.span
                    className="whitespace-nowrap text-white block"
                    animate={isCreating ? {} : {
                      textShadow: [
                        "0 0 4px rgba(0,243,255,0.8), 0 0 10px rgba(0,243,255,0.4)",
                        "0 0 4px rgba(0,243,255,0.8), 0 0 10px rgba(0,243,255,0.4)",
                        "0 0 1px rgba(0,243,255,0.2)",
                        "0 0 4px rgba(0,243,255,0.8), 0 0 10px rgba(0,243,255,0.4)",
                      ],
                    }}
                    transition={{
                      duration: 2.8,
                      times: [0, 0.32, 0.36, 1],
                      repeat: Infinity,
                      ease: "linear",
                    }}
                  >
                    {isCreating ? t("setup.starting", "BAŞLATILIYOR...") : "GECEYİ BAŞLAT →"}
                  </motion.span>
                </button>
              </div>
            </div>
            </GlassPanel>

            {/* Status Bento */}
            <GlassPanel neonColor="rgba(255,0,60,1)" delay="-1s">
              <div className="p-8 flex flex-col justify-center h-full relative">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#ff003c]/10 blur-[50px] pointer-events-none group-hover:bg-[#ff003c]/20 transition-colors" />
                <div className="absolute -bottom-4 -right-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <NeonIcon type="crown" color="pink" className="w-24 h-24" />
                </div>
              <div className="flex items-center gap-3 mb-6 relative z-10">
                <span className="text-[#ff003c] text-[10px] font-black tracking-[0.2em] uppercase flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-[#ff003c] rounded-none animate-pulse" />
                  {t("setup.statusTitle")}
                </span>
              </div>
              <h3 className="text-2xl font-sans font-black mb-3 text-white tracking-widest uppercase">
                {t("setup.statusWaiting")}
              </h3>
              <p className="text-gray-400 text-xs leading-relaxed font-medium">
                {t("setup.statusDesc")}
              </p>
              </div>
            </GlassPanel>

            {/* Games Info Bento */}
            <GlassPanel neonColor="rgba(0,243,255,1)" delay="-2s">
              <div className="p-8 flex flex-col h-full relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-neon-blue/10 blur-[50px] pointer-events-none group-hover:bg-neon-blue/20 transition-colors" />
              <h3 className="text-[10px] font-black mb-5 text-neon-blue uppercase tracking-[0.2em] relative z-10 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-neon-blue rounded-none animate-pulse" />
                {t("setup.gamesTitle", "OYUN KATALOĞU")}
              </h3>
              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between text-[11px] group/item">
                  <span className="text-white font-bold tracking-wider group-hover/item:text-neon-blue transition-colors">HENGAME <span className="opacity-70 text-cyan-400">QUIZ</span></span>
                  <span className="text-neon-blue font-black border border-neon-blue/30 px-2 py-0.5 rounded-sm text-[9px] shadow-[0_0_10px_rgba(0,243,255,0.2)]">KELİME</span>
                </div>
                <div className="flex items-center justify-between text-[11px] group/item">
                  <span className="text-white font-bold tracking-wider group-hover/item:text-red-500 transition-colors">HENGAME <span className="opacity-70 text-orange-500">BOMB</span></span>
                  <span className="text-red-500 font-black border border-red-500/30 px-2 py-0.5 rounded-sm text-[9px] shadow-[0_0_10px_rgba(255,0,0,0.2)]">ZAMAN</span>
                </div>
                <div className="flex items-center justify-between text-[11px] group/item">
                  <span className="text-white font-bold tracking-wider group-hover/item:text-neon-pink transition-colors">HENGAME <span className="opacity-70 text-purple-400">SENSÖR</span></span>
                  <span className="text-neon-pink font-black border border-neon-pink/30 px-2 py-0.5 rounded-sm text-[9px] shadow-[0_0_10px_rgba(255,0,255,0.2)]">HAREKET</span>
                </div>
                <div className="flex items-center justify-between text-[11px] group/item">
                  <span className="text-white font-bold tracking-wider group-hover/item:text-cyber-yellow transition-colors">HENGAME <span className="opacity-70 text-yellow-500">ÇARK</span></span>
                  <span className="text-cyber-yellow font-black border border-cyber-yellow/30 px-2 py-0.5 rounded-sm text-[9px] shadow-[0_0_10px_rgba(255,215,0,0.2)]">ŞANS</span>
                </div>
                <div className="flex items-center justify-between text-[11px] group/item">
                  <span className="text-white font-bold tracking-wider group-hover/item:text-purple-400 transition-colors">NEON <span className="opacity-70 text-pink-500">SAVAŞLARI</span></span>
                  <span className="text-purple-400 font-black border border-purple-400/30 px-2 py-0.5 rounded-sm text-[9px] shadow-[0_0_10px_rgba(168,85,247,0.2)]">TAKIM</span>
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
