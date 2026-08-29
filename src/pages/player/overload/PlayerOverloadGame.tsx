import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Room, Player } from "../../../types/database";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "../../../lib/firebase";

interface PlayerOverloadGameProps {
  room: Room;
  player: Player;
}

export function PlayerOverloadGame({ room, player }: PlayerOverloadGameProps) {
  const [isDeflecting, setIsDeflecting] = useState(false);

  const isTarget = room.overload_target_id === player.id;
  const isEliminated = (room.overload_eliminated_ids || []).includes(player.id);

  const handleDeflect = useCallback(async () => {
    if (!isTarget || isEliminated || isDeflecting) return;
    setIsDeflecting(true);

    try {
      // Decrement the timer allowance by 1 (minimum 1 second)
      const currentAllowed = room.overload_time_allowed || 10;
      const newAllowed = Math.max(1, currentAllowed - 1);

      // Trigger the host to pick a new target by setting target to null
      const roomRef = doc(db, "rooms", room.id);
      await updateDoc(roomRef, {
        overload_target_id: null,
        overload_time_allowed: newAllowed
      });
      
      // Vibrate if supported
      if (navigator.vibrate) {
        navigator.vibrate(100);
      }
    } catch (err) {
      console.error("Deflect failed:", err);
    } finally {
      setIsDeflecting(false);
    }
  }, [isTarget, isEliminated, isDeflecting, room.id, room.overload_time_allowed]);


  if (room.status === "lobby") {
    return (
      <div className="w-full h-[100dvh] flex flex-col items-center justify-center bg-[#050505] text-white p-6 text-center font-sans">
        <div className="w-16 h-16 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin mb-8" />
        <h2 className="text-2xl font-black text-cyan-400 mb-2 uppercase tracking-[0.3em]">
          NEON OVERLOAD
        </h2>
        <p className="text-cyan-400/50 font-medium tracking-widest text-sm uppercase">Ana ekranı takip edin</p>
      </div>
    );
  }

  if (room.status === "finished") {
    const isWinner = !isEliminated;
    return (
      <div className={`w-full h-[100dvh] flex flex-col items-center justify-center font-sans text-center px-6 transition-colors duration-500 ${isWinner ? 'bg-green-900' : 'bg-red-900'}`}>
        <h2 className={`text-5xl font-black mb-4 uppercase tracking-[0.3em] ${isWinner ? 'text-green-400 drop-shadow-[0_0_20px_rgba(74,222,128,0.8)]' : 'text-red-400 drop-shadow-[0_0_20px_rgba(248,113,113,0.8)]'}`}>
          {isWinner ? "ŞAMPİYON!" : "OYUN BİTTİ"}
        </h2>
        <p className="text-white/80 font-bold tracking-widest text-sm uppercase">
          Sonuçlar ekranda!
        </p>
      </div>
    );
  }


  if (isEliminated) {
    return (
      <div className="w-full h-screen bg-red-900 flex flex-col items-center justify-center font-sans">
        <h1 className="text-4xl font-black text-white uppercase tracking-widest drop-shadow-[0_0_20px_rgba(255,255,255,0.8)]">
          ELENDİN
        </h1>
        <p className="mt-4 text-red-300 font-bold tracking-widest text-sm uppercase">İzlemeye devam et</p>
      </div>
    );
  }

  return (
    <div className={`w-full h-screen flex flex-col items-center justify-center font-sans overflow-hidden transition-colors duration-300 ${isTarget ? 'bg-red-600' : 'bg-[#050505]'}`}>
      
      {/* Background Effect */}
      <div className={`absolute inset-0 pointer-events-none opacity-30 bg-[size:20px_20px] transition-all duration-300 ${
        isTarget 
          ? 'bg-[linear-gradient(rgba(255,255,255,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.2)_1px,transparent_1px)] bg-[size:40px_40px] animate-pulse'
          : 'bg-[linear-gradient(rgba(0,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.1)_1px,transparent_1px)]'
      }`} />

      <AnimatePresence mode="wait">
        {isTarget ? (
          <motion.div
            key="target"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative z-10 flex flex-col items-center justify-center w-full h-full px-6"
          >
            <h2 className="text-white font-black text-4xl mb-8 tracking-[0.5em] animate-pulse text-center">
              SENDE!
            </h2>

            <button
              onClick={handleDeflect}
              disabled={isDeflecting}
              className="w-64 h-64 rounded-full bg-white text-red-600 font-black text-3xl uppercase tracking-widest shadow-[0_0_50px_rgba(255,255,255,0.8)] active:scale-95 transition-transform flex items-center justify-center disabled:opacity-50"
            >
              SAVUŞTUR
            </button>
            
            <p className="mt-12 text-white/80 font-medium text-xs tracking-[0.2em] uppercase">
              Hızlıca butona bas!
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="safe"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="relative z-10 flex flex-col items-center justify-center w-full h-full"
          >
            <div className="w-32 h-32 rounded-full border-4 border-cyan-400/30 flex items-center justify-center mb-8">
              <div className="w-24 h-24 rounded-full bg-cyan-400/10 animate-pulse" />
            </div>
            
            <h2 className="text-cyan-400 font-bold text-2xl tracking-[0.3em] mb-2 uppercase">
              GÜVENDESİN
            </h2>
            <p className="text-cyan-400/50 text-xs font-medium tracking-[0.2em] uppercase">
              Beklemede kal
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
