import type { CSSProperties } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { DURATION, EASE, SPRING } from "../../lib/motion";

export type KineticMode = "words" | "characters";
export type KineticAnimation = "pullUp" | "pop" | "fade";

interface KineticTextProps {
  text: string;
  mode?: KineticMode;
  /** `mode` için takma ad (alias) — 'word' | 'character' | 'words' | 'characters'. */
  by?: "word" | "character" | "words" | "characters";
  animation?: KineticAnimation;
  /** İlk parça öncesi bekleme (sn). */
  delay?: number;
  /** Parçalar arası gecikme (sn). */
  stagger?: number;
  /** Dinamik gerilim / renk tonu. */
  tone?: "neutral" | "cyan" | "orange" | "purple" | "crimson" | "gold";
  as?: "h1" | "h2" | "h3" | "p" | "span" | "div";
  className?: string;
  style?: CSSProperties;
}

const TONE_CLASSES: Record<NonNullable<KineticTextProps["tone"]>, string> = {
  neutral: "text-white",
  cyan: "text-[#00e5ff] drop-shadow-[0_0_12px_rgba(0,229,255,0.4)]",
  orange: "text-[#ff5500] drop-shadow-[0_0_12px_rgba(255,85,0,0.4)]",
  purple: "text-[#b300ff] drop-shadow-[0_0_12px_rgba(179,0,255,0.4)]",
  crimson: "text-[#ff0055] drop-shadow-[0_0_14px_rgba(255,0,85,0.5)]",
  gold: "text-[#ffe600] drop-shadow-[0_0_12px_rgba(255,230,0,0.4)]",
};

/**
 * Kelime veya harf bazlı dinamik kinetik tipografi (Motion Primitives / Magic UI Text Effect).
 *
 * Yalnızca `transform` ve `opacity` animasyonu uygular. Ekran okuyucu
 * için tek parça `aria-label` sunar; alt span'ler `aria-hidden` ile gizlenir.
 */
export function KineticText({
  text,
  mode,
  by,
  animation = "pullUp",
  delay = 0,
  stagger,
  tone = "neutral",
  as = "h1",
  className = "",
  style,
}: KineticTextProps) {
  const reduced = useReducedMotion();
  const effectiveMode: KineticMode =
    by === "character" || by === "characters" || mode === "characters" ? "characters" : "words";
  const effectiveStagger = stagger ?? (effectiveMode === "characters" ? 0.025 : 0.07);
  const Tag = motion[as];

  if (reduced) {
    return (
      <Tag className={`${TONE_CLASSES[tone]} ${className}`} style={style}>
        {text}
      </Tag>
    );
  }

  const items = effectiveMode === "words" ? text.split(/\s+/).filter(Boolean) : text.split("");

  const getVariants = (): Variants => {
    switch (animation) {
      case "pop":
        return {
          hidden: { opacity: 0, scale: 0.6 },
          visible: { opacity: 1, scale: 1, transition: SPRING.bouncy },
        };
      case "fade":
        return {
          hidden: { opacity: 0 },
          visible: { opacity: 1, transition: { duration: DURATION.base, ease: EASE.out } },
        };
      case "pullUp":
      default:
        return {
          hidden: { opacity: 0, y: "0.4em" },
          visible: { opacity: 1, y: 0, transition: { duration: DURATION.slow, ease: EASE.out } },
        };
    }
  };

  const itemVariants = getVariants();

  return (
    <Tag
      className={`${TONE_CLASSES[tone]} ${className}`}
      style={style}
      aria-label={text}
      initial="hidden"
      animate="visible"
      transition={{ staggerChildren: effectiveStagger, delayChildren: delay }}
    >
      {items.map((item, index) => (
        <motion.span
          key={`${item}-${index}`}
          aria-hidden="true"
          className="inline-block whitespace-pre"
          variants={itemVariants}
        >
          {item}
          {effectiveMode === "words" && index < items.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </Tag>
  );
}
