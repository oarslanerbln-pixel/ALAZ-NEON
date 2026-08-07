import { motion } from "framer-motion";

interface ExperienceBarProps {
  progress: number; // 0 to 100
  label?: string;
  color?: string;
}

export function ExperienceBar({
  progress,
  label,
  color = "var(--color-alaz-orange)",
}: ExperienceBarProps) {
  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-end px-1">
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
          {label || "TUR İLERLEMESİ"}
        </span>
        <span className="text-[10px] font-black text-white px-2 py-0.5 rounded bg-white/5">
          {Math.round(progress)}%
        </span>
      </div>

      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", stiffness: 50, damping: 20 }}
          style={{ backgroundColor: color }}
          className="h-full relative overflow-hidden progress-glow"
        >
          {/* Animated shine effect */}
          <motion.div
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
          />
        </motion.div>
      </div>
    </div>
  );
}
