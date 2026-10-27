import { LanguageSwitcher } from "../../../components/LanguageSwitcher";
import { useLocale } from "../../../hooks/useLocale";
import { Volume2, VolumeX, Radio, Home, LayoutGrid, Mic, MicOff, MoreHorizontal, Flag } from "lucide-react";
import { SoundManager, sounds } from "../../../lib/audio";
import { hostAnnouncer } from "../../../lib/announcerPlayer";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
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
  /** Çıkış onayı için gösterilecek çeviri anahtarı (varsayılan: ana sayfaya dönüş). */
  exitConfirmKey?: "common.confirmExitHome" | "common.confirmEndNight";
  /** Çıkış düğmesinin etiketi; geceyi kapatan dashboard "GECEYİ BİTİR" der. */
  exitLabelKey?: "common.back" | "common.endNight";
}

/**
 * TV üst çubuğu. Salon yalnızca markayı ve oda kodunu görür; personel
 * kontrolleri (lobiye dön, reklam arası, erken bitir, ses, spiker, dil,
 * çıkış) tek bir "⋯" menüsünde durur — izleyicinin ekranını kalabalıklaştırmaz.
 */
export function HostHeader({
  room,
  onEndGameEarly,
  onTriggerAdBreak,
  onReturnToLobby,
  onExitToHome,
  exitConfirmKey = "common.confirmExitHome",
  exitLabelKey = "common.back",
}: HostHeaderProps) {
  const { t } = useLocale();
  const navigate = useNavigate();
  const [isMuted, setIsMuted] = useState(() => SoundManager.getInstance().getIsMuted());
  const [isVoiceMuted, setIsVoiceMuted] = useState(() => hostAnnouncer.isVoiceMuted());
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onPointer = (e: PointerEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const handleToggleMute = () => {
    const muted = SoundManager.getInstance().toggleMute();
    if (muted) hostAnnouncer.stop();
    setIsMuted(muted);
  };

  // Spiker müzikten bağımsız susturulabilir: bazı mekanlar müzik ister, anons istemez.
  const handleToggleVoice = () => {
    hostAnnouncer.setVoiceMuted(!isVoiceMuted);
    setIsVoiceMuted(!isVoiceMuted);
  };

  const handleReturnToLobby = () => {
    SoundManager.getInstance().playSFX(sounds.CLICK);
    setMenuOpen(false);
    if (window.confirm(t("common.confirmReturnLobby", "Mevcut oyunu bitirip lobiye dönmek istiyor musunuz?"))) {
      onReturnToLobby?.();
    }
  };

  const handleExitHome = () => {
    SoundManager.getInstance().playSFX(sounds.CLICK);
    setMenuOpen(false);
    if (window.confirm(t(exitConfirmKey))) {
      if (onExitToHome) {
        onExitToHome();
      } else {
        navigate("/");
      }
    }
  };

  if (!room) return null;

  const isMiniGameActive = room.status !== "night_lobby" && (room.active_game && room.active_game !== "none");
  const venueName = room.venue_name && room.venue_name !== "HENGAME" ? room.venue_name : null;

  return (
    <header className="relative z-20 flex items-center justify-between h-20 mb-6 select-none">
      <div className="flex items-center gap-4 min-w-0">
        {room.venue_logo_url ? (
          <img src={room.venue_logo_url} alt="" className="w-12 h-12 object-contain rounded-xl" />
        ) : (
          <span className="w-3 h-3 rounded-full bg-accent" aria-hidden="true" />
        )}
        <span className="text-3xl font-extrabold tracking-tight text-ink">HENGAME</span>
        {venueName && <span className="text-2xl text-ink-2 truncate max-w-[480px]">· {venueName}</span>}
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-baseline gap-3">
          <span className="text-2xl text-ink-2">{t("hostHeader.roomCode")}</span>
          <span className="text-5xl font-mono font-extrabold tracking-[0.12em] text-ink">{room.code || "…"}</span>
        </div>

        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={t("hostHeader.menu")}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-ink-3 hover:text-ink hover:bg-surface-2 transition-colors"
          >
            <MoreHorizontal className="w-8 h-8" />
          </button>

          <AnimatePresence>
            {menuOpen && (
              <motion.div
                key="host-menu"
                role="menu"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 top-full mt-3 w-[420px] surface rounded-2xl p-2 flex flex-col"
              >
                {isMiniGameActive && onReturnToLobby && (
                  <MenuItem icon={<LayoutGrid className="w-6 h-6" />} onClick={handleReturnToLobby}>
                    {t("common.returnToLobby")}
                  </MenuItem>
                )}
                {onTriggerAdBreak && (
                  <MenuItem
                    icon={<Radio className="w-6 h-6" />}
                    onClick={() => {
                      setMenuOpen(false);
                      onTriggerAdBreak();
                    }}
                  >
                    {t("hostHeader.adBreak")}
                  </MenuItem>
                )}
                {onEndGameEarly && (
                  <MenuItem
                    icon={<Flag className="w-6 h-6" />}
                    tone="bad"
                    onClick={() => {
                      setMenuOpen(false);
                      onEndGameEarly();
                    }}
                  >
                    {t("hostHeader.endEarly")}
                  </MenuItem>
                )}
                <MenuItem icon={isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />} onClick={handleToggleMute}>
                  {isMuted ? t("common.soundOn") : t("common.soundOff")}
                </MenuItem>
                <MenuItem icon={isVoiceMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />} onClick={handleToggleVoice}>
                  {isVoiceMuted ? t("hostHeader.voiceOn") : t("hostHeader.voiceOff")}
                </MenuItem>
                <div className="flex items-center justify-between gap-4 px-4 py-3">
                  <span className="text-2xl text-ink-2">{t("hostHeader.language")}</span>
                  <LanguageSwitcher />
                </div>
                <div className="h-px bg-line my-1" />
                <MenuItem icon={<Home className="w-6 h-6" />} onClick={handleExitHome}>
                  {t(exitLabelKey)}
                </MenuItem>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
}

function MenuItem({
  icon,
  children,
  onClick,
  tone,
}: {
  icon: ReactNode;
  children: ReactNode;
  onClick: () => void;
  tone?: "bad";
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={`flex items-center gap-4 px-4 py-3 rounded-xl text-2xl font-semibold text-left transition-colors hover:bg-surface-2 ${
        tone === "bad" ? "text-bad" : "text-ink"
      }`}
    >
      <span className="text-ink-3">{icon}</span>
      {children}
    </button>
  );
}
