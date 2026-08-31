import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Room, Player } from "../../../types/database";
import { db } from "../../../lib/firebase";
import { doc, increment, updateDoc } from "firebase/firestore";
import { haptics } from "../../../lib/haptics";
import { useLocale } from "../../../hooks/useLocale";

interface Props {
  room: Room;
  player: Player;
}

export function PlayerColorsController({ room, player }: Props) {
  const [localClicks, setLocalClicks] = useState(0);
  const pendingClicksRef = useRef(0);
  const isFlushingRef = useRef(false);
  const { t } = useLocale();
  
  // Eğer oyuncu oyun başladıktan sonra girmişse, fallback olarak ID'sinin son harfine göre takım ata
  const fallbackTeam = player.id.charCodeAt(player.id.length - 1) % 2 === 0 ? "red" : "blue";
  const team = room.colors_team_assignments?.[player.id] || fallbackTeam;

  const handleClick = () => {
    if (room.status !== "colors_active" || !team) return;
    
    // Vibrate on every tap for tactile feedback
    haptics.tap();
    
    setLocalClicks(prev => prev + 1);
    pendingClicksRef.current += 1;
  };

  // Batch updates to Firestore every 500ms to avoid rate limits
  useEffect(() => {
    if (room.status !== "colors_active" || !team) return;

    const interval = setInterval(() => {
      const clicksToFlush = pendingClicksRef.current;
      if (clicksToFlush > 0 && !isFlushingRef.current) {
        isFlushingRef.current = true;
        pendingClicksRef.current = 0; // Reset immediately
        
        // KRİTİK DÜZELTME: Tüm oyuncuların aynı "rooms/id" dokümanına yazması
        // "Contention" kilitlenmesine neden oluyordu.
        // Artık her oyuncu kendi dokümanına yazıyor.
        const playerRef = doc(db, "players", player.id);
        
        updateDoc(playerRef, {
          colors_clicks: increment(clicksToFlush)
        }).catch(err => {
          console.error("Failed to flush clicks to Firestore:", err);
          // If it fails, add them back so we don't lose them
          pendingClicksRef.current += clicksToFlush;
        }).finally(() => {
          isFlushingRef.current = false;
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [room.status, player.id, team]);

  const bgClass = team === "red" ? "bg-red-600" : (team === "blue" ? "bg-blue-600" : "bg-black");

  return (
    <div className={`w-full h-[100dvh] flex flex-col font-sans overflow-hidden transition-colors duration-500 ${bgClass}`}>
      <AnimatePresence mode="wait">
        {room.status === "colors_intro" && (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-6 text-center"
          >
            <h2 className="text-white font-black text-3xl mb-8 tracking-[0.2em] animate-pulse">
              TAKIMIN BELİRLENİYOR...
            </h2>
            {team ? (
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", bounce: 0.5 }}
              >
                <div className={`text-6xl font-black uppercase tracking-widest text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]`}>
                  {team === "red" ? "KIRMIZI" : "MAVİ"}
                </div>
                <p className="mt-4 text-white/80 font-bold uppercase tracking-widest">
                  Parmağını Isıt!
                </p>
              </motion.div>
            ) : (
              <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto" />
            )}
          </motion.div>
        )}

        {room.status === "colors_active" && (
          <motion.div
            key="active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 w-full h-full"
          >
            {/* The giant spam button */}
            <button
              onClick={handleClick}
              className="w-full h-full flex flex-col items-center justify-center active:bg-white/20 transition-colors"
              style={{ touchAction: "manipulation" }} // Prevents double-tap to zoom on mobile
            >
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 pointer-events-none" />
              
              <h1 className="text-white font-black text-7xl uppercase tracking-tighter mix-blend-overlay z-10 select-none">
                BAS!
              </h1>
              <p className="text-white/50 text-2xl font-bold mt-4 z-10 select-none">
                {localClicks}
              </p>
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
            <h2 className="text-4xl font-black text-white uppercase tracking-[0.2em] mb-4">
              SAVAŞ BİTTİ
            </h2>
            <p className="text-white/80 font-bold uppercase tracking-widest text-xl">
              Sonuçlar Ekranda!
            </p>
            <div className="mt-12 text-6xl font-black text-white/30">
              {localClicks} TIK
            </div>
          </motion.div>
        )}

        {!["colors_intro", "colors_active", "colors_reveal"].includes(room.status) && (
          <motion.div
            key="fallback"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-black"
          >
            <div className="w-12 h-12 rounded-full border-4 border-white border-t-transparent animate-spin mb-4 mx-auto" />
            <p className="text-white/50 uppercase tracking-widest">{t("common.loading", "YÜKLENİYOR...")}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
