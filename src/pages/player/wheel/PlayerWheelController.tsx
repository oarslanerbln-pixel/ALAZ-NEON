import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { SoundManager, sounds } from "../../../lib/audio";
import { useVenue } from "../../../contexts/VenueContextCore";
import { DEFAULT_VENUE_CONFIG, type Room, type Player } from "../../../types/database";
import { haptics } from "../../../lib/haptics";

interface Props {
  room: Room;
  player: Player;
}

export function PlayerWheelController({ room, player }: Props) {
  const { venue } = useVenue();
  const slices = venue.wheel_slices?.length ? venue.wheel_slices : DEFAULT_VENUE_CONFIG.wheel_slices!;
  const [isSpinning, setIsSpinning] = useState(false);
  const isSpinningRef = useRef(false);

  const isMyTurn = room.wheel_spinner_id === player.id;
  const showSpinButton = room.status === "wheel_active" && isMyTurn && room.wheel_result_index === null;
  const winningSlice = room.wheel_result_index !== null && room.wheel_result_index !== undefined
    ? slices[room.wheel_result_index]
    : null;

  const handleSpinClick = async () => {
    if (isSpinningRef.current) return;
    isSpinningRef.current = true;
    setIsSpinning(true);
    haptics.impact();
    SoundManager.getInstance().playSFX(sounds.START);

    const weights = slices.map(s => s.weight || 1);
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let randomVal = Math.random() * totalWeight;
    let selectedIndex = 0;
    for (let i = 0; i < slices.length; i++) {
      randomVal -= weights[i];
      if (randomVal <= 0) {
        selectedIndex = i;
        break;
      }
    }

    try {
      await updateDoc(doc(db, "rooms", room.id), {
        status: "wheel_spinning",
        wheel_result_index: selectedIndex
      });
    } catch (error) {
      console.error("Error spinning wheel:", error);
      isSpinningRef.current = false;
      setIsSpinning(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-[#0a0800] text-white flex flex-col p-6 items-center justify-center relative overflow-hidden select-none font-sans">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.12)_0%,transparent_70%)] pointer-events-none" />

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-6">
        <span className="text-7xl animate-bounce">🎰</span>

        <AnimatePresence mode="wait">
          {(room.status === "lobby" || room.status === "night_lobby") && (
            <motion.div
              key="lobby"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="text-center"
            >
              <h2 className="text-2xl font-black uppercase tracking-widest text-amber-400 mb-2">ÇARKIFELEK</h2>
              <p className="text-gray-400 font-mono text-xs uppercase tracking-widest">
                Oyunun başlamasını bekliyoruz. Ana ekranı takip edin.
              </p>
            </motion.div>
          )}

          {room.status === "wheel_active" && !room.wheel_spinner_id && (
            <motion.div
              key="waiting-host"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="text-center bg-black/50 border border-white/10 p-6 rounded-3xl backdrop-blur-md"
            >
              <h2 className="text-xl font-black uppercase tracking-wider text-amber-400 mb-2">
                ŞANS ÇARKI
              </h2>
              <p className="text-gray-300 font-mono text-xs">
                TV ekranına bak! Şanslı masa birazdan seçilecek...
              </p>
            </motion.div>
          )}

          {room.status === "wheel_active" && room.wheel_spinner_id && !isMyTurn && (
            <motion.div
              key="waiting-other"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="text-center bg-black/50 border border-white/10 p-6 rounded-3xl backdrop-blur-md w-full"
            >
              <span className="text-5xl mb-2 block">👀</span>
              <h2 className="text-xl font-black uppercase tracking-wider text-white mb-2">
                Sıra Başka Masada!
              </h2>
              <p className="text-gray-400 font-mono text-xs">
                Çarkın dönüşünü TV ekranından izle!
              </p>
            </motion.div>
          )}

          {showSpinButton && (
            <motion.div
              key="spin-button"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="w-full flex flex-col items-center"
            >
              <div className="bg-amber-500/20 border-2 border-amber-400 px-6 py-2 rounded-full mb-6">
                <span className="text-amber-300 font-black text-sm uppercase tracking-widest animate-pulse">
                  ⭐ ŞANSLI SEÇİLDİN! ⭐
                </span>
              </div>

              <motion.button
                whileTap={{ scale: 0.92 }}
                onClick={handleSpinClick}
                disabled={isSpinning}
                className="w-64 h-64 rounded-full bg-gradient-to-tr from-amber-600 to-yellow-400 border-4 border-white text-black font-black text-3xl uppercase tracking-wider shadow-[0_0_80px_rgba(255,215,0,0.8)] active:brightness-125 transition-all flex flex-col items-center justify-center"
              >
                <span className="text-5xl mb-2">🎰</span>
                <span>ÇEVİR!</span>
              </motion.button>

              <p className="text-amber-200/80 font-mono text-xs mt-6 text-center">
                Dokun ve çarkı tüm gücünle döndür!
              </p>
            </motion.div>
          )}

          {(room.status === "wheel_spinning") && (
            <motion.div
              key="spinning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <div className="w-16 h-16 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
              <h2 className="text-2xl font-black uppercase tracking-wider text-amber-400 mb-1">
                ÇARK DÖNÜYOR...
              </h2>
              <p className="text-gray-400 font-mono text-xs">Nefesler tutuldu!</p>
            </motion.div>
          )}

          {(room.status === "wheel_result") && winningSlice && (
            <motion.div
              key="result"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="text-center bg-amber-950/60 border-2 border-amber-400 p-8 rounded-3xl backdrop-blur-xl w-full"
            >
              <span className="text-6xl mb-2 block animate-bounce">🎉</span>
              <span className="text-xs font-mono text-amber-300 uppercase tracking-widest block mb-1">
                KAZANILAN ÖDÜL:
              </span>
              <h1 className="text-4xl font-black text-white uppercase tracking-wider drop-shadow-md">
                {winningSlice.text}
              </h1>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
