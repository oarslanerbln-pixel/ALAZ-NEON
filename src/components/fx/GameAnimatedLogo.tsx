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
    case "sensor":
      return <SensorLogo glow={glow} isWatermark={isWatermark} />;
    case "overload":
      return <OverloadLogo glow={glow} isWatermark={isWatermark} />;
    case "colors":
      return <ColorsLogo glow={glow} isWatermark={isWatermark} />;
    case "wheel":
      return <WheelLogo glow={glow} isWatermark={isWatermark} />;
    case "vault":
      return <VaultLogo glow={glow} isWatermark={isWatermark} />;
    case "unity":
      return <UnityLogo glow={glow} isWatermark={isWatermark} />;
    case "echo":
      return <EchoLogo glow={glow} isWatermark={isWatermark} />;
    case "pulse":
      return <PulseLogo glow={glow} isWatermark={isWatermark} />;
    case "bar":
      return <BarLogo glow={glow} isWatermark={isWatermark} />;
    case "kablo":
      return <KabloLogo glow={glow} isWatermark={isWatermark} />;
    case "ayna":
      return <AynaLogo glow={glow} isWatermark={isWatermark} />;
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

/* ─────────────────────────────────────────────────────────────
   4. HENGAME SENSÖR - 360° Dönen Jiroskop & Radar Dalgası
   ───────────────────────────────────────────────────────────── */
function SensorLogo({ glow }: { glow: boolean; isWatermark: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
      <defs>
        <linearGradient id="sensor-beam" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f43f5e" />
          <stop offset="100%" stopColor="#d946ef" />
        </linearGradient>
      </defs>

      {/* Dış Jiroskop Halkası (X eksenli döner) */}
      <motion.circle
        cx="50"
        cy="50"
        r="44"
        fill="none"
        stroke="#f43f5e"
        strokeWidth="1.5"
        strokeDasharray="14 6"
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "50px 50px" }}
      />

      {/* Orta Jiroskop Halkası (Ters döner) */}
      <motion.ellipse
        cx="50"
        cy="50"
        rx="36"
        ry="20"
        fill="none"
        stroke="#d946ef"
        strokeWidth="2"
        animate={{ rotate: -360 }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "50px 50px" }}
      />

      {/* Radar Tarayıcı Işık Demeti */}
      <motion.path
        d="M50 50 L84 30 A40 40 0 0 0 50 10 Z"
        fill="url(#sensor-beam)"
        opacity="0.35"
        animate={{ rotate: 360 }}
        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "50px 50px" }}
      />

      {/* Merkezdeki Jiroskop Çekirdeği (Telefon/Sensör İkonu) */}
      <motion.circle
        cx="50"
        cy="50"
        r="10"
        fill="#ffffff"
        stroke="#ec4899"
        strokeWidth="3"
        animate={{
          scale: [0.9, 1.25, 0.9],
          filter: glow
            ? [
                "drop-shadow(0 0 6px rgba(236,72,153,0.5))",
                "drop-shadow(0 0 16px rgba(236,72,153,0.9))",
                "drop-shadow(0 0 6px rgba(236,72,153,0.5))",
              ]
            : "none",
        }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "50px 50px" }}
      />
      <circle cx="50" cy="50" r="4" fill="#d946ef" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   5. NEON OVERLOAD - Aşırı Enerji Yükü & Plazma Şimşekleri
   ───────────────────────────────────────────────────────────── */
