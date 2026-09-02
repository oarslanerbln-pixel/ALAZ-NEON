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
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="absolute right-6 top-6 w-72 p-[2px] rounded-2xl group shadow-[0_0_30px_rgba(0,243,255,0.12)] z-30"
    >
      {/* Animated Conic Gradient Border */}
      <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0_180deg,rgba(0,243,255,0.6)_360deg)] animate-[spin_8s_linear_infinite] rounded-2xl opacity-70" />
      <div className="absolute inset-0 bg-[conic-gradient(from_180deg,transparent_0_180deg,rgba(255,77,0,0.6)_360deg)] animate-[spin_8s_linear_infinite] rounded-2xl opacity-70" />
      
      {/* Inner Panel */}
      <div className="absolute inset-[2px] bg-black/85 backdrop-blur-2xl rounded-[14px] z-10 border border-white/10" />

      <div className="relative z-20 p-4 overflow-hidden">
        <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2">
          <div className="flex items-center gap-2">
            <NeonIcon
              type="dashboard"
              color="blue"
              className="w-4 h-4 animate-pulse"
            />
            <h3 className="text-xs font-black text-neon-blue uppercase tracking-[0.2em]">
              {t("intelligence.title")}
            </h3>
          </div>
          <span className="text-[9px] font-mono text-white/40 uppercase tracking-widest">
            AI-TELEMETRY
          </span>
        </div>

        <div className="space-y-3">
          {/* Complexity Score */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                {t("intelligence.roundDifficulty")}
              </span>
              <span className="text-xs font-black text-white tabular-nums">
                %{intel.complexityScore}
              </span>
            </div>
            <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${intel.complexityScore}%` }}
                className={`h-full ${intel.complexityScore > 60 ? "bg-alaz-orange shadow-[0_0_8px_#ff4d00]" : "bg-neon-blue shadow-[0_0_8px_#00f3ff]"}`}
              />
            </div>
          </div>

          {/* Prediction Metrics */}
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-white/[0.03] p-2 rounded-lg border border-white/5">
              <span className="text-[8px] text-gray-400 font-bold uppercase block">
                {t("intelligence.expectedAvg")}
              </span>
              <span className="text-base font-black text-white tabular-nums">
                {intel.expectedAvgScore}
              </span>
            </div>
            <div className="bg-white/[0.03] p-2 rounded-lg border border-white/5">
              <span className="text-[8px] text-gray-400 font-bold uppercase block">
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

          {/* Operational Tip */}
          <div className="bg-black/40 p-2 rounded-lg border border-white/5">
            <p className="text-[10px] text-gray-300 font-medium leading-tight italic line-clamp-2">
              "{intel.operationalTip}"
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
