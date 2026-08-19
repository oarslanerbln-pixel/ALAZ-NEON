import { useEffect, useState, useRef } from "react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import type { Room, Player } from "../../../types/database";
import { SoundManager, sounds } from "../../../lib/audio";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";

interface Props {
  room: Room;
  players: Player[];
  onExplode: (playerId: string) => void;
}

export function HostBombActive({ room, players, onExplode }: Props) {
  const targetPlayer = players.find((p) => p.id === room.bomb_target_player);
  const [timeLeft, setTimeLeft] = useState(15);
  const onExplodeRef = useRef(onExplode);
  const bombControls = useAnimation();
  const containerControls = useAnimation();
  
  useEffect(() => {
    onExplodeRef.current = onExplode;
  }, [onExplode]);

  useEffect(() => {
    // Sound loop for ticking
    const ticker = setInterval(() => {
      SoundManager.getInstance().playSFX(sounds.VOTE_TICK);
    }, 1000); // gets faster in a real advanced implementation, but simple tick for now
    return () => clearInterval(ticker);
  }, []);

  // Bomba el değiştirdiğinde (targetPlayer değişince) Firestore'daki
  // round_end_time bir an için ESKİ oyuncuya ait kalıyor — asıl güncelleme
  // aşağıdaki "bomb passing" effect'inden ayrı bir ağ isteğiyle geliyor.
  // O kısa pencerede bu effect yeniden başlıyor ama hâlâ eski (süresi
  // dolmuş) round_end_time'ı görüyor; korumasız bırakılırsa bombayı yeni
  // devralan oyuncuda anında patlatıyordu. targetJustHandedOff bayrağı bu
  // ilk (bayat) tick'i görmezden gelip taze round_end_time'ı bekliyor.
  const lastAppliedTargetIdRef = useRef<string | undefined>(targetPlayer?.id);

  useEffect(() => {
    if (!room.round_end_time || !targetPlayer) return;

    let targetJustHandedOff = lastAppliedTargetIdRef.current !== targetPlayer.id;
    lastAppliedTargetIdRef.current = targetPlayer.id;

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((room.round_end_time! - now) / 1000));
      setTimeLeft(remaining);

      // Intensity based on time left
      if (remaining <= 5 && remaining > 0) {
        bombControls.start({
          scale: [1, 1.1, 1],
          transition: { duration: 0.3, repeat: Infinity }
        });
        containerControls.start({
          x: [0, -10, 10, -10, 10, 0],
          y: [0, 10, -10, 10, -10, 0],
          transition: { duration: 0.2, repeat: Infinity }
        });
      } else if (remaining === 0) {
        if (targetJustHandedOff) {
          // Give the fresh round_end_time write one more tick to land instead
          // of exploding the player who just received the bomb.
          targetJustHandedOff = false;
          return;
        }
        clearInterval(interval);
        onExplodeRef.current(targetPlayer.id);
      }
    }, 100); // 100ms for smooth updates

    return () => clearInterval(interval);
  }, [room.round_end_time, targetPlayer, bombControls, containerControls]);

  // Handle bomb passing animation (when bomb_target_player changes)
  const prevTargetPlayer = useRef(room.bomb_target_player);
  useEffect(() => {
    if (prevTargetPlayer.current !== room.bomb_target_player) {
      SoundManager.getInstance().playSFX(sounds.SUCCESS);
      bombControls.start({
        x: [0, 500, -500, 0], // Swoosh effect
        opacity: [1, 0, 0, 1],
        transition: { duration: 0.4 }
      });
      prevTargetPlayer.current = room.bomb_target_player;

      // Update timer and multiplier on the HOST side (Single Source of Truth)
      const speedMultiplier = Math.max(0.3, (room.bomb_speed_multiplier || 1.0) * 0.95);
      const newTime = 15000 * speedMultiplier;
      updateDoc(doc(db, "rooms", room.id), {
        bomb_speed_multiplier: speedMultiplier,
        round_end_time: Date.now() + newTime
      }).catch(console.error);
    }
  }, [room.bomb_target_player, bombControls, room.id, room.bomb_speed_multiplier]);

  // Handle Reject Action
  const handleReject = async () => {
    if (!room.previous_bomb_target_player) return;
    
    // Penalize the player who wrote the nonsense word by sending the bomb back with just 3 seconds!
    SoundManager.getInstance().playSFX(sounds.FAILURE); // Play buzzer
    try {
      await updateDoc(doc(db, "rooms", room.id), {
        bomb_target_player: room.previous_bomb_target_player,
        round_end_time: Date.now() + 3000, // 3 seconds penalty fuse!
        previous_bomb_target_player: null // Prevent spamming reject
      });
    } catch (err) {
      console.error("Failed to reject word:", err);
    }
  };


  if (!targetPlayer) return null;

  const currentLives = targetPlayer.lives !== undefined ? targetPlayer.lives : 3;

  return (
    <motion.div 
      animate={containerControls}
      className={`flex-1 flex flex-col items-center justify-center min-h-screen relative overflow-hidden transition-colors duration-300 ${timeLeft <= 3 ? 'bg-[#1a0005]' : 'bg-[#030000]'}`}
    >
      {/* Dynamic Background Pulse */}
      <motion.div 
        animate={{ 
          scale: timeLeft <= 5 ? [1, 1.2, 1] : [1, 1.05, 1],
          opacity: timeLeft <= 5 ? [0.4, 0.8, 0.4] : [0.2, 0.4, 0.2]
        }}
        transition={{ duration: Math.max(0.2, timeLeft / 10), repeat: Infinity }}
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,0,60,0.15),transparent_70%)] pointer-events-none mix-blend-screen" 
      />
      
      {/* Scanlines */}
      <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.2)_50%)] bg-[length:100%_4px] pointer-events-none opacity-50" />
      
      {/* Top Header */}
      <div className="absolute top-10 w-full flex flex-col items-center justify-center z-20">
        <h2 className="text-2xl font-bold text-gray-500 uppercase tracking-[0.5em] mb-2">KATEGORİ</h2>
        <h1 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]">
          {room.active_letter}
        </h1>
      </div>

      {/* Main Bomb Area */}
      <div className="flex flex-col items-center justify-center z-10 w-full max-w-4xl px-4 mt-8">
        <motion.div
          animate={bombControls}
          className="relative flex items-center justify-center"
        >
          {/* Bomb SVG */}
          <div className="relative">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: Math.max(0.5, timeLeft / 2), repeat: Infinity, ease: "linear" }}
              className="absolute inset-0 rounded-full border-4 border-dashed border-[#ff003c]/30"
            />
            <svg 
              width="350" 
              height="350" 
              viewBox="0 0 24 24" 
              fill={timeLeft <= 3 ? "rgba(255,0,60,0.2)" : "none"} 
              stroke={timeLeft <= 5 ? "#ff003c" : "#ff4d00"} 
              strokeWidth="1" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              style={{ filter: `drop-shadow(0px 0px ${timeLeft <= 5 ? '40px' : '20px'} rgba(255,0,60,0.8))` }}
              className="transition-all duration-300"
            >
              <circle cx="11.5" cy="11.5" r="9"/>
              <path d="m19.5 4.5 1.5 1.5"/>
              <path d="m21.5 1.5-1.5 1.5"/>
              <path d="M19.5 1.5c-1 1-2 2-3 2s-3-2-5-2-4 2-5 2"/>
              <path d="M19 8h2"/>
            </svg>

            {/* Timer Display inside the Bomb */}
            <div className="absolute inset-0 flex items-center justify-center pt-2">
              <motion.span 
                key={timeLeft}
                initial={{ scale: 1.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={`text-8xl md:text-9xl font-black tabular-nums tracking-tighter ${timeLeft <= 3 ? 'text-white' : 'text-transparent bg-clip-text bg-gradient-to-b from-[#ff4d00] to-[#ff003c]'}`}
                style={timeLeft <= 3 ? { textShadow: "0 0 40px rgba(255,0,60,1)" } : {}}
              >
                {timeLeft}
              </motion.span>
            </div>
          </div>
        </motion.div>

        {/* Target Player Display */}
        <div className="mt-12 text-center bg-black/40 p-8 rounded-3xl backdrop-blur-md border border-[#ff003c]/20 shadow-[0_0_50px_rgba(255,0,60,0.1)] relative w-full max-w-lg">
          {/* Corner borders */}
          <div className="absolute -top-2 -left-2 w-4 h-4 border-t-2 border-l-2 border-[#ff003c]" />
          <div className="absolute -top-2 -right-2 w-4 h-4 border-t-2 border-r-2 border-[#ff003c]" />
          <div className="absolute -bottom-2 -left-2 w-4 h-4 border-b-2 border-l-2 border-[#ff003c]" />
          <div className="absolute -bottom-2 -right-2 w-4 h-4 border-b-2 border-r-2 border-[#ff003c]" />

          <p className="text-sm font-bold text-[#ff4d00] uppercase tracking-[0.4em] mb-4">Sıra Kimde?</p>
          <motion.h2 
            key={targetPlayer.id}
            initial={{ scale: 0.5, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: "spring", bounce: 0.6 }}
            className="text-5xl md:text-6xl font-black text-white uppercase tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]"
          >
            {targetPlayer.nickname}
          </motion.h2>
          
          <div className="flex gap-2 justify-center mt-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <svg 
                key={i}
                xmlns="http://www.w3.org/2000/svg" 
                width="32" 
                height="32" 
                viewBox="0 0 24 24" 
                fill={i < currentLives ? "#ff003c" : "transparent"} 
                stroke={i < currentLives ? "#ff003c" : "#333"} 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className={i < currentLives ? "drop-shadow-[0_0_10px_rgba(255,0,60,0.8)]" : ""}
              >
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
              </svg>
            ))}
          </div>
        </div>
      </div>

      {/* Host Reject Button (Anti-Spam / Verification) */}
      <AnimatePresence>
        {room.previous_bomb_target_player && (
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="absolute bottom-8 z-30"
          >
            <button
              onClick={handleReject}
              className="group relative px-8 py-4 bg-red-950/80 hover:bg-red-900 border border-red-500 rounded-full backdrop-blur-md flex items-center gap-3 overflow-hidden transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 via-red-500/20 to-red-500/0 opacity-0 group-hover:opacity-100 group-hover:animate-shine" />
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ff003c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              <span className="text-red-500 font-black tracking-widest">KELİMEYİ REDDET & CEZALANDIR</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
