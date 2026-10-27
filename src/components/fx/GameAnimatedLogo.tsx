import { motion } from "framer-motion";
import type { GameType } from "../../types/database";

interface GameAnimatedLogoProps {
  game: GameType;
  size?: "sm" | "md" | "lg" | "xl" | "watermark";
  className?: string;
  glow?: boolean;
}

const SIZE_MAP = {
  sm: "w-8 h-8",
  md: "w-14 h-14",
  lg: "w-20 h-20",
  xl: "w-28 h-28",
  watermark: "w-80 h-80",
};

/**
 * HENGAME Oyun Modları için Hareketli Neon Logo & Amblem Sistemi.
 * TV ekranında ve mobilde 60 FPS çalışan, GPU dostu SVG + Framer Motion animasyonları.
 */
export function GameAnimatedLogo({
  game,
  size = "lg",
  className = "",
  glow = true,
}: GameAnimatedLogoProps) {
  const sizeClass = SIZE_MAP[size];

  return (
    <div
      className={`relative flex items-center justify-center shrink-0 select-none ${sizeClass} ${className}`}
    >
      {renderGameEmblem(game, glow, size === "watermark")}
    </div>
  );
}

function renderGameEmblem(game: GameType, glow: boolean, isWatermark: boolean) {
  switch (game) {
    case "scattegories":
      return <ArenaLogo glow={glow} isWatermark={isWatermark} />;
    case "quiz":
      return <QuizLogo glow={glow} isWatermark={isWatermark} />;
    case "bomb":
      return <BombLogo glow={glow} isWatermark={isWatermark} />;
  }
}

/* ─────────────────────────────────────────────────────────────
   1. HENGAME ARENA (Kelime Arenası) - Harf Kıvılcımları & Alev Halkası
   ───────────────────────────────────────────────────────────── */
function ArenaLogo({ glow }: { glow: boolean; isWatermark: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
      <defs>
        <linearGradient id="arena-flame" x1="0%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#ff3700" />
          <stop offset="60%" stopColor="#ff7700" />
          <stop offset="100%" stopColor="#ffdd00" />
        </linearGradient>
        <radialGradient id="arena-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ff5500" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#ff5500" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Dönen dış harf ve kıvılcım yörüngesi */}
      <motion.circle
        cx="50"
        cy="50"
        r="44"
        fill="none"
        stroke="#ff6600"
        strokeWidth="1.5"
        strokeDasharray="6 8"
        strokeOpacity="0.6"
        animate={{ rotate: 360 }}
        transition={{ duration: 16, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "50px 50px" }}
      />
      <motion.circle
        cx="50"
        cy="50"
        r="38"
        fill="none"
        stroke="#ffaa00"
        strokeWidth="1.2"
        strokeDasharray="3 12"
        strokeOpacity="0.4"
        animate={{ rotate: -360 }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "50px 50px" }}
      />

      {/* Ambient Flame Glow */}
      {glow && (
        <circle cx="50" cy="55" r="26" fill="url(#arena-glow)" opacity="0.3" />
      )}

      {/* Ana Alev Şekli - Dalgalanan Canlı Ateş */}
      <motion.path
        d="M50 16 C53 28, 66 32, 66 48 C66 62, 58 72, 50 78 C42 72, 34 62, 34 48 C34 32, 47 28, 50 16 Z"
        fill="url(#arena-flame)"
        animate={{
          scaleY: [1, 1.08, 0.96, 1.04, 1],
          scaleX: [1, 0.96, 1.04, 0.98, 1],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "50px 75px" }}
      />

      {/* İç Kor Alev */}
      <motion.path
        d="M50 36 C52 44, 60 48, 60 58 C60 66, 55 72, 50 75 C45 72, 40 66, 40 58 C40 48, 48 44, 50 36 Z"
        fill="#fff4cc"
        animate={{
          scaleY: [1, 1.14, 0.94, 1.1, 1],
          opacity: [0.9, 1, 0.85, 0.95, 0.9],
        }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "50px 72px" }}
      />

      {/* Yükselen Kıvılcımlar */}
      <motion.circle
        cx="44"
        cy="30"
        r="2"
        fill="#ffe580"
        animate={{
          y: [-4, -20],
          x: [-2, -8],
          opacity: [0, 1, 0],
          scale: [0.5, 1.2, 0.2],
        }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
      />
      <motion.circle
        cx="56"
        cy="26"
        r="2.5"
        fill="#ff8800"
        animate={{
          y: [-2, -24],
          x: [2, 7],
          opacity: [0, 1, 0],
          scale: [0.4, 1.4, 0.2],
        }}
        transition={{ duration: 2.2, repeat: Infinity, delay: 0.6, ease: "easeOut" }}
      />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   2. HENGAME QUIZ - Elektrikli Neon Ampul & Soru Halkası
   ───────────────────────────────────────────────────────────── */
function QuizLogo({ glow }: { glow: boolean; isWatermark: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
      <defs>
        <linearGradient id="quiz-bulb" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#00e5ff" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>

      {/* Dönen Sorular ve Şıklar Yörüngesi (A, B, C, D) */}
      <motion.g
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "50px 50px" }}
      >
        <circle cx="50" cy="50" r="42" fill="none" stroke="#00e5ff" strokeWidth="1" strokeDasharray="4 10" strokeOpacity="0.4" />
        <circle cx="50" cy="8" r="3.5" fill="#00e5ff" />
        <circle cx="92" cy="50" r="3" fill="#60a5fa" />
        <circle cx="50" cy="92" r="3.5" fill="#38bdf8" />
        <circle cx="8" cy="50" r="3" fill="#818cf8" />
      </motion.g>

      {/* Ampul Gövdesi */}
      <motion.path
        d="M50 18 C37 18 28 27 28 40 C28 49 34 56 37 62 L63 62 C66 56 72 49 72 40 C72 27 63 18 50 18 Z"
        fill="url(#quiz-bulb)"
        fillOpacity="0.25"
        stroke="#00e5ff"
        strokeWidth="2.5"
        animate={{
          strokeOpacity: [0.7, 1, 0.8, 1, 0.7],
          filter: glow
            ? [
                "drop-shadow(0 0 6px rgba(0,229,255,0.4))",
                "drop-shadow(0 0 18px rgba(0,229,255,0.9))",
                "drop-shadow(0 0 8px rgba(0,229,255,0.5))",
              ]
            : "none",
        }}
        transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Elektrikli Filament - Beyin Kıvrımlı Nabız */}
      <motion.path
        d="M42 45 Q46 32 50 45 Q54 58 58 45"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.5"
        strokeLinecap="round"
        animate={{
          pathLength: [0.6, 1, 0.8, 1],
          opacity: [0.8, 1, 0.7, 1],
        }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Ampul Dibi */}
      <rect x="42" y="66" width="16" height="4" rx="2" fill="#60a5fa" />
      <rect x="44" y="72" width="12" height="4" rx="2" fill="#3b82f6" />
      <ellipse cx="50" cy="78" rx="4" ry="2" fill="#1d4ed8" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   3. HENGAME BOMB - Saatli Bomba & Kıvılcım Atan Canlı Fitil
   ───────────────────────────────────────────────────────────── */
