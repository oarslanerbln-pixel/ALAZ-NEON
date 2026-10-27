import { motion, AnimatePresence } from "framer-motion";
import { PlayerBackground } from "../../../components/PlayerBackground";
import { useLocale } from "../../../hooks/useLocale";
import { SPRING, TWEEN } from "../../../lib/motion";

interface PlayerReviewProps {
  submitStatus: "idle" | "submitting" | "success" | "error";
}

export function PlayerReview({ submitStatus }: PlayerReviewProps) {
  const { t } = useLocale();
  return (
    <motion.div
      key="review"
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={TWEEN.screen}
      className="flex flex-col items-center justify-center text-center p-8 min-h-[60vh] relative z-10"
    >
      <PlayerBackground />

      {/* 3D Kilitli Kasa Rozeti (Cyber Vault Lock) */}
      <div className="relative mb-8">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ ...SPRING.snappy, delay: 0.1 }}
          className={`w-24 h-24 rounded-3xl flex items-center justify-center relative border transition-colors duration-250 ${
            submitStatus === "success"
              ? "bg-ok/10 border-ok/60"
              : "surface"
          }`}
        >
          <AnimatePresence mode="wait">
            {submitStatus === "success" ? (
              <motion.div
                key="check"
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={SPRING.bouncy}
                className="text-4xl text-emerald-400"
              >
                ✓
              </motion.div>
            ) : (
              <motion.div
                key="loader"
                animate={{ rotate: 360 }}
                transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                className="w-10 h-10 rounded-full border-2 border-white/15 border-t-alaz-orange"
              />
            )}
          </AnimatePresence>
        </motion.div>

      </div>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...TWEEN.enter, delay: 0.2 }}
        className="text-2xl font-black text-white tracking-[0.25em] mb-2 uppercase"
      >
        {t("playerReview.title")}
      </motion.h2>

      {/* Dönen Durum Mesajı */}
      <div className="h-8 flex items-center justify-center overflow-hidden mb-6">
        <AnimatePresence mode="wait">
          {submitStatus === "success" ? (
            <motion.div
              key="sent"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/30"
            >
              <span className="w-2 h-2 bg-emerald-400 rounded-full" />
              <span className="text-emerald-300 text-xs tabular-nums font-bold tracking-[0.2em] uppercase">
                {t("playerReview.answersSent")}
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="waiting"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <p className="text-white/50 text-xs tabular-nums tracking-[0.2em] uppercase">
                {t("playerReview.reviewing")}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Ek Bilgi Rozeti */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="px-6 py-3 rounded-2xl bg-white/[0.04] border border-white/10 text-white/70 tabular-nums text-xs tracking-[0.2em] flex items-center gap-3 relative"
      >
        <span className="text-alaz-orange">👀</span>
        <span>{t("playerReview.watchMainScreen")}</span>
      </motion.div>
    </motion.div>
  );
}
