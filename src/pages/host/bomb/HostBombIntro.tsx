import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import type { Room } from "../../../types/database";
import { useLocale } from "../../../hooks/useLocale";
import { CardSpotlight, KineticText } from "../../../components/fx";

interface Props {
  room: Room;
  onComplete: () => void;
}

export function HostBombIntro({ room, onComplete }: Props) {
  const { t } = useLocale();
  const onCompleteRef = useRef(onComplete);
  
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    // 5 seconds cinematic intro
    const t = setTimeout(() => {
      onCompleteRef.current();
    }, 5000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center h-full bg-[#050002] relative overflow-hidden">
      {/* Glitchy radar/warning background */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.1]" />
      <motion.div 
        animate={{ 
          scale: [1, 1.05, 1],
          opacity: [0.3, 0.6, 0.3] 
        }}
        transition={{ duration: 2, repeat: Infinity }}
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,0,60,0.18),transparent_65%)] pointer-events-none mix-blend-screen" 
      />
      
      {/* Scanline effect */}
      <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.2)_50%)] bg-[length:100%_4px] pointer-events-none" />

      {/* Main Container */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 1.2, type: "spring", bounce: 0.5 }}
        className="z-10 w-full max-w-3xl px-4"
      >
        <CardSpotlight 
          tone="pink" 
          ambient={true} 
          className="text-center p-12 md:p-16 bg-black/70 backdrop-blur-2xl border-2 border-[#ff003c]/40 rounded-[3rem] shadow-[0_0_100px_rgba(255,0,60,0.25)] relative"
        >
          <div className="absolute -top-4 -left-4 w-8 h-8 border-t-4 border-l-4 border-[#ff003c] rounded-tl-xl" />
          <div className="absolute -bottom-4 -right-4 w-8 h-8 border-b-4 border-r-4 border-[#ff003c] rounded-br-xl" />
          <div className="absolute -top-4 -right-4 w-8 h-8 border-t-4 border-r-4 border-[#ff003c] rounded-tr-xl" />
          <div className="absolute -bottom-4 -left-4 w-8 h-8 border-b-4 border-l-4 border-[#ff003c] rounded-bl-xl" />

          <div className="text-xl md:text-2xl font-black text-gray-400 uppercase tracking-[0.4em] mb-6 flex items-center justify-center gap-4">
            <span className="w-12 h-[2px] bg-red-500/40" />
            <KineticText text={t("bomb.category")} by="word" stagger={0.06} />
            <span className="w-12 h-[2px] bg-red-500/40" />
          </div>

          <motion.h1 
            className="text-7xl md:text-9xl font-black text-transparent uppercase tracking-tighter bg-clip-text bg-gradient-to-br from-[#ff003c] via-[#ff4d00] to-[#FFD700]"
            initial={{ scale: 1.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, type: "spring", bounce: 0.6 }}
            style={{ filter: "drop-shadow(0px 10px 30px rgba(255,0,60,0.6))" }}
          >
            {room.active_letter}
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="mt-12 flex flex-col items-center gap-4"
          >
            <div className="w-full max-w-md h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ delay: 1.5, duration: 3.5, ease: "linear" }}
                className="h-full bg-gradient-to-r from-[#ff003c] via-[#ff4d00] to-[#FFD700] rounded-full"
              />
            </div>
            <p className="text-sm text-[#ff003c] font-bold uppercase tracking-[0.3em] animate-pulse">
              {t("bomb.activating")}
            </p>
          </motion.div>
        </CardSpotlight>
      </motion.div>
    </div>
  );
}
