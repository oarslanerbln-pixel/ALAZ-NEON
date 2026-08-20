import { motion } from "framer-motion";
import { getRoundIntelligence } from "../lib/intelligence";
import { NeonIcon } from "./NeonIcon";
import { useLocale } from "../hooks/useLocale";

interface IntelligenceWidgetProps {
  currentLetter: string;
  categories: string[];
  playerCount: number;
  timeLeft: number;
  currentRound: number;
}

export function IntelligenceWidget({
  currentLetter,
  categories,
  playerCount,
  timeLeft,
  currentRound,
}: IntelligenceWidgetProps) {
  const { t } = useLocale();
  const intel = getRoundIntelligence(
    currentLetter,
    categories,
    playerCount,
    timeLeft,
    currentRound,
  );

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute right-8 top-32 w-80 relative p-[3px] rounded-2xl group shadow-[0_0_30px_rgba(0,243,255,0.15)] hover:shadow-[0_0_50px_rgba(0,243,255,0.3)] transition-all duration-500"
    >
      {/* Animated Conic Gradient Border */}
      <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0_180deg,rgba(0,243,255,0.8)_360deg)] animate-[spin_5s_linear_infinite] rounded-2xl" />
      <div className="absolute inset-0 bg-[conic-gradient(from_180deg,transparent_0_180deg,rgba(255,77,0,0.8)_360deg)] animate-[spin_5s_linear_infinite] rounded-2xl" />
      
      {/* Inner Panel */}
      <div className="absolute inset-[3px] bg-black/90 backdrop-blur-2xl rounded-[14px] z-10 border border-neon-blue/20" />
      
      {/* Background Glow Effect */}
      <div className="absolute inset-[3px] bg-neon-blue/5 blur-3xl z-10 rounded-[14px]" />

      <div className="relative z-20 p-6 overflow-hidden">
        <div className="flex items-center gap-2 mb-6 border-b border-neon-blue/10 pb-3">
        <NeonIcon
          type="dashboard"
          color="blue"
          className="w-5 h-5 animate-pulse"
        />
        <h3 className="text-sm font-black text-neon-blue uppercase tracking-widest">
          {t("intelligence.title")}
        </h3>
      </div>

      <div className="space-y-6">
        {/* Complexity Score */}
        <div>
          <div className="flex justify-between mb-2">
            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
              {t("intelligence.roundDifficulty")}
            </span>
            <span className="text-xs font-black text-white">
              {intel.complexityScore}%
            </span>
          </div>
          <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${intel.complexityScore}%` }}
              className={`h-full ${intel.complexityScore > 60 ? "bg-alaz-orange shadow-[0_0_10px_#ff4d00]" : "bg-neon-blue shadow-[0_0_10px_#00f3ff]"}`}
            />
          </div>
        </div>

        {/* Prediction Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white/5 p-3 rounded-xl border border-white/5">
            <span className="text-[9px] text-gray-500 font-bold uppercase block mb-1">
              {t("intelligence.expectedAvg")}
            </span>
            <span className="text-xl font-black text-white">
              {intel.expectedAvgScore}
            </span>
            <span className="text-[8px] text-gray-500 block">
              {t("intelligence.pointsPerPlayer")}
            </span>
          </div>
          <div className="bg-white/5 p-3 rounded-xl border border-white/5">
            <span className="text-[9px] text-gray-500 font-bold uppercase block mb-1">
              {t("intelligence.marketStatus")}
            </span>
            <span
              className={`text-xs font-black uppercase ${
                intel.marketStability === "Kaotik"
                  ? "text-alaz-orange"
                  : "text-neon-blue"
              }`}
            >
              {intel.marketStability}
            </span>
          </div>
        </div>

        {/* Operational Tip - The SaaS Wisdom */}
        <div className="bg-black/40 p-4 rounded-2xl border border-white/5 relative group">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-neon-blue/40 rounded-full" />
          <span className="text-[9px] text-gray-500 font-bold uppercase block mb-2 tracking-widest">
            {t("intelligence.operationalTip")}
          </span>
          <p className="text-[11px] text-gray-300 font-medium leading-relaxed italic">
            "{intel.operationalTip}"
          </p>
        </div>
      </div>

      {/* Real-time scanning effect */}
      <motion.div
        animate={{ top: ["0%", "100%", "0%"] }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        className="absolute left-0 right-0 h-px bg-neon-blue/20 -z-10"
      />
      </div>
    </motion.div>
  );
}
