interface GridPatternProps {
  /** Hücre boyu (px). */
  size?: number;
  /** Çizgi opaklığı (0–1). */
  opacity?: number;
  className?: string;
}

/**
 * Merkezden kenarlara doğru sönen ince ızgara dokusu (Magic UI "Grid
 * Pattern"). Statik — hiç animasyon yok; boş siyah alana derinlik verir.
 */
export function GridPattern({ size = 72, opacity = 0.05, className = "" }: GridPatternProps) {
  const line = `rgba(255,255,255,${opacity})`;
  return (
    <div
      aria-hidden="true"
      className={`absolute inset-0 pointer-events-none ${className}`}
      style={{
        backgroundImage: `linear-gradient(${line} 1px, transparent 1px), linear-gradient(90deg, ${line} 1px, transparent 1px)`,
        backgroundSize: `${size}px ${size}px`,
        backgroundPosition: "center center",
        WebkitMaskImage: "radial-gradient(ellipse 70% 60% at 50% 45%, #000 30%, transparent 100%)",
        maskImage: "radial-gradient(ellipse 70% 60% at 50% 45%, #000 30%, transparent 100%)",
      }}
    />
  );
}
