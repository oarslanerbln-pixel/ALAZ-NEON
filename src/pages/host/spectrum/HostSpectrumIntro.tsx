import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from "react";

import type { Room } from "../../../types/database";

interface Props {
  room: Room;
  onNext: () => void;
}

export function HostSpectrumIntro({ room, onNext }: Props) {
  useEffect(() => {
    // Show intro for 8 seconds
    const timer = setTimeout(() => {
      onNext();
    }, 8000);
    return () => clearTimeout(timer);
  }, [onNext]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-black relative overflow-hidden">
      {/* Background Split */}
      <div className="absolute inset-0 flex">
        <motion.div 
          initial={{ opacity: 0, x: -100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          className="w-1/2 h-full bg-gradient-to-r from-[#ff003c]/20 to-transparent" 
        />
        <motion.div 
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1 }}
          className="w-1/2 h-full bg-gradient-to-l from-neon-blue/20 to-transparent" 
        />
      </div>
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />

      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1, type: "spring", delay: 0.5 }}
        className="relative z-10 max-w-5xl"
      >
        <span className="text-white/60 uppercase tracking-[1em] text-sm font-bold mb-6 block">
          NEON WAR
        </span>
        <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 uppercase tracking-widest drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] leading-tight mb-8">
          EKRANI ELE GEÇİR
        </h1>
        
        <div className="flex items-center justify-center gap-12 mt-12">
          <motion.div 
            animate={{ y: [0, -10, 0] }} 
            transition={{ duration: 2, repeat: Infinity }}
            className="flex flex-col items-center"
          >
            <div className="w-24 h-24 rounded-full bg-[#ff003c]/20 border-4 border-[#ff003c] flex items-center justify-center shadow-[0_0_50px_rgba(255,0,60,0.5)] mb-4">
              <span className="text-4xl">🔥</span>
            </div>
            <span className="text-[#ff003c] font-black tracking-widest uppercase">Kırmızı Takım</span>
          </motion.div>

          <span className="text-white/30 text-4xl font-black italic">VS</span>

          <motion.div 
            animate={{ y: [0, 10, 0] }} 
            transition={{ duration: 2, repeat: Infinity, delay: 1 }}
            className="flex flex-col items-center"
          >
            <div className="w-24 h-24 rounded-full bg-neon-blue/20 border-4 border-neon-blue flex items-center justify-center shadow-[0_0_50px_rgba(0,243,255,0.5)] mb-4">
              <span className="text-4xl">⚡</span>
            </div>
            <span className="text-neon-blue font-black tracking-widest uppercase">Mavi Takım</span>
          </motion.div>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3 }}
          className="mt-16 text-white/50 uppercase tracking-[0.5em] text-lg font-medium animate-pulse"
        >
          Telefonuna deli gibi bas!
        </motion.p>
      </motion.div>
    </div>
  );
}
