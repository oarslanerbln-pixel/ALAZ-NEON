import type { GameType } from "../../types/database";

interface GameAnimatedLogoProps {
  game: GameType;
  size?: "sm" | "md" | "lg" | "xl" | "watermark";
  className?: string;
  /** Eski API uyumluluğu için duruyor; amblemler artık parlama çizmiyor. */
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
 * HENGAME oyun modları için sade, tek renkli (vurgu rengi) amblem sistemi.
 * Düz SVG; sürekli animasyon ve parlama yok.
 */
export function GameAnimatedLogo({
  game,
  size = "lg",
  className = "",
}: GameAnimatedLogoProps) {
  const sizeClass = SIZE_MAP[size];

  return (
    <div
      className={`relative flex items-center justify-center shrink-0 select-none ${sizeClass} ${className}`}
    >
      {renderGameEmblem(game)}
    </div>
  );
}

function renderGameEmblem(game: GameType) {
  switch (game) {
    case "scattegories":
      return <ArenaLogo />;
    case "quiz":
      return <QuizLogo />;
    case "bomb":
      return <BombLogo />;
  }
}

/* ─────────────────────────────────────────────────────────────
   1. HENGAME ARENA (Kelime Arenası) - Alev
   ───────────────────────────────────────────────────────────── */
function ArenaLogo() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible text-accent">
      <circle
        cx="50"
        cy="50"
        r="44"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeDasharray="6 8"
        strokeOpacity="0.5"
      />
      <path
        d="M50 16 C53 28, 66 32, 66 48 C66 62, 58 72, 50 78 C42 72, 34 62, 34 48 C34 32, 47 28, 50 16 Z"
        fill="currentColor"
      />
      <path
        d="M50 36 C52 44, 60 48, 60 58 C60 66, 55 72, 50 75 C45 72, 40 66, 40 58 C40 48, 48 44, 50 36 Z"
        fill="#ffffff"
        fillOpacity="0.9"
      />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   2. HENGAME QUIZ - Ampul
   ───────────────────────────────────────────────────────────── */
function QuizLogo() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible text-accent">
      <circle
        cx="50"
        cy="50"
        r="42"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="4 10"
        strokeOpacity="0.4"
      />

      {/* Ampul gövdesi */}
      <path
        d="M50 18 C37 18 28 27 28 40 C28 49 34 56 37 62 L63 62 C66 56 72 49 72 40 C72 27 63 18 50 18 Z"
        fill="currentColor"
        fillOpacity="0.2"
        stroke="currentColor"
        strokeWidth="2.5"
      />

      {/* Filament */}
      <path
        d="M42 45 Q46 32 50 45 Q54 58 58 45"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2.5"
        strokeLinecap="round"
      />

      {/* Ampul dibi */}
      <rect x="42" y="66" width="16" height="4" rx="2" fill="currentColor" />
      <rect x="44" y="72" width="12" height="4" rx="2" fill="currentColor" fillOpacity="0.7" />
      <ellipse cx="50" cy="78" rx="4" ry="2" fill="currentColor" fillOpacity="0.5" />
    </svg>
  );
}

/* ─────────────────────────────────────────────────────────────
   3. HENGAME BOMB - Bomba & fitil
   ───────────────────────────────────────────────────────────── */
function BombLogo() {
  return (
    <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible text-accent">
      {/* Bomba gövdesi */}
      <circle
        cx="46"
        cy="56"
        r="32"
        fill="#1f2937"
        stroke="currentColor"
        strokeWidth="2.5"
      />

      {/* Bomba başlığı */}
      <rect
        x="54"
        y="24"
        width="12"
        height="8"
        rx="1.5"
        fill="#4b5563"
        stroke="currentColor"
        strokeWidth="1"
        transform="rotate(35 60 28)"
      />

      {/* Fitil */}
      <path
        d="M62 25 Q70 16 80 18 T88 28"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="88" cy="28" r="4" fill="currentColor" />

      <text
        x="46"
        y="63"
        textAnchor="middle"
        fill="currentColor"
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
