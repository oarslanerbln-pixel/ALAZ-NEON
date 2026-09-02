import { useEffect, useState, useRef } from "react";
import { motion, useAnimation, AnimatePresence } from "framer-motion";
import type { Room, Player } from "../../../types/database";
import { SoundManager, sounds } from "../../../lib/audio";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useLocale } from "../../../hooks/useLocale";

interface Props {
  room: Room;
  players: Player[];
  onExplode: (playerId: string) => void;
}

export function HostBombActive({ room, players, onExplode }: Props) {
  const { t } = useLocale();
  const targetPlayer = players.find((p) => p.id === room.bomb_target_player);
  const [timeLeft, setTimeLeft] = useState(15);
  const onExplodeRef = useRef(onExplode);
  const bombControls = useAnimation();
  const containerControls = useAnimation();

  function remainingInterval(time: number) {
    if (time <= 3) return 400;
    if (time <= 6) return 600;
    return 1000;
  }
  
  useEffect(() => {
    onExplodeRef.current = onExplode;
  }, [onExplode]);

  const lastAppliedTargetIdRef = useRef<string | undefined>(targetPlayer?.id);

  useEffect(() => {
    if (!room.round_end_time || !targetPlayer) return;

    let targetJustHandedOff = lastAppliedTargetIdRef.current !== targetPlayer.id;
    lastAppliedTargetIdRef.current = targetPlayer.id;

    const interval = setInterval(() => {
      const now = Date.now();
      const remaining = Math.max(0, Math.ceil((room.round_end_time! - now) / 1000));
      setTimeLeft(remaining);

      // Sound and intensity based on time left
      if (remaining <= 5 && remaining > 0) {
        SoundManager.getInstance().playSFX(sounds.TICK_URGENT);
        bombControls.start({
          scale: [1, 1.15, 1],
          rotate: [0, -5, 5, -5, 0],
          transition: { duration: 0.25, repeat: Infinity }
        });
        containerControls.start({
          x: [0, -12, 12, -12, 12, 0],
          y: [0, 12, -12, 12, -12, 0],
          transition: { duration: 0.2, repeat: Infinity }
        });
      } else {
        SoundManager.getInstance().playSFX(sounds.VOTE_TICK);
      }

      if (remaining === 0) {
        if (targetJustHandedOff) {
          targetJustHandedOff = false;
          return;
        }
        clearInterval(interval);
        onExplodeRef.current(targetPlayer.id);
      }
    }, remainingInterval(timeLeft));

    return () => clearInterval(interval);
  }, [room.round_end_time, targetPlayer, bombControls, containerControls, timeLeft]);

  // Handle bomb passing animation (when bomb_target_player changes)
  const prevTargetPlayer = useRef(room.bomb_target_player);
  useEffect(() => {
    if (prevTargetPlayer.current !== room.bomb_target_player) {
      SoundManager.getInstance().playSFX(sounds.SUCCESS);
      bombControls.start({
        x: [0, 500, -500, 0],
        opacity: [1, 0, 0, 1],
        transition: { duration: 0.35 }
      });
      prevTargetPlayer.current = room.bomb_target_player;

      // Update timer and multiplier on the HOST side
      const speedMultiplier = Math.max(0.35, (room.bomb_speed_multiplier || 1.0) * 0.95);
      const newTime = 14000 * speedMultiplier;
      updateDoc(doc(db, "rooms", room.id), {
        bomb_speed_multiplier: speedMultiplier,
        round_end_time: Date.now() + newTime
      }).catch(console.error);
    }
  }, [room.bomb_target_player, bombControls, room.id, room.bomb_speed_multiplier]);

  // Handle Reject Action
  const handleReject = async () => {
    if (!room.previous_bomb_target_player) return;
    
    SoundManager.getInstance().playSFX(sounds.FAILURE);
    try {
      await updateDoc(doc(db, "rooms", room.id), {
        bomb_target_player: room.previous_bomb_target_player,
        round_end_time: Date.now() + 3500,
        previous_bomb_target_player: null
      });
    } catch (err) {
      console.error("Failed to reject word:", err);
    }
  };

  if (!targetPlayer) return null;

  const currentLives = targetPlayer.lives !== undefined ? targetPlayer.lives : 3;
  const usedWords = room.used_words || [];

  return (
    <motion.div 
      animate={containerControls}
      className={`flex-1 flex flex-col items-center justify-between min-h-screen p-8 relative overflow-hidden transition-colors duration-300 ${
        timeLeft <= 4 ? 'bg-[#200008]' : 'bg-[#050002]'
      }`}
    >
      {/* Background Pulse Effect */}
      <motion.div 
        animate={{ 
          scale: timeLeft <= 5 ? [1, 1.25, 1] : [1, 1.05, 1],
          opacity: timeLeft <= 5 ? [0.5, 0.9, 0.5] : [0.2, 0.4, 0.2]
        }}
        transition={{ duration: Math.max(0.2, timeLeft / 10), repeat: Infinity }}
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,0,60,0.2),transparent_70%)] pointer-events-none mix-blend-screen" 
      />
      
      {/* Scanlines & Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.3)_50%)] bg-[length:100%_4px] pointer-events-none opacity-40" />

      {/* TOP: Category Header */}
      <div className="w-full flex flex-col items-center justify-center z-20 pt-4">
        <span className="px-6 py-1.5 rounded-full border border-red-500/40 bg-red-500/10 text-red-400 font-mono tracking-widest text-sm uppercase font-bold mb-2">
          💣 {t("bomb.category")} 💣
        </span>
        <h1 className="text-5xl md:text-6xl font-black text-white uppercase tracking-wider drop-shadow-[0_0_25px_rgba(255,0,60,0.9)]">
          {room.active_letter || "GENEL"}
        </h1>
      </div>

      {/* MIDDLE: Left (Players Status) + Center (Bomb) + Right (Stats) */}
      <div className="w-full max-w-7xl flex items-center justify-between z-10 px-6 gap-8">
        
        {/* Left Side: Players Roster & Lives */}
        <div className="w-72 bg-black/60 border border-white/10 p-5 rounded-2xl backdrop-blur-md hidden lg:flex flex-col gap-3 shadow-[0_0_30px_rgba(0,0,0,0.6)]">
          <h3 className="text-xs font-mono uppercase tracking-widest text-gray-400 font-bold mb-1">
            ⚡ OYUNCULAR ({players.length})
          </h3>
          <div className="space-y-2 max-h-[40vh] overflow-y-auto pr-1">
            {players.map((p) => {
              const pLives = p.lives !== undefined ? p.lives : 3;
              const isTurn = p.id === targetPlayer.id;
              const isEliminated = pLives <= 0;

              return (
                <div 
                  key={p.id}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all ${
                    isTurn 
                      ? "bg-red-600/30 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.6)] scale-105" 
                      : isEliminated
                      ? "bg-black/30 border-white/5 opacity-30 grayscale"
                      : "bg-white/5 border-white/10"
                  }`}
                >
                  <span className={`font-bold text-base truncate max-w-[120px] ${isTurn ? "text-white font-black" : "text-gray-300"}`}>
                    {p.nickname}
                  </span>
                  <div className="flex gap-1">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <span key={i} className="text-sm">
                        {i < pLives ? "❤️" : "🖤"}
                      </span>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Center: Glowing Bomb with Urgency Countdown */}
        <div className="flex-1 flex flex-col items-center justify-center">
          <motion.div
            animate={bombControls}
            className="relative flex items-center justify-center"
          >
            <div className="relative">
              {/* Spinning Fuse Ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: Math.max(0.4, timeLeft / 2), repeat: Infinity, ease: "linear" }}
                className="absolute -inset-6 rounded-full border-4 border-dashed border-red-500/40"
              />

              {/* Bomb Icon */}
              <svg 
                width="340" 
                height="340" 
                viewBox="0 0 24 24" 
                fill={timeLeft <= 4 ? "rgba(255,0,60,0.25)" : "none"} 
                stroke={timeLeft <= 4 ? "#ff003c" : "#ff4d00"} 
                strokeWidth="1.2" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                style={{ filter: `drop-shadow(0px 0px ${timeLeft <= 4 ? '50px' : '25px'} rgba(255,0,60,0.9))` }}
                className="transition-all duration-200"
              >
                <circle cx="11.5" cy="11.5" r="9"/>
                <path d="m19.5 4.5 1.5 1.5"/>
                <path d="m21.5 1.5-1.5 1.5"/>
                <path d="M19.5 1.5c-1 1-2 2-3 2s-3-2-5-2-4 2-5 2"/>
                <path d="M19 8h2"/>
              </svg>

              {/* Timer Text inside the Bomb */}
              <div className="absolute inset-0 flex items-center justify-center pt-2">
                <motion.span 
                  key={timeLeft}
                  initial={{ scale: 1.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className={`text-8xl md:text-9xl font-black tabular-nums tracking-tighter ${
                    timeLeft <= 4 ? 'text-white animate-pulse drop-shadow-[0_0_40px_rgba(255,0,60,1)]' : 'text-transparent bg-clip-text bg-gradient-to-b from-[#ff7700] to-[#ff003c]'
                  }`}
                >
                  {timeLeft}
                </motion.span>
              </div>
            </div>
          </motion.div>

          {/* Current Target Player Card */}
          <div className="mt-8 text-center bg-black/60 px-10 py-6 rounded-3xl backdrop-blur-md border-2 border-red-500/50 shadow-[0_0_50px_rgba(255,0,60,0.25)] relative w-full max-w-md">
            <span className="text-xs font-mono font-bold text-[#ff4d00] uppercase tracking-[0.4em] block mb-2">
              {t("bomb.whoseTurn")}
            </span>
            <motion.h2 
              key={targetPlayer.id}
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="text-4xl md:text-5xl font-black text-white uppercase tracking-tight drop-shadow-[0_0_20px_rgba(255,255,255,0.7)]"
            >
              {targetPlayer.nickname}
            </motion.h2>
            
            <div className="flex gap-2 justify-center mt-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <span key={i} className="text-2xl">
                  {i < currentLives ? "❤️" : "🖤"}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Host Actions & Reject Tool */}
        <div className="w-72 hidden lg:flex flex-col items-center justify-center">
          <AnimatePresence>
            {room.previous_bomb_target_player && (
              <motion.button
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                onClick={handleReject}
                className="w-full py-5 px-6 bg-red-950/90 hover:bg-red-900 border-2 border-red-500 rounded-2xl backdrop-blur-md flex flex-col items-center gap-2 shadow-[0_0_30px_rgba(239,68,68,0.5)] transition-all transform hover:scale-105 active:scale-95 group"
              >
                <span className="text-3xl animate-bounce">❌</span>
                <span className="text-red-400 font-black tracking-widest text-sm uppercase text-center">
                  {t("bomb.rejectWord")}
                </span>
                <span className="text-[10px] text-gray-400 font-mono">
                  (Bombayı geri gönderir - 3.5s)
                </span>
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* BOTTOM: Live Horizontal Word Chain */}
      <div className="w-full max-w-6xl z-20 mt-4">
        <div className="bg-black/70 border border-white/15 p-4 rounded-2xl backdrop-blur-md">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-widest">
              🔥 KELİME ZİNCİRİ ({usedWords.length})
            </span>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto py-1 scrollbar-none">
            {usedWords.length === 0 ? (
              <span className="text-sm text-gray-500 font-mono">İlk kelime bekleniyor...</span>
            ) : (
              usedWords.slice(-8).map((w, idx) => (
                <div key={idx} className="flex items-center gap-2 shrink-0">
                  <span className="px-3.5 py-1.5 rounded-lg bg-red-600/20 border border-red-500/40 text-white font-bold text-sm">
                    {w}
                  </span>
                  {idx < Math.min(usedWords.length - 1, 7) && (
                    <span className="text-gray-600 text-xs">➔</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
