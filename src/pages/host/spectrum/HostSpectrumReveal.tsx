import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from "react";

import type { Room } from "../../../types/database";
import { KineticSpark } from "../../../components/KineticSpark";

interface Props {
  room: Room;
  onFinish: () => void;
}

export function HostSpectrumReveal({ room, onFinish }: Props) {
  const [showWinner, setShowWinner] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWinner(true);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  const scores = room.spectrum_scores || { red: 50, blue: 50 };
  
  let winner = "TIE";
  let winnerColor = "white";
  let winnerName = "BERABERE";

  if (scores.red > scores.blue) {
    winner = "red";
    winnerColor = "#ff003c";
    winnerName = "KIRMIZI TAKIM";
  } else if (scores.blue > scores.red) {
    winner = "blue";
    winnerColor = "#00f3ff";
    winnerName = "MAVİ TAKIM";
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center relative overflow-hidden bg-black min-h-screen">
      {/* Dynamic Background based on winner */}
      <div 
        className="absolute inset-0 transition-colors duration-1000"
        style={{ 
          background: showWinner 
            ? `radial-gradient(circle at center, ${winnerColor}40 0%, black 80%)` 
            : 'black' 
        }}
      />
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />

      {!showWinner ? (
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 0.8, repeat: Infinity }}
          className="text-white/50 text-3xl font-black uppercase tracking-[1em] z-10"
        >
          Sonuçlar...
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", bounce: 0.5, duration: 1.5 }}
          className="relative z-10 flex flex-col items-center"
        >
          <span className="text-white/50 uppercase tracking-[0.5em] text-2xl font-bold mb-4">
            KAZANAN
          </span>
          <h1 
            className="text-7xl md:text-9xl font-black uppercase tracking-widest mb-12 drop-shadow-2xl"
            style={{ 
              color: 'transparent', 
              WebkitTextStroke: `2px ${winnerColor}`,
              textShadow: `0 0 50px ${winnerColor}`
            }}
          >
            {winnerName}
          </h1>
          
          <div className="flex gap-16 bg-white/[0.03] border border-white/10 p-8 rounded-3xl backdrop-blur-md">
            <div className="text-center">
              <p className="text-[#ff003c] text-sm uppercase tracking-widest mb-2 font-bold">KIRMIZI</p>
              <p className="text-4xl font-black text-white">{scores.red}</p>
            </div>
            <div className="text-center border-l border-white/10 pl-16">
              <p className="text-neon-blue text-sm uppercase tracking-widest mb-2 font-bold">MAVİ</p>
              <p className="text-4xl font-black text-white">{scores.blue}</p>
            </div>
          </div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3 }}
            onClick={onFinish}
            className="mt-16 px-12 py-4 bg-white/5 border border-white/20 text-white/70 rounded-full uppercase tracking-[0.3em] font-bold hover:bg-white/10 hover:text-white transition-all"
          >
            Lobiye Dön
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
