import { motion } from "framer-motion";
import { useLocale } from "../hooks/useLocale";
import { SPRING } from "../lib/motion";

interface ExperienceBarProps {
  progress: number; // 0 to 100
  label?: string;
  color?: string;
  /**
   * "spring": hedefe yayla oturur (XP/ilerleme). "linear": sabit hızla akar —
   * saniyede bir güncellenen geri sayım çubuğunun kesintisiz görünmesi için.
   */
  mode?: "spring" | "linear";
}

/**
 * İlerleme çubuğu. Dolum `width` yerine `scaleX` ile animasyonlu: width her
 * karede layout hesaplatır, scaleX yalnızca compositor'da çalışır.
 */
export function ExperienceBar({
  progress,
  label,
  color = "var(--color-alaz-orange)",
  mode = "spring",
}: ExperienceBarProps) {
  const { t } = useLocale();
  const fraction = Math.min(1, Math.max(0, progress / 100));

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-end px-1">
        {/* label="" = "başlık istemiyorum" demek; `||` bunu yutup varsayılanı
            basıyordu (mobil başlıkta gereksiz "TUR İLERLEMESİ" yazısı). */}
        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
          {label ?? t("xpBar.roundProgress")}
        </span>
        <span className="text-[10px] font-black text-white px-2 py-0.5 rounded bg-white/5 tabular-nums">
          {Math.round(progress)}%
        </span>
      </div>

      <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5 relative">
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: fraction }}
          transition={mode === "linear" ? { duration: 1, ease: "linear" } : SPRING.gentle}
          style={{ backgroundColor: color, originX: 0 }}
          className="h-full w-full relative overflow-hidden progress-glow will-change-transform"
        >
          {/* Animated shine effect */}
          <motion.div
            aria-hidden="true"
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
          />
        </motion.div>
      </div>
    </div>
  );
}