function BombLogo({ glow }: { glow: boolean; isWatermark: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
      <defs>
        <radialGradient id="bomb-body" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#374151" />
          <stop offset="50%" stopColor="#1f2937" />
          <stop offset="100%" stopColor="#111827" />
        </radialGradient>
      </defs>

      {/* Bomba Gövdesi - Nabız Gibi Gergin Tik-Tak Atışı */}
      <motion.circle
        cx="46"
        cy="56"
        r="32"
        fill="url(#bomb-body)"
        stroke="#ef4444"
        strokeWidth="2.5"
        animate={{
          scale: [1, 1.05, 0.98, 1.04, 1],
          filter: glow
            ? [
                "drop-shadow(0 0 8px rgba(239,68,68,0.4))",
                "drop-shadow(0 0 20px rgba(239,68,68,0.8))",
                "drop-shadow(0 0 8px rgba(239,68,68,0.4))",
              ]
            : "none",
        }}
        transition={{ duration: 0.9, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "46px 56px" }}
      />

      {/* Yansıma / Parlama */}
      <ellipse cx="36" cy="44" rx="8" ry="5" fill="#ffffff" opacity="0.3" transform="rotate(-30 36 44)" />

      {/* Bomba Başlığı (Metalik Boğaz) */}
      <rect x="54" y="24" width="12" height="8" rx="1.5" fill="#4b5563" stroke="#ef4444" strokeWidth="1" transform="rotate(35 60 28)" />

      {/* Kıvrımlı Fitil */}
      <path
        d="M62 25 Q70 16 80 18 T88 28"
        fill="none"
        stroke="#fbbf24"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Fitilin Ucunda Kıvılcım Patlaması */}
      <motion.g
        animate={{
          scale: [0.8, 1.4, 0.7, 1.3, 0.8],
          rotate: [0, 45, 90, 180, 270, 360],
        }}
        transition={{ duration: 0.4, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "88px 28px" }}
      >
        <circle cx="88" cy="28" r="5" fill="#ff0000" />
        <circle cx="88" cy="28" r="3" fill="#ffdd00" />
        <line x1="88" y1="20" x2="88" y2="16" stroke="#ffaa00" strokeWidth="2" strokeLinecap="round" />
        <line x1="96" y1="28" x2="100" y2="28" stroke="#ffaa00" strokeWidth="2" strokeLinecap="round" />
        <line x1="88" y1="36" x2="88" y2="40" stroke="#ffaa00" strokeWidth="2" strokeLinecap="round" />
        <line x1="80" y1="28" x2="76" y2="28" stroke="#ffaa00" strokeWidth="2" strokeLinecap="round" />
      </motion.g>

      {/* Dijital Sayaç Sembolü (İçeride Yanan Sayılar) */}
      <text
        x="46"
        y="63"
        textAnchor="middle"
        fill="#ef4444"
        fontSize="20"
        fontWeight="900"
        fontFamily="monospace"
        className="tabular-nums"
      >
        !
      </text>
    </svg>
  );
}
