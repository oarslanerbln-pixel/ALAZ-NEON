import { motion } from 'framer-motion';
import { useEffect } from "react";

import type { Room } from "../../../types/database";

interface Props {
  room: Room;
  onNext: () => void;
}

export function HostEchoIntro({ room, onNext }: Props) {
  

  useEffect(() => {
    // Show intro for 6 seconds then proceed to active voting
    const timer = setTimeout(() => {
      onNext();
    }, 6000);
    return () => clearTimeout(timer);
  }, [onNext]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-black relative overflow-hidden">
      {/* Deep Atmospheric Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,85,0,0.15)_0%,rgba(0,0,0,1)_70%)]" />
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />

      {/* Floating Particles/Echo rings */}
      <motion.div
        animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
        className="absolute w-[60vh] h-[60vh] rounded-full border border-alaz-orange/20"
      />
      <motion.div
        animate={{ scale: [1, 2], opacity: [0.3, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeOut", delay: 0.5 }}
        className="absolute w-[60vh] h-[60vh] rounded-full border border-alaz-orange/10"
      />

      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1, type: "spring" }}
        className="relative z-10 max-w-4xl"
      >
        <span className="text-alaz-orange/60 uppercase tracking-[1em] text-sm font-bold mb-6 block">
          ECHO: Vibe Check
        </span>
        <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/70 uppercase tracking-widest drop-shadow-[0_0_30px_rgba(255,255,255,0.3)] leading-tight">
          {room.echo_question}
        </h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
          className="mt-12 text-white/40 uppercase tracking-[0.5em] text-lg font-medium"
        >
          Telefonlarınızı Hazırlayın
        </motion.p>
      </motion.div>
    </div>
  );
}
