import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from "react";
import { useLocale } from "../../../hooks/useLocale";

import type { Room, Player } from "../../../types/database";
import { db } from "../../../lib/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useToast } from "../../../contexts/ToastContextCore";

interface Props {
  room: Room;
  player: Player;
}

export function PlayerPulseController({ room, player }: Props) {
  const [hasClicked, setHasClicked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const { showToast } = useToast();
  const { t } = useLocale();
  

  // Reset local state
  useEffect(() => {
    if (room.status === "pulse_intro" || room.status === "pulse_active") {
      const myClick = room.pulse_clicks?.[player.id];
      setHasClicked(!!myClick);
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  }, [room.status, room.pulse_clicks, player.id]);

  const handlePulse = async () => {
    if (hasClicked || isSubmittingRef.current || room.status !== "pulse_active") return;
    isSubmittingRef.current = true;
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
      showToast(t("pulse.connectionError", "Bağlantı hatası!"), "error");
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  if (room.status === "pulse_reveal") {
    const myClickTime = room.pulse_clicks?.[player.id];
    const targetTime = room.pulse_target_time;
    
    let resultNode = null;
    if (myClickTime && targetTime) {
      const diff = myClickTime - targetTime;
      const absDiff = Math.abs(diff);
      
      let message = "MÜKEMMEL!";
      let colorClass = "text-neon-blue";
      
      if (absDiff > 1500) {
        message = diff < 0 ? "ÇOK ERKEN!" : "ÇOK GEÇ!";
        colorClass = "text-[#ff003c]";
      } else if (absDiff > 500) {
        message = diff < 0 ? "ERKEN!" : "GEÇ!";
        colorClass = "text-yellow-400";
      }

      resultNode = (
        <div className="mt-8">
          <h3 className={`text-4xl font-black uppercase tracking-widest ${colorClass}`}>
            {message}
          </h3>
          <p className="text-white/70 mt-2 font-mono text-xl">
            {diff > 0 ? "+" : ""}{diff}ms
          </p>
        </div>
      );
    } else {
      resultNode = (
        <div className="mt-8">
          <h3 className="text-4xl font-black uppercase tracking-widest text-[#ff003c]">
            BASMADIN!
          </h3>
        </div>
      );
    }

    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center relative z-10">
        <h2 className="text-xl font-bold text-white/50 mb-4 uppercase tracking-[0.3em]">
          BİREYSEL SONUÇ
        </h2>
        {resultNode}
      </div>
    );
  }

  if (room.status === "pulse_intro") {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center relative z-10">
        <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-widest animate-pulse">
          HAZIR OL
        </h2>
        <p className="text-gray-400 uppercase tracking-widest font-bold">
          Ana Ekranı Takip Et
        </p>
      </div>
    );
  }

  if (room.status === "pulse_active") {
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
            {hasClicked ? t("pulse.waiting", "BEKLENİYOR") : 'PULSE'}
          </span>
        </motion.button>
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
