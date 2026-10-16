import type { CSSProperties, ReactNode } from "react";

export type BeamColor = "orange" | "cyan" | "blue" | "purple" | "pink" | "green" | "gold";

const BEAM_COLORS: Record<BeamColor, string> = {
  orange: "255,85,0",
  cyan: "56,189,248",
  blue: "0,229,255",
  purple: "179,0,255",
  pink: "255,0,255",
  green: "0,255,42",
  gold: "255,230,0",
};

interface BeamBorderProps {
  children: ReactNode;
  /** Renk teması veya doğrudan "r,g,b" biçiminde renk kodu. */
  color?: BeamColor;
  /** Işığın rengi, "r,g,b" biçiminde (ör. "56,189,248"). */
  rgb?: string;
  /** Bir tam turun süresi (sn). */
  duration?: number;
  /** Kenarlık kalınlığı (px). */
  thickness?: number;
  radius?: string;
  className?: string;
  /** İç panelin arka planı — ışığın ortayı kaplamaması için opak olmalı. */
  innerClassName?: string;
  style?: CSSProperties;
}

/**
 * Kenarı boyunca yavaşça dolaşan ince bir ışık (Magic UI "Border Beam" /
 * Motion Primitives "Border Trail" deseninden uyarlandı).
 *
 * Yalnızca `transform` animasyonu: kutunun arkasında büyük, konik gradyanlı
 * bir kare döner; üstündeki opak iç panel ortasını örter, geriye kenardan
 * `thickness` px'lik bir şerit kalır. Paint/layout tetiklemez, TV kutusunun
 * zayıf GPU'sunda da akıcı. `prefers-reduced-motion`'da ışık durur, ince
 * kenarlık kalır.
 */
export function BeamBorder({
  children,
  color,
  rgb,
  duration = 6,
  thickness = 1.5,
  radius = "1.5rem",
  className = "",
  innerClassName = "bg-[#07080d]",
  style,
}: BeamBorderProps) {
  const activeRgb = (color && BEAM_COLORS[color]) ? BEAM_COLORS[color] : (rgb ?? "56,189,248");

  return (
    <div
      className={`relative isolate overflow-hidden bg-white/[0.08] ${className}`}
      style={{ borderRadius: radius, padding: thickness, ...style }}
    >
      <span
        aria-hidden="true"
        className="fx-beam"
        style={{
          background: `conic-gradient(from 0deg, transparent 0 72%, rgba(${activeRgb},0.15) 82%, rgba(${activeRgb},1) 96%, transparent 100%)`,
          animationDuration: `${duration}s`,
        }}
      />
      <div className={`relative h-full ${innerClassName}`} style={{ borderRadius: `calc(${radius} - ${thickness}px)` }}>
        {children}
      </div>
    </div>
  );
}
