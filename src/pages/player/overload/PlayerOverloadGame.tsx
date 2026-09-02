import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Room, Player } from "../../../types/database";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { haptics } from "../../../lib/haptics";
import { SoundManager, sounds } from "../../../lib/audio";

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
    haptics.impact();
    SoundManager.getInstance().playSFX(sounds.SUCCESS);

    try {
      const roomRef = doc(db, "rooms", room.id);
      await updateDoc(roomRef, {
        overload_target_id: "passing",
        overload_last_target_id: player.id
      });
      
      if (navigator.vibrate) {
        navigator.vibrate([150, 50, 150]);
      }
    } catch (err) {
      console.error("Deflect failed:", err);
    } finally {
      setTimeout(() => {
        setIsDeflecting(false);
      }, 300);
    }
  }, [isTarget, isEliminated, isDeflecting, room.id, player.id]);

  if (room.status === "lobby") {
    return (
      <div className="w-full h-[100dvh] flex flex-col items-center justify-center bg-[#05000a] text-white p-6 text-center font-sans">
        <div className="text-7xl mb-4 animate-bounce">⚡</div>
        <h2 className="text-2xl font-black text-cyan-400 mb-2 uppercase tracking-[0.3em]">
          AŞIRI YÜKLEME (OVERLOAD)
        </h2>
        <p className="text-gray-400 font-mono text-xs uppercase tracking-widest">Ana ekranı takip edin</p>
      </div>
    );
  }

  if (room.status === "finished") {
    const isWinner = !isEliminated;
    return (
      <div className={`w-full h-[100dvh] flex flex-col items-center justify-center font-sans text-center px-6 transition-colors duration-500 ${isWinner ? 'bg-emerald-950' : 'bg-red-950'} text-white`}>
        <span className="text-8xl mb-4">{isWinner ? "👑" : "💀"}</span>
        <h2 className={`text-4xl font-black mb-3 uppercase tracking-wider ${isWinner ? 'text-emerald-400' : 'text-red-400'}`}>
          {isWinner ? "ŞAMPİYON!" : "OYUN BİTTİ"}
        </h2>
        <p className="text-gray-300 font-mono text-xs uppercase tracking-widest">
          Sonuçlar ekranda!
        </p>
      </div>
    );
  }

  if (isEliminated) {
    return (
      <div className="w-full h-[100dvh] bg-[#1a0005] flex flex-col items-center justify-center font-sans text-white p-6 text-center">
        <span className="text-7xl mb-4 grayscale">💀</span>
        <h1 className="text-3xl font-black text-red-500 uppercase tracking-widest mb-2">
          AŞIRI YÜKLENDİN!
        </h1>
        <p className="text-gray-400 font-mono text-xs uppercase tracking-widest">Hayatta kalanları izle</p>
      </div>
    );
  }

  return (
    <div className={`w-full h-[100dvh] flex flex-col items-center justify-center font-sans overflow-hidden transition-colors duration-300 ${
      isTarget ? 'bg-[#30000a]' : 'bg-[#05000a]'
    } text-white p-6`}>
      
      <AnimatePresence mode="wait">
        {room.status === "playing" ? (
          isTarget ? (
            <motion.div
              key="target"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.85, opacity: 0 }}
              className="flex flex-col items-center justify-center w-full max-w-sm"
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-3xl animate-bounce">⚡</span>
                <h2 className="text-3xl font-black text-red-400 tracking-wider uppercase animate-pulse">
                  VOLTAJ SENDE!
                </h2>
              </div>

              {/* Deflect Button */}
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={handleDeflect}
                disabled={isDeflecting}
                className="w-64 h-64 rounded-full bg-gradient-to-b from-red-500 to-amber-600 border-4 border-white text-white font-black text-3xl uppercase tracking-wider shadow-[0_0_80px_rgba(239,68,68,0.9)] active:brightness-125 transition-all flex flex-col items-center justify-center"
              >
                <span className="text-5xl mb-2">⚡</span>
                <span>SAVUŞTUR!</span>
              </motion.button>
              
              <p className="mt-8 text-red-200 font-mono text-xs font-bold uppercase tracking-widest animate-pulse">
                DOKUN VE HEMEN PASLA!
              </p>
            </motion.div>
          ) : (
            <motion.div
              key="safe"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center w-full text-center"
            >
              <div className="w-32 h-32 rounded-full border-4 border-cyan-400/40 bg-cyan-950/20 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(0,255,255,0.2)]">
                <span className="text-5xl">🛡️</span>
              </div>
              
              <h2 className="text-cyan-300 font-black text-2xl tracking-widest mb-2 uppercase">
                GÜVENDESİN
              </h2>
              <p className="text-gray-400 font-mono text-xs uppercase tracking-widest">
                Sıradaki kurbana odaklan
              </p>
            </motion.div>
          )
        ) : (
          <div className="flex flex-col items-center justify-center">
            <div className="w-12 h-12 rounded-full border-4 border-cyan-400 border-t-transparent animate-spin mb-4" />
            <p className="text-cyan-400 font-mono text-xs uppercase tracking-widest">YÜKLENİYOR...</p>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
