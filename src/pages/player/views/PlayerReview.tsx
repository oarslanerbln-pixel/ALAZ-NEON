import { motion } from "framer-motion";
import { NeonIcon } from "../../../components/NeonIcon";

interface PlayerReviewProps {
  submitStatus: "idle" | "submitting" | "success" | "error";
}

export function PlayerReview({ submitStatus }: PlayerReviewProps) {
  return (
    <motion.div
      key="review"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="h-full flex flex-col items-center justify-center text-center py-12"
    >
      <div className="w-24 h-24 rounded-sm glass-panel-alaz border-4 border-neon-blue flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(0,243,255,0.2)]">
        <NeonIcon type="users" color="blue" className="w-12 h-12" />
      </div>
      <h2 className="text-3xl font-black text-white italic mb-4">
        DEĞERLENDİRME
      </h2>
      <p className="text-gray-400 max-w-xs mx-auto leading-relaxed">
        Tur sona erdi! Cevapların host tarafından inceleniyor. Diğer tur için
        hazırlan.
      </p>
      {submitStatus === "success" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-8 px-6 py-3 rounded-sm bg-neon-green/10 border border-neon-green/20 text-neon-green font-bold text-sm tracking-widest flex items-center gap-2"
        >
          <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
          CEVAPLARIN ATILDI!
        </motion.div>
      )}
    </motion.div>
  );
}
