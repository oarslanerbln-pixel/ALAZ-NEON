import { motion } from "framer-motion";
import { NeonIcon } from "../../../components/NeonIcon";
import type { JulesAward } from "../../../lib/intelligence";
import { QRCodeSVG } from "qrcode.react";
import { useLocale } from "../../../hooks/useLocale";

interface ShareableRecapCardProps {
  awards: { creative: JulesAward | null; funny: JulesAward | null };
  roomCode?: string;
}

export function ShareableRecapCard({ awards, roomCode }: ShareableRecapCardProps) {
  const { t } = useLocale();
  const joinUrl = typeof window !== "undefined" ? `${window.location.origin}?code=${roomCode || ""}` : "";

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
      className="w-80 h-[568px] glass-panel-neon-blue rounded-3xl p-6 flex flex-col relative overflow-hidden shrink-0 shadow-[0_0_40px_rgba(0,243,255,0.2)] ml-8 border border-white/20"
      style={{ aspectRatio: "9/16" }}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-neon-blue/20 to-alaz-orange/10 pointer-events-none" />
      
      <div className="text-center mb-6 relative z-10 pt-2">
        <h2 className="text-3xl font-black text-white tracking-widest uppercase text-glow-neon-blue">{t("recap.title")}</h2>
        <p className="text-[10px] text-neon-blue tracking-[0.3em] uppercase font-bold mt-1">{t("recap.aiVerdict")}</p>
      </div>

      <div className="flex-1 flex flex-col gap-6 relative z-10 justify-center">
        {awards.creative && (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1 }}
            className="glass-panel-alaz p-5 rounded-2xl border-white/10 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-alaz-orange/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <h3 className="text-alaz-orange text-xs font-black uppercase mb-3 flex items-center gap-2">
              <NeonIcon type="rocket" color="orange" className="w-5 h-5" />
              {awards.creative.title}
            </h3>
            <div className="text-3xl font-black text-white truncate drop-shadow-md">{awards.creative.word}</div>
            <div className="text-xs text-gray-400 mt-2 uppercase tracking-widest font-bold">
              <span className="text-white">{awards.creative.playerName}</span> • {awards.creative.category}
            </div>
          </motion.div>
        )}

        {awards.funny && (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="bg-white/5 border border-white/10 p-5 rounded-2xl"
          >
            <h3 className="text-neon-blue text-xs font-black uppercase mb-3 flex items-center gap-2">
              <span className="text-2xl drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">🤡</span>
              {awards.funny.title}
            </h3>
            <div className="text-2xl font-bold text-gray-400 line-through decoration-red-500/70 truncate">{awards.funny.word}</div>
            <div className="text-xs text-gray-500 mt-2 uppercase tracking-widest font-bold">
              <span className="text-gray-300">{awards.funny.playerName}</span> • {awards.funny.category}
            </div>
          </motion.div>
        )}
      </div>

      <div className="mt-auto relative z-10 flex flex-col items-center border-t border-white/20 pt-5">
        <div className="bg-white rounded-xl p-2 shadow-[0_0_15px_rgba(255,255,255,0.3)] mb-3">
          <QRCodeSVG value={joinUrl} size={64} bgColor="#ffffff" fgColor="#000000" />
        </div>
        <p className="text-[10px] font-black text-white uppercase tracking-[0.3em]">
          {t("recap.joinCta")}
        </p>
      </div>
    </motion.div>
  );
}
