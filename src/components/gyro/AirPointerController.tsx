import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDeviceAirPointer } from "./useDeviceAirPointer";
import { haptics } from "../../lib/haptics";
import { SoundManager, sounds } from "../../lib/audio";
import { DURATION, EASE, SPRING } from "../../lib/motion";

interface AirPointerControllerProps {
  playerColor?: "cyan" | "orange" | "pink" | "green";
  playerNickname?: string;
  onFire?: (coords: { x: number; y: number }) => void;
  disabled?: boolean;
}

const COLOR_MAP = {
  cyan: {
    border: "border-cyan-400",
    bg: "bg-cyan-500",
    glow: "shadow-[0_0_25px_rgba(0,243,255,0.4)]",
    text: "text-cyan-400",
    laser: "#00f3ff",
  },
  orange: {
    border: "border-alaz-orange",
    bg: "bg-alaz-orange",
    glow: "shadow-[0_0_25px_rgba(255,85,0,0.4)]",
    text: "text-alaz-orange",
    laser: "#ff5500",
  },
  pink: {
    border: "border-rose-400",
    bg: "bg-rose-500",
    glow: "shadow-[0_0_25px_rgba(244,63,94,0.4)]",
    text: "text-rose-400",
    laser: "#f43f5e",
  },
  green: {
    border: "border-emerald-400",
    bg: "bg-emerald-500",
    glow: "shadow-[0_0_25px_rgba(16,185,129,0.4)]",
    text: "text-emerald-400",
    laser: "#10b981",
  },
};

