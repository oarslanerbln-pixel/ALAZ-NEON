import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from "react";

import type { Room, Player } from "../../../types/database";
import { db } from "../../../lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useToast } from "../../../contexts/ToastContextCore";
import { useLocale } from "../../../hooks/useLocale";

interface Props {
  room: Room;
  player: Player;
}

export function PlayerPulseController({ room, player }: Props) {
  const [hasClicked, setHasClicked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { showToast } = useToast();
  

  // Reset local state
  useEffect(() => {
    if (room.status === "pulse_intro" || room.status === "pulse_active") {
      const myClick = room.pulse_clicks?.[player.id];
      setHasClicked(!!myClick);
    }
  }, [room.status, room.pulse_clicks, player.id]);

  const handlePulse = async () => {
    if (hasClicked || isSubmitting || room.status !== "pulse_active") return;
    setIsSubmitting(true);
    
    const clickTime = Date.now();

    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]); // Heartbeat vibration
    }

    try {
      const roomRef = doc(db, "rooms", room.id);
      await updateDoc(roomRef, {
        [`pulse_clicks.${player.id}`]: clickTime
      });
      setHasClicked(true);
    } catch (err) {
      console.error(err);
      showToast("Bağlantı hatası!", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (room.status === "pulse_reveal") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center relative z-10">
        <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-[0.3em]">
          Sonuçlar Ekranda
        </h2>
        <p className="text-neon-blue font-bold uppercase tracking-widest">
          Ne Kadar Senkronizesiniz?
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 relative z-10 min-h-[70vh]">
      <div className="text-center mb-12">
        <h3 className="text-sm text-neon-blue uppercase tracking-[0.4em] font-bold mb-2">
          Gözünü Ekrana Dik
        </h3>
        <p className="text-white/50 text-xs uppercase tracking-widest font-mono">
          Tam Patlama Anında Dokun!
        </p>
      </div>

      <motion.button
        onClick={handlePulse}
        disabled={hasClicked || isSubmitting || room.status !== "pulse_active"}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileTap={{ scale: 0.9 }}
        className={`w-64 h-64 rounded-full border-4 flex items-center justify-center relative overflow-hidden transition-all duration-500
          ${hasClicked 
            ? 'border-white/10 bg-white/5' 
            : 'border-neon-blue bg-neon-blue/10 shadow-[0_0_50px_rgba(0,243,255,0.3)]'
          }
        `}
      >
        {/* Pulsing rings if active */}
        {!hasClicked && room.status === "pulse_active" && (
          <>
            <motion.div
              animate={{ scale: [1, 1.5], opacity: [0.5, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="absolute inset-0 rounded-full border-2 border-neon-blue"
            />
            <motion.div
              animate={{ scale: [1, 1.3], opacity: [0.3, 0] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
              className="absolute inset-0 rounded-full border-2 border-neon-blue"
            />
          </>
        )}

        <span className={`text-2xl font-black uppercase tracking-widest z-10
          ${hasClicked ? 'text-white/30' : 'text-white'}
        `}>
          {hasClicked ? 'BEKLENİYOR' : 'PULSE'}
        </span>
      </motion.button>
    </div>
  );
}
