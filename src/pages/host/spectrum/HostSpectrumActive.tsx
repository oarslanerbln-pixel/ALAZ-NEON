import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { Room } from "../../../types/database";

interface Props {
  room: Room;
  onNext: () => void;
}

export function HostSpectrumActive({ room, onNext }: Props) {
  const [timeLeft, setTimeLeft] = useState(30);

  useEffect(() => {
    if (room.spectrum_end_time) {
      const updateTimer = () => {
        const remaining = Math.max(0, Math.floor((room.spectrum_end_time! - Date.now()) / 1000));
        setTimeLeft(remaining);
        if (remaining === 0) {
          onNext();
        }
      };
      updateTimer();
      const interval = setInterval(updateTimer, 500);
      return () => clearInterval(interval);
    }
  }, [room.spectrum_end_time, onNext]);

  const scores = room.spectrum_scores || { red: 50, blue: 50 };
  const total = (scores.red + scores.blue) || 100;
  
  // Calculate percentage of screen for Red (Blue takes the rest)
  const redPercentage = (scores.red / total) * 100;

  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-black relative overflow-hidden min-h-screen">
      {/* Background Split - This is the core visual */}
      <div className="absolute inset-0 flex w-full h-full">
        <motion.div 
          animate={{ width: `${redPercentage}%` }}
          transition={{ type: "spring", bounce: 0.1, duration: 0.5 }}
          className="h-full bg-gradient-to-br from-[#ff003c] to-[#990024] relative shadow-[0_0_100px_rgba(255,0,60,0.8)] z-10" 
        >
          {/* Internal pulsing effect for Red */}
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.05] mix-blend-overlay" />
          <motion.div
            animate={{ opacity: [0, 0.2, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="absolute inset-0 bg-white"
          />
        </motion.div>

        <motion.div 
          animate={{ width: `${100 - redPercentage}%` }}
          transition={{ type: "spring", bounce: 0.1, duration: 0.5 }}
          className="h-full bg-gradient-to-bl from-neon-blue to-[#0088cc] relative shadow-[0_0_100px_rgba(0,243,255,0.8)] z-0" 
        >
          {/* Internal pulsing effect for Blue */}
          <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.05] mix-blend-overlay" />
          <motion.div
            animate={{ opacity: [0, 0.2, 0] }}
            transition={{ duration: 1.2, repeat: Infinity }}
            className="absolute inset-0 bg-white"
          />
        </motion.div>
      </div>

      {/* Timer Overlay */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 z-30">
        <div className="bg-black/50 border border-white/20 px-8 py-4 rounded-full backdrop-blur-xl shadow-2xl">
          <span className="text-white font-mono text-5xl font-black tracking-widest">
            {timeLeft}
          </span>
        </div>
      </div>

      {/* Score Overlay (Optional, but good for feedback) */}
      <div className="absolute bottom-12 left-12 z-30">
        <span className="text-white/80 font-black text-6xl drop-shadow-md">
          {Math.round(redPercentage)}%
        </span>
      </div>
      <div className="absolute bottom-12 right-12 z-30">
        <span className="text-white/80 font-black text-6xl drop-shadow-md">
          {Math.round(100 - redPercentage)}%
        </span>
      </div>
    </div>
  );
}
