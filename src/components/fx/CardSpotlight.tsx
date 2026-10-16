import { useState, type CSSProperties, type MouseEvent, type ReactNode } from "react";
import { useReducedMotion } from "framer-motion";

export type SpotlightColor = "orange" | "blue" | "cyan" | "purple" | "pink" | "green";

interface CardSpotlightProps {
  children: ReactNode;
  /** Spot ışığının neon rengi. */
  color?: SpotlightColor;
  /** `color` için takma ad (alias). */
  tone?: SpotlightColor;
  /** Spot yarıçapı (px, varsayılan: 280). */
  size?: number;
  /** TV gibi fare olmayan ortamlarda spotun yavaşça kendiliğinden süzülmesi (varsayılan: false). */
  ambient?: boolean;
  radius?: string;
  className?: string;
  innerClassName?: string;
  style?: CSSProperties;
}

const COLOR_MAP: Record<SpotlightColor, { rgb: string; border: string }> = {
  orange: { rgb: "255,85,0", border: "rgba(255,85,0,0.3)" },
  blue: { rgb: "0,229,255", border: "rgba(0,229,255,0.3)" },
  cyan: { rgb: "0,229,255", border: "rgba(0,229,255,0.3)" },
  purple: { rgb: "179,0,255", border: "rgba(179,0,255,0.3)" },
  pink: { rgb: "255,0,255", border: "rgba(255,0,255,0.3)" },
  green: { rgb: "0,255,42", border: "rgba(0,255,42,0.3)" },
};

/**
 * Üzerinde gezinirken veya TV ortamında yumuşakça süzülen neon odak ışığı
 * (Aceternity UI "Card Spotlight" deseni).
 *
 * `filter: blur` yerine doğrudan donanım hızlandırmalı `radial-gradient`
 * kullanır. Ekran kartını yormaz, zayıf TV çubuklarında 60 FPS çalışır.
 */
export function CardSpotlight({
  children,
  color,
  tone,
  size = 280,
  ambient = false,
  radius = "1.25rem",
  className = "",
  innerClassName = "bg-[#0a0b12]/90",
  style,
}: CardSpotlightProps) {
  const reduced = useReducedMotion();
  const activeColor = color ?? tone ?? "blue";
  const theme = COLOR_MAP[activeColor] ?? COLOR_MAP.blue;

  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (reduced) return;
    const rect = e.currentTarget.getBoundingClientRect();
    setPosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const handleMouseEnter = () => setIsHovered(true);
  const handleMouseLeave = () => {
    setIsHovered(false);
    setPosition(null);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`group relative isolate overflow-hidden border transition-colors duration-300 ${className}`}
      style={{
        borderRadius: radius,
        borderColor: isHovered ? theme.border : "rgba(255,255,255,0.08)",
        ...style,
      }}
    >
      {/* İnteraktif veya ambiyans spot ışığı katmanı */}
      {!reduced && (
        <div
          aria-hidden="true"
          className={`pointer-events-none absolute inset-0 transition-opacity duration-300 ${
            ambient ? "opacity-100" : isHovered ? "opacity-100" : "opacity-0"
          }`}
          style={{
            background: position
              ? `radial-gradient(${size}px circle at ${position.x}px ${position.y}px, rgba(${theme.rgb},0.18), transparent 80%)`
              : ambient
                ? `radial-gradient(${size * 1.2}px circle at 50% 30%, rgba(${theme.rgb},0.12), transparent 80%)`
                : undefined,
          }}
        />
      )}

      {/* İç panel içeriği */}
      <div className={`relative h-full w-full ${innerClassName}`}>{children}</div>
    </div>
  );
}
