import { NeonIcon } from "../../../components/NeonIcon";
import { LanguageSwitcher } from "../../../components/LanguageSwitcher";
import { useLocale } from "../../../hooks/useLocale";
import { Volume2, VolumeX, Sparkles, Radio, Home, LayoutGrid } from "lucide-react";
import { SoundManager, sounds } from "../../../lib/audio";
import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

interface HostHeaderProps {
  room: {
    code: string;
    current_round: number;
    total_rounds: number;
    status: string;
    venue_name?: string;
    venue_logo_url?: string | null;
    active_game?: string;
  } | null;
  onEndGameEarly?: () => void;
  onTriggerAdBreak?: () => void;
  onReturnToLobby?: () => void;
  onExitToHome?: () => void;
}

export function HostHeader({
  room,
  onEndGameEarly,
  onTriggerAdBreak,
  onReturnToLobby,
  onExitToHome,
}: HostHeaderProps) {
  const { t } = useLocale();
  const navigate = useNavigate();
  const [isMuted, setIsMuted] = useState(() => SoundManager.getInstance().getIsMuted());

  const handleToggleMute = () => {
    setIsMuted(SoundManager.getInstance().toggleMute());
  };

  const handleReturnToLobby = () => {
    SoundManager.getInstance().playSFX(sounds.CLICK);
    if (window.confirm(t("common.confirmReturnLobby", "Mevcut oyunu bitirip lobiye dönmek istiyor musunuz?"))) {
      if (onReturnToLobby) {
        onReturnToLobby();
      }
    }
  };

  const handleExitHome = () => {
    SoundManager.getInstance().playSFX(sounds.CLICK);
    if (window.confirm(t("common.confirmExitHome", "Ana sayfaya dönmek istediğinizden emin misiniz?"))) {
      if (onExitToHome) {
        onExitToHome();
      } else {
        navigate("/");
      }
    }
  };

  if (!room) return null;

  const isMiniGameActive = room.status !== "night_lobby" && (room.active_game && room.active_game !== "none");

  return (
    <header className="flex justify-between items-center mb-6 relative z-20 bg-[#08080f]/85 p-3.5 md:p-5 rounded-[2rem] border border-white/15 backdrop-blur-3xl shadow-[0_15px_40px_-10px_rgba(0,0,0,0.8)] select-none">
      
      {/* Brand & Venue Logo + Navigation Back Buttons */}
      <div className="flex items-center gap-3 md:gap-4">
        
        {/* Lobiye Dön Butonu (Oyun aktifken) */}
        {isMiniGameActive && onReturnToLobby && (
          <button
            onClick={handleReturnToLobby}
            className="flex items-center gap-2 text-xs font-mono font-bold text-alaz-orange hover:text-white bg-alaz-orange/10 hover:bg-alaz-orange border border-alaz-orange/40 hover:border-alaz-orange px-3.5 py-2 rounded-2xl transition-all active:scale-95 cursor-pointer shadow-[0_0_15px_rgba(255,85,0,0.25)]"
            title={t("common.returnToLobby", "LOBİYE DÖN")}
            aria-label={t("common.returnToLobby", "LOBİYE DÖN")}
          >
            <LayoutGrid className="w-4 h-4" />
            <span className="hidden sm:inline uppercase tracking-wider">{t("common.returnToLobby", "LOBİYE DÖN")}</span>
          </button>
        )}

        {/* Ana Sayfa Çıkış Butonu */}
        <button
          onClick={handleExitHome}
          className="flex items-center gap-1.5 text-xs font-mono font-bold text-white/70 hover:text-white bg-white/5 hover:bg-white/15 border border-white/15 hover:border-white/40 px-3.5 py-2 rounded-2xl transition-all active:scale-95 cursor-pointer"
          title={t("common.back", "ANA SAYFA")}
          aria-label={t("common.back", "ANA SAYFA")}
        >
          <Home className="w-4 h-4 text-cyan-400" />
          <span className="hidden md:inline uppercase tracking-wider">{t("common.back", "ANA SAYFA")}</span>
        </button>

        {/* Venue Avatar & Name */}
        <div className="flex items-center gap-3 pl-2 border-l border-white/10">
          {room.venue_logo_url ? (
            <img
              src={room.venue_logo_url}
              alt="Venue Logo"
              className="w-9 h-9 object-contain rounded-xl border border-white/20 bg-black/40 p-1"
            />
          ) : (
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-alaz-orange/20 to-yellow-500/20 border border-alaz-orange/40 flex items-center justify-center shadow-[0_0_15px_rgba(255,85,0,0.3)]">
              <Sparkles className="w-4 h-4 text-alaz-orange animate-pulse" />
            </div>
          )}
          <div className="hidden sm:block">
            <div className="flex items-center gap-1.5">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[9px] font-mono font-bold tracking-[0.2em] uppercase text-emerald-400">
                LIVE TV
              </span>
            </div>
            <h1 className="text-sm md:text-base font-black tracking-tight uppercase text-white drop-shadow-md font-sans truncate max-w-[160px]">
              {room.venue_name || "ALAZ NEON"}
            </h1>
          </div>
        </div>
      </div>

      {/* Round & Status Center Pill */}
      {(room.status === "playing" ||
        room.status === "review" ||
        room.status === "standings" ||
        room.status === "finished") && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2.5 px-4 md:px-6 py-2 border border-white/20 rounded-full bg-white/[0.06] shadow-[0_0_25px_rgba(255,255,255,0.05)] backdrop-blur-xl"
        >
          <NeonIcon
            type="history"
            color="white"
            className="w-3.5 h-3.5 animate-spin-slow opacity-80"
          />
          <span className="text-white font-black text-xs tracking-[0.2em] uppercase font-mono">
            {t("hostHeader.roundLabel", room.current_round, room.total_rounds)}
          </span>
        </motion.div>
      )}

      {/* Control Actions & Room Code */}
      <div className="flex items-center gap-2.5 md:gap-3.5">
        {onTriggerAdBreak && (
          <button
            onClick={onTriggerAdBreak}
            className="text-[11px] text-white/80 hover:text-white border border-white/15 hover:border-white/40 bg-white/5 hover:bg-white/15 px-3.5 py-2 rounded-2xl uppercase tracking-[0.15em] font-bold transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <Radio className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden md:inline">{t("hostHeader.adBreak")}</span>
          </button>
        )}

        <LanguageSwitcher />

        <button
          onClick={handleToggleMute}
          className="w-9 h-9 md:w-10 md:h-10 rounded-2xl bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-white/80 hover:text-white transition-all active:scale-95 cursor-pointer"
          title={isMuted ? "Sesi Aç" : "Sesi Kapat"}
          aria-label={isMuted ? "Sesi Aç" : "Sesi Kapat"}
          aria-pressed={isMuted}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>

        {onEndGameEarly && (
          <button
            onClick={onEndGameEarly}
            className="text-[10px] text-red-400 hover:text-red-300 border border-red-500/30 hover:bg-red-500/20 bg-red-950/40 px-3 py-2 rounded-2xl uppercase tracking-[0.15em] font-bold transition-all active:scale-95 cursor-pointer"
          >
            {t("hostHeader.endEarly")}
          </button>
        )}

        {/* Room Code OLED Badge */}
        <div className="flex items-center gap-2 bg-black/70 px-3.5 py-1.5 md:py-2 rounded-2xl border border-alaz-orange/50 shadow-[0_0_20px_rgba(255,85,0,0.25)]">
          <span className="text-[9px] text-gray-400 uppercase tracking-[0.15em] font-mono font-bold">
            {t("hostHeader.roomCode")}
          </span>
          <span className="text-lg md:text-xl font-mono font-black tracking-widest text-alaz-orange">
            {room.code || "..."}
          </span>
        </div>
      </div>
    </header>
  );
}
