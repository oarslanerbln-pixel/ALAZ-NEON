import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { NeonIcon } from "../../../components/NeonIcon";
import { SoundManager, sounds } from "../../../lib/audio";
import { useVenue } from "../../../contexts/VenueContextCore";
import { DEFAULT_VENUE_CONFIG, type Room, type Player } from "../../../types/database";

interface Props {
  room: Room;
  player: Player;
}

export function PlayerWheelController({ room, player }: Props) {
  const { venue } = useVenue();
  const slices = venue.wheel_slices?.length ? venue.wheel_slices : DEFAULT_VENUE_CONFIG.wheel_slices!;
  const [isSpinning, setIsSpinning] = useState(false);

  const isMyTurn = room.wheel_spinner_id === player.id;
  const showSpinButton = room.status === "wheel_active" && isMyTurn && room.wheel_result_index === null;

  const handleSpinClick = async () => {
    if (isSpinning) return;
    setIsSpinning(true);
    SoundManager.getInstance().playSFX(sounds.START);

    // Calculate a random slice index
    // Note: If you want weighted slices in the future, do it here.
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
      setIsSpinning(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-black text-white flex flex-col p-6 items-center justify-center relative overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-cyber-yellow/10 to-alaz-orange/10 pointer-events-none" />
      </div>

      <div className="relative z-10 w-full max-w-sm flex flex-col items-center gap-8">
        <NeonIcon type="flame" color="gold" className="w-20 h-20 mb-4" />

        <AnimatePresence mode="wait">
          {(room.status === "lobby" || room.status === "night_lobby") && (
            <motion.div
              key="lobby"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <h2 className="text-2xl font-black uppercase tracking-widest text-white mb-2">ÇARKIFELEK</h2>
              <p className="text-gray-400">Oyunun başlamasını bekliyoruz. Ana ekranı takip edin.</p>
            </motion.div>
          )}

          {room.status === "finished" && (
            <motion.div
              key="finished"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <h2 className="text-2xl font-black uppercase tracking-widest text-cyber-yellow mb-2">OYUN BİTTİ</h2>
              <p className="text-gray-400">Sonuçlar ana ekranda!</p>
            </motion.div>
          )}

          {room.status === "wheel_active" && !room.wheel_spinner_id && (
            <motion.div
              key="waiting-host"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <h2 className="text-2xl font-black uppercase tracking-widest text-white mb-2">ÇARKIFELEK</h2>
              <p className="text-gray-400">Ana ekranı takip edin. Şanslı müşteri birazdan seçilecek...</p>
            </motion.div>
          )}

          {room.status === "wheel_active" && room.wheel_spinner_id && !isMyTurn && (
            <motion.div
              key="waiting-other"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center"
            >
              <h2 className="text-2xl font-black uppercase tracking-widest text-white mb-2">SIRA BAŞKASINDA</h2>
              <p className="text-gray-400">Şanslı müşteri seçildi. Ekrana bakın!</p>
            </motion.div>
          )}

          {showSpinButton && (
            <motion.div
              key="your-turn"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              className="w-full flex flex-col items-center text-center gap-8"
            >
              <div>
                <h2 className="text-3xl font-black text-cyber-yellow uppercase tracking-widest mb-2 animate-pulse">SIRA SİZDE!</h2>
                <p className="text-white/80">Kaderini belirlemek için butona bas.</p>
              </div>

              <button
                onClick={handleSpinClick}
                disabled={isSpinning}
                className="w-48 h-48 rounded-full bg-gradient-to-tr from-cyber-yellow to-alaz-orange flex items-center justify-center border-[6px] border-white/20 shadow-[0_0_50px_rgba(255,215,0,0.6)] active:scale-95 transition-transform"
              >
                <span className="text-black font-black text-4xl uppercase tracking-tighter drop-shadow-md">
                  ÇEVİR
                </span>
              </button>
            </motion.div>
          )}

          {room.status === "wheel_spinning" && (
            <motion.div
              key="spinning"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <div className="w-16 h-16 border-4 border-cyber-yellow/30 border-t-cyber-yellow rounded-full animate-spin mx-auto mb-6" />
              <h2 className="text-xl font-black uppercase tracking-widest text-cyber-yellow animate-pulse">ÇARK DÖNÜYOR...</h2>
              <p className="text-gray-400 mt-2">Ana ekrana bakın!</p>
            </motion.div>
          )}

          {room.status === "wheel_result" && (
            <motion.div
              key="result"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full flex flex-col items-center text-center gap-6"
            >
              <h2 className="text-2xl font-black uppercase tracking-widest text-white mb-2">SONUÇ!</h2>
              {isMyTurn ? (
                <div className="bg-cyber-yellow/20 border border-cyber-yellow p-6 rounded-2xl">
                  <div className="text-sm font-bold text-cyber-yellow uppercase tracking-widest mb-2">KAZANDIĞIN ÖDÜL:</div>
                  <div className="text-3xl font-black text-white">{slices[room.wheel_result_index || 0]?.text}</div>
                </div>
              ) : (
                <div className="bg-white/10 border border-white/20 p-6 rounded-2xl">
                  <p className="text-gray-300">Ana ekrandan kazananı görebilirsiniz.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