export function AirPointerController({
  playerColor = "cyan",
  playerNickname = "NİŞANCI",
  onFire,
  disabled = false,
}: AirPointerControllerProps) {
  const { x, y, isSupported, permissionState, recalibrate, requestPermission } = useDeviceAirPointer();
  const [isRecoil, setIsRecoil] = useState(false);
  const [touchCoords, setTouchCoords] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const touchAreaRef = useRef<HTMLDivElement | null>(null);

  const theme = COLOR_MAP[playerColor];

  // Aktif koordinat: jiroskop aktifse o, yoksa dokunmatik alan
  const activeX = permissionState === "granted" ? x : touchCoords.x;
  const activeY = permissionState === "granted" ? y : touchCoords.y;

  const handleShoot = useCallback(() => {
    if (disabled || isRecoil) return;

    setIsRecoil(true);
    haptics.impact();
    SoundManager.getInstance().playSFX(sounds.CLICK, 0.7);

    if (onFire) {
      onFire({ x: activeX, y: activeY });
    }

    setTimeout(() => {
      setIsRecoil(false);
    }, 180);
  }, [disabled, isRecoil, onFire, activeX, activeY]);

  // Dokunmatik fallback kaydırma
  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (permissionState === "granted") return;
    const rect = touchAreaRef.current?.getBoundingClientRect();
    if (!rect) return;

    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    const relX = ((clientX - rect.left) / rect.width) * 2 - 1;
    const relY = ((clientY - rect.top) / rect.height) * 2 - 1;

    setTouchCoords({
      x: Math.max(-1, Math.min(1, Number(relX.toFixed(3)))),
      y: Math.max(-1, Math.min(1, Number(relY.toFixed(3)))),
    });
  };

  return (
    <div className="relative w-full h-full min-h-[580px] flex flex-col justify-between p-4 select-none overflow-hidden bg-black text-white">
      {/* Geri Tepme (Recoil Flash) Efekti */}
      <AnimatePresence>
        {isRecoil && (
          <motion.div
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: EASE.out }}
            className="absolute inset-0 bg-white pointer-events-none z-50 mix-blend-overlay"
          />
        )}
      </AnimatePresence>

      {/* Üst HUD: Hedefleme Durumu & Kalibrasyon */}
      <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <span className={`w-3 h-3 rounded-full ${theme.bg} animate-pulse`} />
          <span className="font-mono text-xs tracking-widest font-black uppercase text-white/90">
            {playerNickname}
          </span>
        </div>

        {/* Jiroskop İzin Uyarısı (iOS Safari için) */}
        {permissionState === "prompt" && (
          <button
            onClick={() => requestPermission()}
            className="px-3 py-1 bg-cyan-500/20 border border-cyan-400 text-cyan-300 font-mono text-[11px] font-bold rounded-lg animate-bounce"
          >
            ⚡ Sensörü Aç
          </button>
        )}

        <button
          onClick={() => {
            recalibrate();
            haptics.tap();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 rounded-xl text-xs font-mono font-bold tracking-wider transition-all"
        >
          <span>🎯</span>
          <span>Merkezle</span>
        </button>
      </div>

      {/* Orta Alan: 3D Holografik Hedefleme Kadranı */}
      <div
        ref={touchAreaRef}
        onTouchMove={handleTouchMove}
        onMouseMove={handleTouchMove}
        className="relative flex-1 my-4 flex items-center justify-center rounded-3xl border border-white/15 bg-black/40 backdrop-blur-xl overflow-hidden"
      >
        {/* Radar Arka Plan Grid Çizgileri */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

        {/* Eksen Kılavuz Çizgileri */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-full h-[1px] bg-white/10" />
          <div className="absolute h-full w-[1px] bg-white/10" />
        </div>

        {/* İç Jiroskop Halkaları */}
        <div className="absolute w-44 h-44 rounded-full border border-white/10 pointer-events-none" />
        <div className="absolute w-28 h-28 rounded-full border border-white/15 pointer-events-none border-dashed" />

        {/* Dinamik Lazer Nişangahı (Reticle) */}
        <motion.div
          animate={{
            x: activeX * 110,
            y: activeY * 110,
            scale: isRecoil ? 1.3 : 1,
          }}
          transition={{ duration: 0.04, ease: "linear" }}
          className="relative z-20 w-14 h-14 flex items-center justify-center pointer-events-none"
        >
          {/* Lazer Retikül Halkası */}
          <div className={`absolute inset-0 rounded-full border-2 ${theme.border} ${theme.glow}`} />
          {/* Merkez Nokta */}
          <div className={`w-2.5 h-2.5 rounded-full ${theme.bg}`} />
          {/* Dikey ve Yatay Retikül Bıyıkları */}
          <div className={`absolute top-0 w-[2px] h-2 ${theme.bg}`} />
          <div className={`absolute bottom-0 w-[2px] h-2 ${theme.bg}`} />
          <div className={`absolute left-0 h-[2px] w-2 ${theme.bg}`} />
          <div className={`absolute right-0 h-[2px] w-2 ${theme.bg}`} />
        </motion.div>

        {/* Koordinat Telemetrisi */}
        <div className="absolute bottom-3 left-4 font-mono text-[10px] text-white/50 tracking-wider">
          X: {activeX > 0 ? `+${activeX}` : activeX} | Y: {activeY > 0 ? `+${activeY}` : activeY}
        </div>
      </div>

      {/* Alt Alan: Büyük Siber Ateşleme Tetiği */}
      <div className="relative z-10 w-full flex flex-col gap-2">
        <motion.button
          whileTap={{ scale: 0.94 }}
          onClick={handleShoot}
          disabled={disabled}
          className={`w-full py-6 rounded-3xl font-black text-xl tracking-[0.25em] uppercase border-2 text-white shadow-2xl transition-all relative overflow-hidden ${
            disabled
              ? "bg-white/10 border-white/10 text-white/40 cursor-not-allowed"
              : `${theme.bg} ${theme.border} ${theme.glow} active:brightness-125`
          }`}
        >
          {/* İç Plazma Parıltısı */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-white/20 pointer-events-none" />

          {/* Lazer Köşebentler */}
          <div className="absolute top-2 left-3 w-3 h-3 border-t-2 border-l-2 border-white/80" />
          <div className="absolute top-2 right-3 w-3 h-3 border-t-2 border-r-2 border-white/80" />
          <div className="absolute bottom-2 left-3 w-3 h-3 border-b-2 border-l-2 border-white/80" />
          <div className="absolute bottom-2 right-3 w-3 h-3 border-b-2 border-r-2 border-white/80" />

          <span className="relative z-10 drop-shadow-md">💥 ATEŞLE</span>
        </motion.button>
      </div>
    </div>
  );
}
