import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Room, Player } from "../../../types/database";
import { db } from "../../../lib/firebase";
import { doc, updateDoc, increment } from "firebase/firestore";
import { useLocale } from "../../../hooks/useLocale";

interface Props {
  room: Room;
  player: Player;
}

export function PlayerSpectrumController({ room, player }: Props) {
  const team = room.spectrum_teams?.[player.id] || "red"; // Fallback to red
  const isRed = team === "red";
  
  // We use local batching to avoid spamming Firestore with too many rapid clicks
  const [clickCount, setClickCount] = useState(0);
  const isFlushingRef = useRef(false);
  const { t } = useLocale();

  const flushClicks = useCallback(async () => {
    if (clickCount === 0 || room.status !== "spectrum_active" || isFlushingRef.current) return;
    
    isFlushingRef.current = true;
    const countToFlush = clickCount;
    setClickCount(0); // Reset early for responsiveness

    try {
      // KRİTİK DÜZELTME: Tüm oyuncuların aynı "rooms/id" dokümanına yazması
      // "Contention" kilitlenmesine neden oluyordu.
      // Artık her oyuncu kendi dokümanına yazıyor.
      const playerRef = doc(db, "players", player.id);
      await updateDoc(playerRef, {
        spectrum_clicks: increment(countToFlush)
      });
    } catch (err) {
      console.error("Failed to flush spectrum clicks", err);
      // Put them back if failed (simplified, might lose some if they kept clicking but okay for this game)
      setClickCount(prev => prev + countToFlush);
    } finally {
      isFlushingRef.current = false;
    }
  }, [clickCount, player.id, room.status]);

  // Flush clicks every 500ms
  useEffect(() => {
    const interval = setInterval(() => {
      flushClicks();
    }, 1000);
    return () => {
      clearInterval(interval);
      flushClicks(); // Flush on unmount
    };
  }, [flushClicks]);

  const handleTap = () => {
    if (room.status !== "spectrum_active") return;
    setClickCount(prev => prev + 1);
    
    // Haptic feedback for each tap
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
  };

  if (room.status === "spectrum_intro") {
    return (
      <div className={`flex-1 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden
        ${isRed ? "bg-[#990024]" : "bg-[#005580]"}
      `}>
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay" />
        <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-widest z-10 drop-shadow-lg">
          TAKIMIN BELLİ OLDU
        </h2>
        <div className={`w-32 h-32 rounded-full flex items-center justify-center z-10 border-4 shadow-2xl mb-6
          ${isRed ? "border-[#ff003c] bg-[#ff003c]/30 shadow-[#ff003c]/50" : "border-neon-blue bg-neon-blue/30 shadow-neon-blue/50"}
        `}>
          <span className="text-6xl">{isRed ? "🔥" : "⚡"}</span>
        </div>
        <h1 className={`text-4xl font-black uppercase tracking-widest z-10
          ${isRed ? "text-[#ff003c]" : "text-neon-blue"}
        `}>
          {isRed ? "KIRMIZI TAKIM" : "MAVİ TAKIM"}
        </h1>
        <p className="mt-8 text-white/50 uppercase tracking-widest font-bold z-10 animate-pulse">
          TV Ekranını Bekle
        </p>
      </div>
    );
  }

  if (room.status === "spectrum_reveal") {
    const scores = room.spectrum_scores || { red: 50, blue: 50 };
    const weWon = (isRed && scores.red > scores.blue) || (!isRed && scores.blue > scores.red);
    const isTie = scores.red === scores.blue;

    return (
      <div className={`flex-1 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden transition-colors duration-1000
        ${weWon && !isTie ? (isRed ? "bg-[#ff003c]" : "bg-neon-blue") : "bg-black"}
      `}>
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay" />
        
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="z-10"
        >
          {isTie ? (
            <h1 className="text-4xl font-black text-white uppercase tracking-widest drop-shadow-lg">
              BERABERE!
            </h1>
          ) : weWon ? (
            <>
              <h1 className="text-6xl font-black text-white uppercase tracking-widest drop-shadow-2xl mb-4">
                KAZANDINIZ!
              </h1>
              <span className="text-6xl">🏆</span>
            </>
          ) : (
            <h1 className="text-4xl font-black text-white/30 uppercase tracking-widest">
              KAYBETTİNİZ
            </h1>
          )}
        </motion.div>
      </div>
    );
  }

  if (room.status === "spectrum_active") {
    // Active state
    return (
      <div className={`flex-1 flex flex-col relative overflow-hidden
        ${isRed ? "bg-[#33000c]" : "bg-[#001a26]"}
      `}>
        <div className="absolute inset-0 bg-[url('/noise.png')] opacity-10 mix-blend-overlay pointer-events-none" />
        
        {/* Huge tap target */}
        <button 
          onClick={handleTap}
          className="absolute inset-0 w-full h-full flex flex-col items-center justify-center z-10 touch-manipulation active:bg-white/10 transition-colors"
        >
          <AnimatePresence>
            {/* Ripple effect per tap - optimization: maybe skip real ripple elements for performance if tapping 10 times a sec, just scaling the text is better */}
          </AnimatePresence>
          <motion.div
            animate={{ scale: clickCount > 0 ? 1.1 : 1 }}
            transition={{ type: "spring", bounce: 0.5 }}
            className={`w-48 h-48 rounded-full border-4 flex items-center justify-center shadow-[0_0_50px_rgba(255,255,255,0.2)]
              ${isRed ? "border-[#ff003c] bg-[#ff003c]/20" : "border-neon-blue bg-neon-blue/20"}
            `}
          >
            <span className="text-4xl font-black text-white uppercase tracking-widest">
              BAS!
            </span>
          </motion.div>
          
          <p className="mt-12 text-white/30 font-mono text-xl tracking-widest">
            +{clickCount} güç
          </p>
        </button>
      </div>
    );
  }

  // Fallback for transitional states (e.g., lobby)
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-black p-6 text-center">
      <div className="w-12 h-12 rounded-full border-4 border-white/20 border-t-white animate-spin mx-auto mb-4" />
      <p className="text-white/50 font-bold uppercase tracking-widest">{t("common.loading", "Yükleniyor...")}</p>
    </div>
  );
}
