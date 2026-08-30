import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IntelligenceWidget } from "../../../components/IntelligenceWidget";
import { useLocale } from "../../../hooks/useLocale";
import { SoundManager, sounds } from "../../../lib/audio";

interface HostPlayingProps {
  currentLetter: string;
  timeLeft: number;
  categories: string[];
  submittedPlayerIds: string[];
  playersCount: number;
  currentRound?: number;
}

export function HostPlaying({
  currentLetter,
  timeLeft,
  categories,
  submittedPlayerIds,
  playersCount,
  currentRound = 1,
}: HostPlayingProps) {
  const { t } = useLocale();

  // Play urgent ticks in the last 5 seconds to build party excitement
  useEffect(() => {
    if (timeLeft <= 5 && timeLeft > 0) {
      SoundManager.getInstance().playSFX(sounds.TICK_URGENT, 0.4);
    }
  }, [timeLeft]);

  return (
    <motion.div
      key="playing"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className={`w-full h-full flex flex-col items-center justify-between py-12 relative transition-colors duration-500 ${
        timeLeft <= 10 && timeLeft > 0 ? "str1-bg bg-red-950/20" : ""
      }`}
      data-tension={timeLeft <= 10 && timeLeft > 0 ? "high" : undefined}
    >
      {timeLeft <= 10 && timeLeft > 0 && (
        <div className="danger-overlay absolute inset-0 pointer-events-none z-30" />
      )}
      {timeLeft <= 5 && timeLeft > 0 && (
        <div className="absolute inset-0 border-[4px] border-red-500/50 animate-pulse pointer-events-none z-30" />
      )}
      <div className="animate-scanline" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.04)_0%,transparent_70%)] pointer-events-none" />

      <IntelligenceWidget
        currentLetter={currentLetter}
        categories={categories}
        playerCount={playersCount}
        timeLeft={timeLeft}
        currentRound={currentRound}
      />

      {/* Main Core Display */}
      <div className="flex-1 flex flex-col items-center justify-center w-full relative z-10 my-8">
        <div className="flex items-center gap-32 relative">
          {/* Active Letter Core */}
          <motion.div
            initial={{ x: -100, opacity: 0, rotateY: 90 }}
            animate={{ x: 0, opacity: 1, rotateY: 0 }}
            transition={{ type: "spring", damping: 25, delay: 0.2 }}
            className="relative"
          >
            {/* Ambient Glow */}
            <div className="absolute inset-0 bg-white/5 blur-[120px] rounded-full" />

            {/* Glowing Spin Ring (Like Timer) */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute inset-[-15px] rounded-[2.5rem] border-[1px] border-white/30 shadow-[0_0_20px_rgba(255,255,255,0.05)] border-l-transparent border-r-transparent opacity-50 z-0"
            />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute inset-[-25px] rounded-[3rem] border-[1px] border-white/10 shadow-[0_0_15px_rgba(255,255,255,0.02)] border-t-transparent border-b-transparent opacity-40 z-0"
            />

            <div className="w-72 h-72 rounded-[2rem] border border-white/10 flex items-center justify-center shadow-[0_10px_40px_rgba(0,0,0,0.3),inset_0_0_40px_rgba(255,255,255,0.02)] bg-white/[0.02] backdrop-blur-3xl relative overflow-hidden group z-10">
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.03] to-transparent pointer-events-none" />
              <motion.div
                key={currentLetter}
                initial={{ scale: 0.8, opacity: 0, filter: "blur(10px)" }}
                animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
                transition={{ type: "spring", damping: 25 }}
                className="text-[7rem] md:text-[10rem] lg:text-[14rem] font-light tracking-tight text-white leading-none filter drop-shadow-[0_0_30px_rgba(255,255,255,0.2)]"
              >
                {currentLetter}
              </motion.div>
            </div>
          </motion.div>

          {/* Energy Divider */}
          <div className="h-72 w-[1px] bg-gradient-to-b from-transparent via-white/20 to-transparent relative">
            <motion.div
              animate={{ top: ["0%", "100%", "0%"] }}
              transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
              className="absolute left-1/2 -translate-x-1/2 w-[2px] h-12 bg-white/60 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)]"
            />
          </div>

          {/* Dynamic Timer */}
          <motion.div
            initial={{ x: 100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ type: "spring", damping: 25, delay: 0.3 }}
            className="text-left relative w-[350px]"
          >
            <div className="flex flex-col items-start">
              <span className="text-xl font-light text-white/50 uppercase tracking-[0.4em] mb-[-1.5rem] ml-4 z-10">
                {t("playing.seconds")}
              </span>
              <div className="relative w-[260px] h-[260px] flex items-center justify-center mt-4">
                {/* Spinning Neon Ring */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                  className={`absolute inset-0 rounded-[2rem] border-[1px] ${
                    timeLeft <= 10 
                      ? "border-red-500/50 shadow-[0_0_30px_rgba(255,0,0,0.2)]" 
                      : "border-white/30 shadow-[0_0_20px_rgba(255,255,255,0.05)] border-t-transparent border-b-transparent"
                  }`}
                />
                <AnimatePresence mode="popLayout">
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <motion.span
                      key={timeLeft}
                      initial={{
                        y: 40,
                        opacity: 0,
                        filter: "blur(10px)",
                        scale: 0.8,
                      }}
                      animate={{
                        y: 0,
                        opacity: 1,
                        filter: "blur(0px)",
                        scale: 1,
                      }}
                      exit={{
                        y: -40,
                        opacity: 0,
                        filter: "blur(10px)",
                        scale: 0.8,
                        position: "absolute",
                      }}
                      transition={{ duration: 0.4, type: "spring", bounce: 0.4 }}
                      className={`text-[8rem] md:text-[12rem] lg:text-[15rem] font-light leading-none tracking-tight tabular-nums ${
                        timeLeft <= 10
                          ? "text-red-400 drop-shadow-[0_0_20px_rgba(255,0,0,0.3)]"
                          : "text-white/90 drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                      } ${timeLeft <= 5 && timeLeft > 0 ? "animate-shake text-glow-premium-alaz" : ""}`}
                    >
                      {timeLeft.toString().padStart(2, "0")}
                    </motion.span>
                  </div>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="w-full max-w-[100rem] px-16 flex flex-col items-center gap-12">
        <div className={`grid gap-8 w-full ${categories.length <= 3 ? 'grid-cols-3' : categories.length <= 5 ? 'grid-cols-5' : 'grid-cols-4'}`}>
          {categories.map((cat, idx) => (
            <motion.div
              key={cat}
              initial={{ y: 60, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              transition={{
                delay: 0.4 + idx * 0.1,
                type: "spring",
                stiffness: 150,
                damping: 20,
              }}
              className="relative p-[1px] rounded-2xl overflow-hidden group hover:scale-[1.02] transition-transform duration-500 shadow-[0_4px_20px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_rgba(255,255,255,0.05)]"
            >
              {/* Conic Gradient Animated Borders */}
              <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0_180deg,rgba(255,255,255,0.2)_360deg)] animate-[spin_6s_linear_infinite]" />
              
              <div className="relative h-full w-full bg-white/[0.02] backdrop-blur-3xl p-6 text-center rounded-[15px] z-10 flex flex-col items-center justify-center border border-white/5 group-hover:bg-white/[0.04] transition-colors">
                <span className="text-[10px] text-white/40 uppercase tracking-[0.2em] mb-3 flex items-center justify-center gap-3">
                  <span className="w-3 h-[1px] bg-white/20" />
                  {String(idx + 1).padStart(2, "0")}
                  <span className="w-3 h-[1px] bg-white/20" />
                </span>
                <p className="text-xl lg:text-2xl font-light text-white/80 group-hover:text-white transition-colors">
                  {cat}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Cinematic Live Submission Status */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="flex flex-col items-center gap-6 w-full max-w-4xl"
        >
          <div className="flex items-end justify-between w-full px-4 border-b border-white/5 pb-4">
            <span className="text-white/40 font-medium uppercase tracking-[0.2em] text-sm flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-white/70 animate-pulse" />
              Live Link Status
            </span>
            <div className="flex items-baseline gap-3">
              <span className="text-white/90 font-light text-5xl leading-none">
                {submittedPlayerIds.length}
              </span>
              <span className="text-white/30 font-medium uppercase tracking-[0.2em] text-lg">
                / {playersCount} {t("playing.answered")}
              </span>
            </div>
          </div>

          <div className="flex justify-center gap-4 w-full">
            {Array.from({ length: playersCount }).map((_, i) => {
              const isSubmitted = i < submittedPlayerIds.length;
              return (
                <motion.div
                  key={i}
                  initial={false}
                  animate={{
                    scale: isSubmitted ? [1, 1.2, 1] : 1,
                    opacity: isSubmitted ? 1 : 0.2,
                  }}
                  transition={{ duration: 0.5 }}
                  className={`relative h-2 flex-1 rounded-full overflow-hidden ${isSubmitted ? "bg-white/[0.05]" : "bg-white/[0.02]"}`}
                >
                  <motion.div
                    initial={false}
                    animate={{ x: isSubmitted ? "0%" : "-100%" }}
                    transition={{ type: "spring", damping: 25 }}
                    className="absolute inset-0 bg-white/60 shadow-[0_0_15px_rgba(255,255,255,0.3)]"
                  />
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* TIME UP SPLASH */}
      <AnimatePresence>
        {timeLeft === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.5, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.5, filter: "blur(20px)" }}
            transition={{ type: "spring", bounce: 0.6 }}
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm pointer-events-none"
          >
            <div className="relative flex items-center justify-center">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 10, opacity: 0 }}
                transition={{ duration: 1.5 }}
                className="absolute w-20 h-20 bg-red-600 rounded-full"
              />
              <h1 
                className="text-[150px] font-black text-red-500 uppercase tracking-tighter drop-shadow-[0_0_50px_rgba(255,0,0,1)] animate-shake"
                style={{ textShadow: "4px 4px 0px rgba(0,243,255,0.5), -4px -4px 0px rgba(255,0,255,0.5)" }}
              >
                {t("playing.timeUp")}
              </h1>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
