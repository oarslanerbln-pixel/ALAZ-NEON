import { useState, useEffect, useRef } from "react";
import { motion, useAnimation } from "framer-motion";
import { doc, updateDoc, increment } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { SoundManager, sounds } from "../../../lib/audio";
import { useLocale } from "../../../hooks/useLocale";
import type { Room, Player } from "../../../types/database";
import { NeonIcon } from "../../../components/NeonIcon";

interface Props {
  room: Room;
  player: Player;
}

export function PlayerUnityController({ room }: Props) {
  const { t } = useLocale();
  const [localClicks, setLocalClicks] = useState(0);
  const clickBuffer = useRef(0);
  const controls = useAnimation();

  // Batch flush clicks every 1 second
  useEffect(() => {
    if (room.status !== "unity_active") return;

    const interval = setInterval(() => {
      if (clickBuffer.current > 0) {
        const clicksToFlush = clickBuffer.current;
        clickBuffer.current = 0; // Reset immediately

        const roomRef = doc(db, "rooms", room.id);
        updateDoc(roomRef, { unity_current: increment(clicksToFlush) }).catch(err => {
          console.error("Failed to flush unity clicks:", err);
          // If it failed, we could theoretically put them back, but for a party game it's okay to drop
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [room.id, room.status]);

  const handleTap = () => {
    if (room.status !== "unity_active") return;
    
    // Haptic feedback if supported
    if (typeof window !== "undefined" && window.navigator.vibrate) {
      try { window.navigator.vibrate(20); } catch { /* ignore */ }
    }

    SoundManager.getInstance().playSFX(sounds.CLICK);
    
    setLocalClicks(prev => prev + 1);
    clickBuffer.current += 1;

    controls.start({
      scale: [1, 0.9, 1],
      transition: { duration: 0.1 }
    });
  };

  const isFinished = room.status === "unity_reveal";
  const target = room.unity_target || 1;
  const current = room.unity_current || 0;
  const isWin = current >= target;

  return (
    <div className="flex flex-col h-full bg-black touch-none">
      <div className="p-4 text-center border-b border-white/10 shrink-0">
        <h2 className="text-xl font-black text-amber-400 tracking-widest uppercase">
          {t("player.unityTitle", "NEON BİRLİK")}
        </h2>
      </div>

      <div className="flex-1 p-6 flex flex-col items-center justify-center relative overflow-hidden">
        {isFinished ? (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center z-10"
          >
            {isWin ? (
              <>
                <NeonIcon type="flame" color="orange" className="w-32 h-32 mx-auto mb-6" />
                <h1 className="text-5xl font-black text-amber-400 uppercase tracking-widest mb-2">BAŞARILI!</h1>
                <p className="text-white">Enerji patlaması gerçekleşti.</p>
              </>
            ) : (
              <>
                <h1 className="text-5xl font-black text-red-500 uppercase tracking-widest mb-2">BAŞARISIZ</h1>
                <p className="text-white/50">Yeterli enerji toplanamadı.</p>
              </>
            )}
          </motion.div>
        ) : (
          <>
            <div className="absolute inset-0 pointer-events-none opacity-20 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.5)_0%,transparent_70%)]" />
            
            <motion.button
              animate={controls}
              onPointerDown={handleTap}
              className="w-full max-w-[300px] aspect-square rounded-full bg-gradient-to-b from-amber-400 to-orange-600 shadow-[0_0_50px_rgba(245,158,11,0.5)] flex flex-col items-center justify-center border-8 border-white/20 active:border-white/50 active:shadow-[0_0_100px_rgba(245,158,11,0.8)] relative z-10"
            >
              <span className="text-5xl font-black text-white mix-blend-overlay uppercase tracking-widest">
                BAS!
              </span>
              <span className="text-white/80 font-bold mt-2">
                Senin Katkın: {localClicks}
              </span>
            </motion.button>
            
            <p className="mt-12 text-center text-amber-400/50 font-bold tracking-widest uppercase animate-pulse">
              TV Ekranına Bakarak Süreyi Takip Et
            </p>
          </>
        )}
      </div>
    </div>
  );
}
