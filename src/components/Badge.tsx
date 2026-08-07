import { motion } from "framer-motion";

export type BadgeType = "speed" | "unique" | "clutch" | "clean";

interface BadgeProps {
  type: BadgeType;
  label: string;
  size?: "sm" | "md" | "lg";
}

const badgeConfig: Record<
  BadgeType,
  { color: string; icon: string; bg: string }
> = {
  speed: {
    color: "#00f3ff",
    bg: "rgba(0, 243, 255, 0.1)",
    icon: "M13 2L3 14h9l-1 8 10-12h-9l1-8z", // Lightning
  },
  unique: {
    color: "#ff4d00",
    bg: "rgba(255, 77, 0, 0.1)",
    icon: "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z", // Star
  },
  clutch: {
    color: "#ff00ff",
    bg: "rgba(255, 0, 255, 0.1)",
    icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", // Clock
  },
  clean: {
    color: "#4ade80",
    bg: "rgba(74, 222, 128, 0.1)",
    icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", // Check
  },
};

export function Badge({ type, label, size = "md" }: BadgeProps) {
  const config = badgeConfig[type];
  const sizeScale = size === "sm" ? 0.7 : size === "lg" ? 1.5 : 1;

  return (
    <motion.div
      initial={{ scale: 0, rotate: -20 }}
      animate={{ scale: 1, rotate: 0 }}
      whileHover={{ scale: 1.1, rotate: 5 }}
      className="inline-flex items-center gap-2 px-3 py-1 rounded-sm border relative overflow-hidden group"
      style={{
        borderColor: `${config.color}33`,
        backgroundColor: config.bg,
        transform: `scale(${sizeScale})`,
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />

      <svg
        className="w-4 h-4 badge-glow"
        viewBox="0 0 24 24"
        fill="none"
        stroke={config.color}
        strokeWidth="2"
      >
        <path d={config.icon} strokeLinecap="round" strokeLinejoin="round" />
      </svg>

      <span className="text-[10px] font-black uppercase tracking-widest text-white whitespace-nowrap">
        {label}
      </span>
    </motion.div>
  );
}
