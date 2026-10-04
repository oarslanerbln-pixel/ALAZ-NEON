/** Quiz şıklarının renkleri (A/B/C/D) — TV soru ekranı. */
export const OPTION_STYLES = {
  A: { border: "border-cyan-500", text: "text-cyan-400", bg: "bg-cyan-500/20", glow: "shadow-[0_0_25px_rgba(6,182,212,0.4)]" },
  B: { border: "border-pink-500", text: "text-pink-400", bg: "bg-pink-500/20", glow: "shadow-[0_0_25px_rgba(236,72,153,0.4)]" },
  C: { border: "border-amber-400", text: "text-amber-400", bg: "bg-amber-500/20", glow: "shadow-[0_0_25px_rgba(251,191,36,0.4)]" },
  D: { border: "border-emerald-500", text: "text-emerald-400", bg: "bg-emerald-500/20", glow: "shadow-[0_0_25px_rgba(16,185,129,0.4)]" },
} as const;

export type OptionStyles = typeof OPTION_STYLES;
