import type { ButtonHTMLAttributes, CSSProperties, ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { SPRING } from "../../lib/motion";

export type ShimmerColor = "orange" | "blue" | "purple" | "pink" | "green" | "yellow";

interface ShimmerButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onAnimationStart" | "onDrag" | "onDragEnd" | "onDragStart"> {
  children: ReactNode;
  /** Butonun neon renk teması. */
  color?: ShimmerColor;
  /** `color` için takma ad (alias). */
  tone?: ShimmerColor;
  /** Dokunulduğunda mobil cihazlarda hafif haptik titreşim (varsayılan: true). */
  haptic?: boolean;
  /** Kenarlık kalınlığı (px, varsayılan: 1.5). */
  thickness?: number;
  /** Köşe yuvarlaklığı (varsayılan: "1rem"). */
  radius?: string;
  /** Bir tur ışık döngü süresi (sn, varsayılan: 4). */
  shimmerDuration?: number;
  className?: string;
  innerClassName?: string;
  style?: CSSProperties;
}

const COLOR_MAP: Record<ShimmerColor, { rgb: string; borderGlow: string; bgTint: string }> = {
  orange: { rgb: "255,85,0", borderGlow: "rgba(255,85,0,0.4)", bgTint: "rgba(255,85,0,0.06)" },
  blue: { rgb: "0,229,255", borderGlow: "rgba(0,229,255,0.4)", bgTint: "rgba(0,229,255,0.06)" },
  purple: { rgb: "179,0,255", borderGlow: "rgba(179,0,255,0.4)", bgTint: "rgba(179,0,255,0.06)" },
  pink: { rgb: "255,0,255", borderGlow: "rgba(255,0,255,0.4)", bgTint: "rgba(255,0,255,0.06)" },
  green: { rgb: "0,255,42", borderGlow: "rgba(0,255,42,0.4)", bgTint: "rgba(0,255,42,0.06)" },
  yellow: { rgb: "255,230,0", borderGlow: "rgba(255,230,0,0.4)", bgTint: "rgba(255,230,0,0.06)" },
};

/**
 * Neon ışık huzmeli, dokunulduğunda yaylanan (squash & stretch) ve
 * haptik geri bildirimli premium buton (Magic UI "Shimmer Button" + Jackbox "Juice").
 *
 * Yalnızca transform ve opacity kullanır. `prefers-reduced-motion` tercihinde
 * dönen ışık durdurulur ve statik neon çerçeveye indirgenir.
 */
export function ShimmerButton({
  children,
  color,
  tone,
  haptic = true,
  thickness = 1.5,
  radius = "1rem",
  shimmerDuration = 4,
  className = "",
  innerClassName = "bg-[#0c0d14] text-white",
  style,
  onClick,
  disabled,
  type = "button",
  ...rest
}: ShimmerButtonProps) {
  const reduced = useReducedMotion();
  const activeColor = color ?? tone ?? "orange";
  const theme = COLOR_MAP[activeColor] ?? COLOR_MAP.orange;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (haptic && typeof window !== "undefined" && "navigator" in window) {
      try {
        if (typeof window.navigator.vibrate === "function") {
          window.navigator.vibrate(12);
        }
      } catch {
        // Haptik desteklenmiyorsa sessizce devam et
      }
    }
    onClick?.(e);
  };

  return (
    <motion.button
      type={type}
      disabled={disabled}
      onClick={handleClick}
      whileHover={reduced || disabled ? undefined : { scale: 1.02 }}
      whileTap={reduced || disabled ? undefined : { scale: 0.94 }}
      transition={SPRING.stiff}
      className={`group relative isolate inline-flex items-center justify-center overflow-hidden font-medium select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 disabled:pointer-events-none disabled:opacity-40 ${className}`}
      style={{
        borderRadius: radius,
        padding: thickness,
        boxShadow: disabled ? "none" : `0 8px 24px -6px ${theme.borderGlow}`,
        ...style,
      }}
      {...rest}
    >
      {/* Arka planda dönen konik ışık huzmesi */}
      {!disabled && !reduced && (
        <span
          aria-hidden="true"
          className="fx-beam pointer-events-none"
          style={{
            background: `conic-gradient(from 0deg, transparent 0 65%, rgba(${theme.rgb},0.15) 80%, rgba(${theme.rgb},1) 95%, transparent 100%)`,
            animationDuration: `${shimmerDuration}s`,
          }}
        />
      )}

      {/* İç panel (katman içeriği) */}
      <span
        className={`relative z-10 flex h-full w-full items-center justify-center gap-2 px-5 py-3 transition-colors duration-200 group-hover:brightness-110 ${innerClassName}`}
        style={{
          borderRadius: `calc(${radius} - ${thickness}px)`,
        }}
      >
        {children}
      </span>
    </motion.button>
  );
}
