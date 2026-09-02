import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Room, Player } from "../../../types/database";
import { db } from "../../../lib/firebase";
import { doc, increment, updateDoc } from "firebase/firestore";
import { haptics } from "../../../lib/haptics";

interface Props {
  room: Room;
  player: Player;
}

export function PlayerColorsController({ room, player }: Props) {
  const [localClicks, setLocalClicks] = useState(0);
  const pendingClicksRef = useRef(0);
  const isFlushingRef = useRef(false);
  
  const fallbackTeam = player.id.charCodeAt(player.id.length - 1) % 2 === 0 ? "red" : "blue";
  const team = room.colors_team_assignments?.[player.id] || fallbackTeam;

  const handleClick = (e: React.TouchEvent | React.MouseEvent) => {
    if (room.status !== "colors_active" || !team) return;
    
    // Tap haptics
    haptics.tap();
    
    const count = 'touches' in e && e.touches.length > 1 ? e.touches.length : 1;
    setLocalClicks(prev => prev + count);
    pendingClicksRef.current += count;
  };

  // Batch updates to Firestore
  useEffect(() => {
    if (room.status !== "colors_active" || !team) return;

    const interval = setInterval(() => {
      const clicksToFlush = pendingClicksRef.current;
      if (clicksToFlush > 0 && !isFlushingRef.current) {
        isFlushingRef.current = true;
        pendingClicksRef.current = 0;
        
        const playerRef = doc(db, "players", player.id);
        
        updateDoc(playerRef, {
          colors_clicks: increment(clicksToFlush)
        }).catch(err => {
          console.error("Failed to flush clicks to Firestore:", err);
          pendingClicksRef.current += clicksToFlush;
        }).finally(() => {
          isFlushingRef.current = false;
        });
      }
    }, 600);

    return () => clearInterval(interval);
  }, [room.status, player.id, team]);

  const bgClass = team === "red" 
    ? "bg-gradient-to-b from-[#b30027] to-[#ff003c]" 
    : (team === "blue" ? "bg-gradient-to-b from-[#004bb3] to-[#00aaff]" : "bg-black");

  return (
    <div className={`w-full h-[100dvh] flex flex-col font-sans overflow-hidden transition-colors duration-500 ${bgClass} text-white`}>
      <AnimatePresence mode="wait">
        {room.status === "colors_intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-6 text-center"
          >
            <span className="text-7xl mb-4 animate-bounce">{team === "red" ? "🔴" : "🔵"}</span>
            <h2 className="text-white/80 font-mono text-sm uppercase tracking-widest mb-2">
              TAKIMIN BELİRLENDİ
            </h2>
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
            >
              <div className="text-5xl md:text-6xl font-black uppercase tracking-widest text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.9)] mb-4">
                {team === "red" ? "KIRMIZI TAKIM" : "MAVİ TAKIM"}
              </div>
              <p className="text-white/90 font-mono text-xs uppercase tracking-widest bg-black/30 px-6 py-2 rounded-full border border-white/20 inline-block">
                Tüm parmaklarınla olabildiğince hızlı tıkla!
              </p>
            </motion.div>
          </motion.div>
        )}

        {room.status === "colors_active" && (
          <motion.div
            key="active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 w-full h-full relative"
          >
            {/* Turbo Click Pad */}
            <button
              onClick={handleClick}
              onTouchStart={handleClick}
              className="w-full h-full flex flex-col items-center justify-center active:brightness-125 transition-all select-none p-6"
              style={{ touchAction: "manipulation" }}
            >
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px] opacity-25 pointer-events-none" />
              
              <span className="text-8xl mb-2 animate-pulse pointer-events-none">⚡</span>
              
              <h1 className="text-white font-black text-6xl md:text-7xl uppercase tracking-wider drop-shadow-[0_0_30px_rgba(0,0,0,0.8)] pointer-events-none">
                HIZLA BAS!
              </h1>
              
              <div className="mt-6 bg-black/40 border border-white/20 px-8 py-3 rounded-3xl backdrop-blur-md pointer-events-none">
                <span className="text-xs font-mono text-white/70 uppercase tracking-widest block text-center">
                  SENİN TIK SAYIN
                </span>
                <span className="text-4xl font-black text-white block text-center mt-1">
                  {localClicks}
                </span>
              </div>
            </button>
          </motion.div>
        )}

        {room.status === "colors_reveal" && (
          <motion.div
            key="reveal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-6 text-center"
          >
            <span className="text-8xl mb-4">🏁</span>
            <h2 className="text-4xl font-black text-white uppercase tracking-wider mb-2">
              SAVAŞ TAMAMLANDI!
            </h2>
            <p className="text-white/80 font-mono text-sm uppercase tracking-widest mb-8">
              Sonuçlar TV Ekranında!
            </p>
            <div className="bg-black/40 border border-white/20 p-6 rounded-2xl backdrop-blur-md">
              <span className="text-xs font-mono text-gray-300 uppercase block mb-1">TOPLAM KATKIN:</span>
              <span className="text-5xl font-black text-white">{localClicks} TIK</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
