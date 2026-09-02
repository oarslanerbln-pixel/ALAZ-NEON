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
      {/* Animated check box */}
      <div className="relative mb-8">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ ...SPRING.snappy, delay: 0.1 }}
          className="w-20 h-20 bg-zinc-900 border border-zinc-700 flex items-center justify-center relative"
        >
          <div className="absolute top-0 left-0 w-1.5 h-1.5 bg-white" />
          <div className="absolute bottom-0 right-0 w-1.5 h-1.5 bg-white" />

          <AnimatePresence mode="wait">
            {submitStatus === "success" ? (
              <motion.div
                key="check"
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={SPRING.bouncy}
                className="text-3xl"
              >
                ✓
              </motion.div>
            ) : (
              <motion.div
                key="loader"
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="w-8 h-8 border-2 border-zinc-700 border-t-white"
              />
            )}
          </AnimatePresence>
        </motion.div>

        {/* Outer pulse ring */}
        {submitStatus !== "success" && (
          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute inset-0 border border-white/20 pointer-events-none"
          />
        )}
      </div>

      <motion.h2
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...TWEEN.enter, delay: 0.2 }}
        className="text-xl font-light text-white tracking-[0.3em] mb-3 uppercase"
      >
        {t("playerReview.title")}
      </motion.h2>

      {/* Rotating review messages */}
      <div className="h-8 flex items-center justify-center overflow-hidden mb-6">
        <AnimatePresence mode="wait">
          {submitStatus === "success" ? (
            <motion.div
              key="sent"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2"
            >
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-green-400 text-xs font-mono tracking-[0.3em] uppercase">
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
              <motion.p
                animate={{ opacity: [0.4, 0.9, 0.4] }}
                transition={{ duration: 2.5, repeat: Infinity }}
                className="text-zinc-500 text-xs font-mono tracking-[0.2em] uppercase"
              >
                {t("playerReview.reviewing")}
              </motion.p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Submit status badge */}
      <AnimatePresence>
        {submitStatus === "success" && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={SPRING.snappy}
            className="px-6 py-3 bg-zinc-900 border border-zinc-700 text-white font-mono text-xs tracking-[0.3em] flex items-center gap-3 relative overflow-hidden"
          >
            <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-green-500" />
            <div className="w-1.5 h-1.5 bg-green-500 animate-pulse ml-1" />
            {t("playerReview.dataTransferred")}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-8 text-zinc-700 text-[10px] font-light uppercase tracking-widest"
      >
        {t("playerReview.watchMainScreen")}
      </motion.p>
    </motion.div>
  );
}