function OverloadLogo({ glow }: { glow: boolean; isWatermark: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
      {/* Taşan Plazma Enerji Halkaları */}
      <motion.circle
        cx="50"
        cy="50"
        r="38"
        fill="none"
        stroke="#06b6d4"
        strokeWidth="2"
        strokeDasharray="4 6"
        animate={{
          scale: [0.95, 1.15, 0.95],
          rotate: 180,
          opacity: [0.6, 1, 0.6],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "50px 50px" }}
      />

      <motion.circle
        cx="50"
        cy="50"
        r="44"
        fill="none"
        stroke="#a855f7"
        strokeWidth="1.5"
        strokeDasharray="12 12"
        animate={{
          scale: [1.1, 0.95, 1.1],
          rotate: -180,
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "50px 50px" }}
      />

      {/* Yüksek Voltaj Yıldırım Sembolü */}
      <motion.path
        d="M54 14 L30 50 L48 50 L42 86 L70 44 L52 44 Z"
        fill="url(#overload-grad)"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinejoin="round"
        animate={{
          scale: [0.95, 1.08, 0.95],
          filter: glow
            ? [
                "drop-shadow(0 0 6px rgba(6,182,212,0.6))",
                "drop-shadow(0 0 24px rgba(168,85,247,0.95))",
                "drop-shadow(0 0 6px rgba(6,182,212,0.6))",
              ]
            : "none",
        }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "50px 50px" }}
      />

      <defs>
        <linearGradient id="overload-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22d3ee" />
          <stop offset="50%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#ec4899" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   6. NEON SAVAŞLARI (Colors) - Çarpışan 4 Takım Rengi
   ───────────────────────────────────────────────────────────── */
function ColorsLogo({ glow }: { glow: boolean; isWatermark: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
      {/* 4 Renk Yörüngede Dönüp Ortada Çarpışıyor */}
      <motion.g
        animate={{ rotate: 360 }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "50px 50px" }}
      >
        {/* Kırmızı Takım Küresi */}
        <motion.circle
          cx="50"
          cy="20"
          r="14"
          fill="#ef4444"
          opacity="0.85"
          animate={{ scale: [1, 1.2, 0.9, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        {/* Mavi Takım Küresi */}
        <motion.circle
          cx="80"
          cy="50"
          r="14"
          fill="#3b82f6"
          opacity="0.85"
          animate={{ scale: [0.9, 1, 1.2, 0.9] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
        />
        {/* Sarı Takım Küresi */}
        <motion.circle
          cx="50"
          cy="80"
          r="14"
          fill="#eab308"
          opacity="0.85"
          animate={{ scale: [1.2, 0.9, 1, 1.2] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1 }}
        />
        {/* Yeşil Takım Küresi */}
        <motion.circle
          cx="20"
          cy="50"
          r="14"
          fill="#10b981"
          opacity="0.85"
          animate={{ scale: [1, 1.2, 0.9, 1] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
        />
      </motion.g>

      {/* Merkezdeki Çarpışma Işıltısı */}
      <motion.circle
        cx="50"
        cy="50"
        r="16"
        fill="#ffffff"
        animate={{
          scale: [0.8, 1.3, 0.8],
          opacity: [0.7, 1, 0.7],
          filter: glow ? "drop-shadow(0 0 16px rgba(255,255,255,0.9))" : "none",
        }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "50px 50px" }}
      />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   7. HENGAME ÇARK - Dönen Altın Neon Rulet & Şans Yıldızları
   ───────────────────────────────────────────────────────────── */
function WheelLogo({ glow }: { glow: boolean; isWatermark: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
      {/* 8 Dilimli Dönen Çark */}
      <motion.g
        animate={{ rotate: 360 }}
        transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "50px 50px" }}
      >
        <circle cx="50" cy="50" r="42" fill="none" stroke="#eab308" strokeWidth="3" />
        {/* Dilim Çizgileri */}
        <line x1="50" y1="8" x2="50" y2="92" stroke="#eab308" strokeWidth="2" opacity="0.6" />
        <line x1="8" y1="50" x2="92" y2="50" stroke="#eab308" strokeWidth="2" opacity="0.6" />
        <line x1="20" y1="20" x2="80" y2="80" stroke="#f97316" strokeWidth="2" opacity="0.6" />
        <line x1="20" y1="80" x2="80" y2="20" stroke="#f97316" strokeWidth="2" opacity="0.6" />

        {/* Dilim Uçlarındaki Neon Noktalar */}
        <circle cx="50" cy="14" r="3" fill="#ffffff" />
        <circle cx="86" cy="50" r="3" fill="#ffffff" />
        <circle cx="50" cy="86" r="3" fill="#ffffff" />
        <circle cx="14" cy="50" r="3" fill="#ffffff" />
      </motion.g>

      {/* Merkez Göbek */}
      <circle cx="50" cy="50" r="14" fill="#f97316" stroke="#fbbf24" strokeWidth="3" />
      <circle cx="50" cy="50" r="6" fill="#ffffff" />

      {/* Sabit Üst Gösterge İbresi (Ticker) */}
      <polygon
        points="50,14 44,4 56,4"
        fill="#ef4444"
        stroke="#ffffff"
        strokeWidth="1.5"
        style={{ filter: glow ? "drop-shadow(0 0 8px rgba(239,68,68,0.8))" : "none" }}
      />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   8. NEON ŞİFRE (Vault) - Dönen Kasa Çarkı & Lazer Taraması
   ───────────────────────────────────────────────────────────── */
function VaultLogo({ glow }: { glow: boolean; isWatermark: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
      {/* Dış Çentikli Kadran Çemberi */}
      <motion.circle
        cx="50"
        cy="50"
        r="42"
        fill="none"
        stroke="#10b981"
        strokeWidth="3"
        strokeDasharray="4 6"
        animate={{ rotate: 360 }}
        transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "50px 50px" }}
      />

      {/* Ters Yönde Dönen İç Kadran */}
      <motion.circle
        cx="50"
        cy="50"
        r="32"
        fill="none"
        stroke="#14b8a6"
        strokeWidth="2"
        strokeDasharray="10 6"
        animate={{ rotate: -360 }}
        transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "50px 50px" }}
      />

      {/* Kasa Göbeği */}
      <rect x="36" y="36" width="28" height="28" rx="8" fill="#064e3b" stroke="#34d399" strokeWidth="2.5" />
      
      {/* Dönen Şifre Kolu */}
      <motion.g
        animate={{ rotate: [0, 90, 90, 180, 270, 360] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "50px 50px" }}
      >
        <line x1="50" y1="28" x2="50" y2="72" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
        <line x1="28" y1="50" x2="72" y2="50" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" />
        <circle cx="50" cy="50" r="7" fill="#10b981" stroke="#ffffff" strokeWidth="2" />
      </motion.g>

      {/* Kırmızı Lazer Tarama Çizgisi */}
      <motion.line
        x1="10"
        y1="50"
        x2="90"
        y2="50"
        stroke="#ef4444"
        strokeWidth="1.5"
        animate={{
          y1: [20, 80, 20],
          y2: [20, 80, 20],
          opacity: [0.3, 0.9, 0.3],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        style={{ filter: glow ? "drop-shadow(0 0 6px rgba(239,68,68,0.8))" : "none" }}
      />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   9. NEON BİRLİK (Unity) - Birleşen Güç & Geometrik Bağlantı
   ───────────────────────────────────────────────────────────── */
function UnityLogo({ glow }: { glow: boolean; isWatermark: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
      {/* 3 Birleşik Daire (Venn Şeması Gibi Birleşip Ayrılıyor) */}
      <motion.g
        animate={{ rotate: 360 }}
        transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "50px 50px" }}
      >
        <circle cx="50" cy="34" r="22" fill="none" stroke="#f59e0b" strokeWidth="2.5" opacity="0.8" />
        <circle cx="36" cy="58" r="22" fill="none" stroke="#f97316" strokeWidth="2.5" opacity="0.8" />
        <circle cx="64" cy="58" r="22" fill="none" stroke="#ef4444" strokeWidth="2.5" opacity="0.8" />
      </motion.g>

      {/* Merkezdeki Bağlantı Işığı */}
      <motion.circle
        cx="50"
        cy="50"
        r="10"
        fill="#ffffff"
        animate={{
          scale: [0.8, 1.3, 0.8],
          filter: glow ? "drop-shadow(0 0 14px rgba(245,158,11,0.9))" : "none",
        }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "50px 50px" }}
      />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   10. HENGAME ECHO - Yankılanan Ses Dalgaları (Equalizer Pulse)
   ───────────────────────────────────────────────────────────── */
function EchoLogo({ glow }: { glow: boolean; isWatermark: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
      {/* Dışarı Doğru Büyüyen Ses Dalgası Halkaları */}
      {[20, 30, 40].map((r, i) => (
        <motion.circle
          key={r}
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="#818cf8"
          strokeWidth="2"
          animate={{
            scale: [0.8, 1.3, 0.8],
            opacity: [0.2, 0.9, 0.2],
          }}
          transition={{
            duration: 2.2,
            repeat: Infinity,
            delay: i * 0.4,
            ease: "easeInOut",
          }}
          style={{
            transformOrigin: "50px 50px",
            filter: glow ? "drop-shadow(0 0 8px rgba(129,140,248,0.5))" : "none",
          }}
        />
      ))}

      {/* Merkez Mikrofon / İletişim Noktası */}
      <circle cx="50" cy="50" r="10" fill="#6366f1" stroke="#ffffff" strokeWidth="2.5" />
      <circle cx="50" cy="50" r="4" fill="#ffffff" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   11. NEON PULSE - Ritmik EKG Kalp Atışı & Nabız Dalgası
   ───────────────────────────────────────────────────────────── */
function PulseLogo({ glow }: { glow: boolean; isWatermark: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
      {/* Nabız Çemberi */}
      <motion.circle
        cx="50"
        cy="50"
        r="40"
        fill="none"
        stroke="#00f3ff"
        strokeWidth="1.5"
        strokeOpacity="0.4"
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "50px 50px" }}
      />

      {/* EKG Nabız Çizgisi */}
      <motion.path
        d="M10 50 L35 50 L42 24 L50 76 L58 36 L64 54 L68 50 L90 50"
        fill="none"
        stroke="#00f3ff"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        animate={{
          pathLength: [0.1, 1, 0.1],
          pathOffset: [0, 0.9, 0],
          filter: glow
            ? [
                "drop-shadow(0 0 6px rgba(0,243,255,0.6))",
                "drop-shadow(0 0 16px rgba(0,243,255,1))",
                "drop-shadow(0 0 6px rgba(0,243,255,0.6))",
              ]
            : "none",
        }}
        transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
      />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   12. NEON BAR - Kokteyl Kadehi & Yükselen Baloncuklar
   ───────────────────────────────────────────────────────────── */
function BarLogo({ glow }: { glow: boolean; isWatermark: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
      {/* Ambient Cocktail Glow */}
      {glow && (
        <circle cx="50" cy="40" r="18" fill="#f43f5e" opacity="0.25" />
      )}
      {/* Martini / Kokteyl Kadehi */}
      <path
        d="M24 24 L50 56 L76 24 Z"
        fill="rgba(236,72,153,0.2)"
        stroke="#ec4899"
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      {/* Bardak Ayağı & Tabanı */}
      <line x1="50" y1="56" x2="50" y2="82" stroke="#ec4899" strokeWidth="2.5" />
      <line x1="36" y1="82" x2="64" y2="82" stroke="#ec4899" strokeWidth="2.5" strokeLinecap="round" />

      {/* İçecek Seviyesi (Çalkalanan Neon Sıvı) */}
      <motion.path
        d="M32 34 Q50 38 68 34 L50 56 Z"
        fill="#f43f5e"
        animate={{
          d: [
            "M32 34 Q50 38 68 34 L50 56 Z",
            "M32 36 Q50 32 68 36 L50 56 Z",
            "M32 34 Q50 38 68 34 L50 56 Z",
          ],
        }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Yükselen Neon Baloncuklar */}
      <motion.circle
        cx="46"
        cy="40"
        r="2"
        fill="#ffffff"
        animate={{ y: [-2, -22], opacity: [0, 1, 0] }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
      />
      <motion.circle
        cx="54"
        cy="44"
        r="2.5"
        fill="#fbcfe8"
        animate={{ y: [-2, -24], opacity: [0, 1, 0] }}
        transition={{ duration: 1.8, repeat: Infinity, delay: 0.5, ease: "easeOut" }}
      />

      {/* Parlayan Zeytin / Kürdan Çubuğu */}
      <line x1="32" y1="18" x2="60" y2="48" stroke="#a855f7" strokeWidth="2" strokeLinecap="round" />
      <circle cx="48" cy="35" r="4.5" fill="#10b981" stroke="#ffffff" strokeWidth="1" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   13. NEON KABLO - Kıvılcım Atan Yüksek Voltaj Kabloları
   ───────────────────────────────────────────────────────────── */
function KabloLogo({ glow }: { glow: boolean; isWatermark: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
      {/* Sol Kablo */}
      <path
        d="M10 50 Q30 50 38 46"
        fill="none"
        stroke="#f59e0b"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M38 46 L44 44"
        fill="none"
        stroke="#fbbf24"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Sağ Kablo */}
      <path
        d="M90 50 Q70 50 62 54"
        fill="none"
        stroke="#3b82f6"
        strokeWidth="6"
        strokeLinecap="round"
      />
      <path
        d="M62 54 L56 56"
        fill="none"
        stroke="#60a5fa"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* İki Kablo Arasında Patlayan Elektrik Arkı */}
      <motion.path
        d="M44 44 L49 52 L47 47 L56 56"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        animate={{
          opacity: [0.2, 1, 0.4, 1, 0.2],
          scale: [0.9, 1.2, 0.95, 1.15, 0.9],
          filter: glow
            ? [
                "drop-shadow(0 0 4px rgba(251,191,36,0.5))",
                "drop-shadow(0 0 16px rgba(255,255,255,1))",
                "drop-shadow(0 0 4px rgba(59,130,246,0.5))",
              ]
            : "none",
        }}
        transition={{ duration: 0.5, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "50px 50px" }}
      />

      {/* Etrafta Uçuşan Elektrik Kıvılcımları */}
      <motion.circle
        cx="50"
        cy="40"
        r="2"
        fill="#fef08a"
        animate={{
          y: [-2, -14],
          x: [-2, 6],
          opacity: [0, 1, 0],
        }}
        transition={{ duration: 0.8, repeat: Infinity, ease: "easeOut" }}
      />
      <motion.circle
        cx="52"
        cy="60"
        r="2"
        fill="#93c5fd"
        animate={{
          y: [2, 14],
          x: [2, -6],
          opacity: [0, 1, 0],
        }}
        transition={{ duration: 0.9, repeat: Infinity, delay: 0.3, ease: "easeOut" }}
      />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   14. HENGAME AYNA - Sonsuzluk Aynası & Yansıma Prizması
   ───────────────────────────────────────────────────────────── */
function AynaLogo({ glow }: { glow: boolean; isWatermark: boolean }) {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible">
      {/* Dış Elips Ayna Çerçevesi */}
      <motion.ellipse
        cx="50"
        cy="50"
        rx="36"
        ry="44"
        fill="none"
        stroke="#22d3ee"
        strokeWidth="2.5"
        animate={{
          strokeOpacity: [0.6, 1, 0.6],
        }}
        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* İç İkinci Yansıma Elipsi */}
      <motion.ellipse
        cx="50"
        cy="50"
        rx="26"
        ry="32"
        fill="rgba(34,211,238,0.12)"
        stroke="#a855f7"
        strokeWidth="1.5"
        animate={{
          scale: [0.95, 1.05, 0.95],
          strokeOpacity: [0.5, 0.9, 0.5],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "50px 50px" }}
      />

      {/* Üçüncü Derinlik Elipsi */}
      <motion.ellipse
        cx="50"
        cy="50"
        rx="16"
        ry="20"
        fill="rgba(168,85,247,0.2)"
        stroke="#ffffff"
        strokeWidth="1"
        animate={{
          scale: [1.05, 0.9, 1.05],
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        style={{ transformOrigin: "50px 50px" }}
      />

      {/* Aynanın Yüzeyinden Geçen Işık Yansıması Şeridi */}
      <motion.line
        x1="25"
        y1="25"
        x2="75"
        y2="75"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinecap="round"
        animate={{
          opacity: [0, 0.9, 0],
          x1: [15, 35, 15],
          y1: [15, 35, 15],
          x2: [65, 85, 65],
          y2: [65, 85, 65],
          filter: glow ? "drop-shadow(0 0 10px rgba(255,255,255,0.9))" : "none",
        }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
      />
    </svg>
  );
}
