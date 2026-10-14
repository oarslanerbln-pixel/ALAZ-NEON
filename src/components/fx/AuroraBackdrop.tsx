const POSITIONS = [
  { left: "22%", top: "28%" },
  { left: "78%", top: "34%" },
  { left: "50%", top: "82%" },
] as const;

interface AuroraBackdropProps {
  /** En fazla üç renk, "r,g,b" biçiminde. */
  colors?: readonly string[];
  /** Renk yoğunluğu (0–1). Okunabilirlik için 0.35'in üstüne çıkma. */
  intensity?: number;
  className?: string;
}

/**
 * Ekranın arkasında yavaşça süzülen renk bulutları (Magic UI "Aurora" /
 * Motion Primitives "Glow Effect" deseni).
 *
 * `filter: blur()` yerine `radial-gradient(closest-side, …)` ile yumuşak
 * kenar — bulanıklık filtresi her karede yeniden boyanır, gradyan boyanmaz.
 * Hareket yalnızca `transform`; 18–26 sn'lik döngüler göze "nefes alan"
 * bir mekân hissi verir, dikkat dağıtmaz.
 */
export function AuroraBackdrop({ colors = ["56,189,248", "168,85,247", "255,85,0"], intensity = 0.28, className = "" }: AuroraBackdropProps) {
  return (
    <div aria-hidden="true" className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {colors.slice(0, POSITIONS.length).map((rgb, i) => (
        <span
          key={rgb + i}
          className="fx-aurora-blob"
          style={{
            ...POSITIONS[i],
            background: `radial-gradient(closest-side, rgba(${rgb},${intensity}), transparent)`,
            animationDuration: `${18 + i * 4}s`,
            animationDelay: `${-i * 5}s`,
          }}
        />
      ))}
    </div>
  );
}
