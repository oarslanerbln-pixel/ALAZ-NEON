import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { useLocale } from "../hooks/useLocale";

const SLIDE_DURATION = 10000; // 10 seconds per slide

export function AttractMode({ onClose }: { onClose: () => void }) {
  const { t } = useLocale();
  const [slide, setSlide] = useState(0);

  // Auto-slide
  useEffect(() => {
    const timer = setInterval(() => {
      setSlide((prev) => (prev === 0 ? 1 : 0));
    }, SLIDE_DURATION);
    return () => clearInterval(timer);
  }, []);

  const topPlayers = [
    { rank: 1, name: "Ateşin_Oğlu", score: 12450, persona: "Sprinter" },
    { rank: 2, name: "Gece_Yarısı", score: 11200, persona: "Innovator" },
    { rank: 3, name: "Mistik_Ruh", score: 10800, persona: "Sniper" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 1 }}
      onClick={onClose}
      className="fixed inset-0 z-[100] bg-black overflow-hidden flex flex-col items-center justify-center cursor-pointer"
    >
      {/* Dynamic Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-alaz-orange/20 blur-[150px] rounded-full animate-pulse" style={{ animationDuration: "5s" }} />
        <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-neon-blue/20 blur-[150px] rounded-full animate-pulse" style={{ animationDuration: "7s" }} />
      </div>

      <AnimatePresence mode="wait">
        {slide === 0 ? (
          // SLIDE 1: CHAMPIONS
          <motion.div
            key="champions"
            initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
            transition={{ duration: 1.2 }}
            className="w-full max-w-5xl flex flex-col items-center"
          >
            <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter text-glow-ultra-alaz mb-12 text-center">
              {t("leaderboard.title")}
            </h1>

            <div className="flex justify-center items-end gap-6 h-[400px]">
              {/* Rank 2 */}
              <motion.div 
                initial={{ y: 200, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.6, type: "spring" }}
                className="flex flex-col items-center"
              >
                <div className="text-2xl font-black text-gray-300 mb-2">{topPlayers[1].name}</div>
                <div className="text-gray-400 font-bold mb-4">{topPlayers[1].score.toLocaleString()}</div>
                <div className="w-32 h-48 bg-white/10 border-t-4 border-gray-300 rounded-t-xl flex items-center justify-center text-4xl font-black text-gray-400">#2</div>
              </motion.div>

              {/* Rank 1 */}
              <motion.div 
                initial={{ y: 200, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.8, type: "spring" }}
                className="flex flex-col items-center z-10"
              >
                <div className="text-4xl font-black text-alaz-orange mb-2 text-glow-alaz">{topPlayers[0].name}</div>
                <div className="text-white font-black text-2xl mb-4">{topPlayers[0].score.toLocaleString()}</div>
                <div className="w-40 h-64 bg-alaz-orange/20 border-t-4 border-alaz-orange rounded-t-xl flex items-center justify-center text-6xl font-black text-alaz-orange shadow-[0_0_50px_rgba(255,77,0,0.3)]">#1</div>
              </motion.div>

              {/* Rank 3 */}
              <motion.div 
                initial={{ y: 200, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
                className="flex flex-col items-center"
              >
                <div className="text-2xl font-black text-orange-700 mb-2">{topPlayers[2].name}</div>
                <div className="text-gray-400 font-bold mb-4">{topPlayers[2].score.toLocaleString()}</div>
                <div className="w-32 h-40 bg-white/5 border-t-4 border-orange-900 rounded-t-xl flex items-center justify-center text-4xl font-black text-orange-900">#3</div>
              </motion.div>
            </div>
          </motion.div>
        ) : (
          // SLIDE 2: HOW TO PLAY
          <motion.div
            key="howToPlay"
            initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
            transition={{ duration: 1.2 }}
            className="w-full max-w-5xl flex flex-col items-center"
          >
            <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter text-white mb-16 text-center shadow-black drop-shadow-2xl">
              {t("attract.howToPlay")}
            </h1>

            <div className="grid grid-cols-3 gap-8 w-full">
              {[
                { step: 1, text: t("attract.step1"), color: "border-blue-500", glow: "shadow-[0_0_30px_rgba(59,130,246,0.3)]" },
                { step: 2, text: t("attract.step2"), color: "border-purple-500", glow: "shadow-[0_0_30px_rgba(168,85,247,0.3)]" },
                { step: 3, text: t("attract.step3"), color: "border-alaz-orange", glow: "shadow-[0_0_50px_rgba(255,77,0,0.5)]" }
              ].map((item, index) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.5 + 0.5 }}
                  className={`bg-black/60 backdrop-blur-xl border-t-4 ${item.color} p-10 rounded-2xl ${item.glow} flex flex-col items-center text-center`}
                >
                  <div className={`text-6xl font-black mb-6 opacity-30 ${item.color.replace('border-', 'text-')}`}>
                    0{item.step}
                  </div>
                  <h3 className="text-2xl font-black text-white tracking-widest uppercase">
                    {item.text}
                  </h3>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FIXED QR CODE OVERLAY */}
      <motion.div 
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-10 right-10 flex flex-col items-center bg-black/80 backdrop-blur-md p-6 rounded-3xl border border-white/10 shadow-2xl"
      >
        <div className="text-white font-black tracking-widest mb-4 animate-pulse uppercase">
          {t("attract.scanToJoin")}
        </div>
        <div className="bg-white p-3 rounded-xl">
          {/* Use window.location.origin to point to the current deployed URL */}
          <QRCodeSVG value={`${typeof window !== 'undefined' ? window.location.origin : 'https://alaz-neon.app'}/join`} size={150} />
        </div>
        <div className="mt-4 text-alaz-orange font-black tracking-widest text-sm">
          {t("attract.joinNow")}
        </div>
      </motion.div>

      {/* Touch to start hint */}
      <div className="absolute bottom-10 left-10 text-white/40 font-bold tracking-widest uppercase text-sm animate-pulse">
        {t("landing.tagline")}
      </div>
    </motion.div>
  );
}
