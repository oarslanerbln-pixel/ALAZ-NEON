import { motion, AnimatePresence } from "framer-motion";
import { IntelligenceWidget } from "../../../components/IntelligenceWidget";
import { useLocale } from "../../../hooks/useLocale";

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
  return (
    <motion.div
      key="playing"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.05 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="w-full h-full flex flex-col items-center justify-between py-12 relative"
    >
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,255,65,0.05)_0%,transparent_70%)] pointer-events-none animate-scanline" />

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
            <div className="absolute inset-0 bg-hacker-green/30 blur-[150px] rounded-full" />

            {/* Glowing Spin Ring (Like Timer) */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              className="absolute inset-[-15px] rounded-[2.5rem] border-[4px] border-hacker-green shadow-[0_0_30px_rgba(0,255,65,0.8)] border-l-transparent border-r-transparent opacity-90 z-0"
            />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute inset-[-25px] rounded-[3rem] border-[2px] border-teal-500 shadow-[0_0_20px_rgba(20,184,166,0.6)] border-t-transparent border-b-transparent opacity-60 z-0"
            />

            <div className="w-72 h-72 rounded-[2rem] cyber-panel border-2 border-hacker-green flex items-center justify-center shadow-[inset_0_0_80px_rgba(0,255,65,0.2)] bg-black/90 backdrop-blur-2xl relative overflow-hidden group z-10">
              <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.03)_50%,transparent_75%)] bg-[length:250%_250%] animate-shine pointer-events-none" />
              <motion.div
                key={currentLetter}
                initial={{ scale: 0.5, opacity: 0, filter: "blur(20px)" }}
                animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
                transition={{ type: "spring", damping: 20 }}
                className="text-[7rem] md:text-[10rem] lg:text-[14rem] font-black font-mono text-transparent bg-clip-text bg-gradient-to-br from-white via-hacker-green to-teal-500 leading-none filter drop-shadow-[0_0_40px_rgba(0,255,65,0.8)] animate-pulse"
              >
                {currentLetter}
              </motion.div>
            </div>
          </motion.div>

          {/* Energy Divider */}
          <div className="h-72 w-[2px] bg-gradient-to-b from-transparent via-hacker-green/40 to-transparent relative">
            <motion.div
              animate={{ top: ["0%", "100%", "0%"] }}
              transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
              className="absolute left-1/2 -translate-x-1/2 w-[4px] h-16 bg-white rounded-full shadow-[0_0_20px_#fff]"
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
              <span className="text-2xl font-black font-mono text-cyber-yellow/80 uppercase tracking-[0.4em] mb-[-1.5rem] ml-4 z-10">
                {t("playing.seconds")}
              </span>
              <div className="relative w-[260px] h-[260px] flex items-center justify-center mt-4">
                {/* Spinning Neon Ring */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  className={`absolute inset-0 rounded-[2rem] border-[6px] ${
                    timeLeft <= 10 
                      ? "border-red-500 shadow-[0_0_40px_rgba(255,0,0,0.8)] border-dashed animate-glitch" 
                      : "border-cyber-yellow shadow-[0_0_20px_rgba(252,238,10,0.8)] border-t-transparent border-b-transparent"
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
                      className={`text-[8rem] md:text-[12rem] lg:text-[18rem] font-black font-mono leading-none tracking-tighter tabular-nums ${
                        timeLeft <= 10
                          ? "text-red-500 animate-pulse drop-shadow-[0_0_50px_rgba(255,0,0,0.8)]"
                          : "text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.5)]"
                      }`}
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
        <div className="grid grid-cols-5 gap-8 w-full">
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
              className="relative p-[3px] rounded-xl overflow-hidden group hover:scale-[1.05] transition-transform duration-500 shadow-[0_0_20px_rgba(0,255,65,0.1)] hover:shadow-[0_0_40px_rgba(0,255,65,0.4)]"
            >
              {/* Conic Gradient Animated Borders */}
              <div className="absolute inset-0 bg-[conic-gradient(from_0deg,transparent_0_180deg,rgba(0,255,65,1)_360deg)] animate-[spin_4s_linear_infinite]" />
              <div className="absolute inset-0 bg-[conic-gradient(from_180deg,transparent_0_180deg,rgba(252,238,10,0.8)_360deg)] animate-[spin_4s_linear_infinite]" />
              
              <div className="relative h-full w-full bg-black/90 backdrop-blur-2xl p-6 text-center rounded-[10px] z-10 flex flex-col items-center justify-center border border-hacker-green/30 group-hover:bg-black/70 transition-colors">
                <div className="absolute inset-0 bg-gradient-to-b from-hacker-green/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <span className="text-[12px] text-hacker-green/80 font-mono uppercase tracking-[0.25em] mb-3 flex items-center justify-center gap-3">
                  <span className="w-3 h-[1px] bg-hacker-green/60" />
                  {String(idx + 1).padStart(2, "0")} // {t("playing.category")}
                  <span className="w-3 h-[1px] bg-hacker-green/60" />
                </span>
                <p className="text-2xl lg:text-3xl font-black font-mono text-white/90 group-hover:text-cyber-yellow transition-colors drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]">
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
          <div className="flex items-end justify-between w-full px-4 border-b border-white/10 pb-4">
            <span className="text-gray-400 font-bold uppercase tracking-[0.2em] text-sm flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-alaz-orange animate-pulse" />
              Live Link Status
            </span>
            <div className="flex items-baseline gap-3">
              <span className="text-alaz-orange font-black text-5xl leading-none">
                {submittedPlayerIds.length}
              </span>
              <span className="text-gray-500 font-bold uppercase tracking-[0.2em] text-lg">
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
                  className={`relative h-3 flex-1 rounded-full overflow-hidden ${isSubmitted ? "bg-hacker-green/20" : "bg-white/10"}`}
                >
                  <motion.div
                    initial={false}
                    animate={{ x: isSubmitted ? "0%" : "-100%" }}
                    transition={{ type: "spring", damping: 20 }}
                    className="absolute inset-0 bg-gradient-to-r from-hacker-green to-teal-500 shadow-[0_0_20px_rgba(0,255,65,0.8)]"
                  />
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
