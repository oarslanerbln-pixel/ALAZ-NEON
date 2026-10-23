import { useEffect } from "react";
import { motion } from "framer-motion";
import { useLocale } from "../../../hooks/useLocale";
import type { SensorImage } from "../../../data/sensorImages";
import { ConfettiCanvas } from "../../../components/ConfettiCanvas";
import { SoundManager, sounds } from "../../../lib/audio";

interface Props {
  currentImage: SensorImage;
  buzzerPlayerName: string | null;
  onNextRound: () => void;
}

export function HostSensorReveal({ currentImage, buzzerPlayerName, onNextRound }: Props) {
  const { t } = useLocale();

  useEffect(() => {
    SoundManager.getInstance().playSFX(sounds.SUCCESS);
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 relative overflow-hidden bg-black w-full h-full">
      {/* Confetti Celebration Cannon */}
      <ConfettiCanvas trigger={true} />

      {/* Volumetric Studio Cones - Emerald Victory Beams */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute -top-32 left-[12%] w-[500px] h-[850px] opacity-35 blur-3xl"
          style={{
            background: "conic-gradient(from 180deg at 50% 0%, rgba(16,185,129,0.55) 0deg, rgba(5,150,105,0.2) 35deg, transparent 70deg)",
            transform: "rotate(-12deg)",
          }}
        />
        <div
          className="absolute -top-32 right-[12%] w-[500px] h-[850px] opacity-35 blur-3xl"
          style={{
            background: "conic-gradient(from 180deg at 50% 0%, rgba(52,211,153,0.55) 0deg, rgba(16,185,129,0.2) 35deg, transparent 70deg)",
            transform: "rotate(12deg)",
          }}
        />
      </div>

      {/* Ambient Radial Glow & Scanline Texture */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.18)_0%,rgba(0,0,0,0.95)_80%)] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay pointer-events-none z-0" />

      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.7, type: "spring", bounce: 0.4 }}
        className="relative z-10 w-full max-w-4xl flex flex-col items-center"
      >
        {/* Solved Image Telemetry Frame */}
        <div className="w-full aspect-video rounded-3xl overflow-hidden border-2 border-emerald-500/60 shadow-[0_0_100px_rgba(16,185,129,0.35)] mb-6 relative bg-black/60 backdrop-blur-xl">
          <img 
            src={currentImage.url}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

          {/* 4 Corner Precision Brackets */}
          <div className="absolute top-4 left-4 w-7 h-7 border-t-2 border-l-2 border-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.9)] pointer-events-none" />
          <div className="absolute top-4 right-4 w-7 h-7 border-t-2 border-r-2 border-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.9)] pointer-events-none" />
          <div className="absolute bottom-4 left-4 w-7 h-7 border-b-2 border-l-2 border-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.9)] pointer-events-none" />
          <div className="absolute bottom-4 right-4 w-7 h-7 border-b-2 border-r-2 border-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.9)] pointer-events-none" />

          {/* Top Decrypted Telemetry Badge */}
          <div className="absolute top-5 left-5 bg-black/85 px-4 py-1.5 text-emerald-400 font-mono font-bold tracking-[0.2em] text-xs rounded-xl border border-emerald-500/50 shadow-lg backdrop-blur-md flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>{t("sensor.solved")}</span>
          </div>
        </div>
        
        {/* Answer Typography */}
        <motion.h2 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, type: "spring" }}
          className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-white/95 to-emerald-200 mb-4 uppercase tracking-widest drop-shadow-[0_0_35px_rgba(16,185,129,0.5)] text-center"
        >
          {currentImage.answer}
        </motion.h2>
        
        {/* Winner Points Award Pill */}
        <div className="bg-emerald-950/60 border border-emerald-400/40 px-8 py-3.5 rounded-full mb-8 backdrop-blur-xl shadow-[0_0_30px_rgba(16,185,129,0.25)] flex items-center gap-3">
          <span className="text-2xl">👑</span>
          <p className="text-xl md:text-2xl text-emerald-300 font-black tracking-widest uppercase font-mono">
            {t("sensor.wonPoints", buzzerPlayerName || "")}
          </p>
        </div>

        {/* Next Round Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onNextRound}
          className="relative group overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-500 text-black px-14 py-5 transition-all shadow-[0_0_40px_rgba(16,185,129,0.45)] border border-emerald-200"
        >
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.5)_50%,transparent_75%)] bg-[length:250%_250%,100%_100%] bg-[position:-100%_0,0_0] bg-no-repeat group-hover:animate-shine" />
          <span className="relative text-2xl font-black uppercase tracking-widest flex items-center gap-2">
            <span>{t("sensor.nextRound")}</span>
            <span>⏩</span>
          </span>
        </motion.button>
      </motion.div>
    </div>
  );
}
