import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useLocale } from "../../../hooks/useLocale";
import { PlayerBackground } from "../../../components/PlayerBackground";
import { LanguageSwitcher } from "../../../components/LanguageSwitcher";
import type { Room } from "../../../types/database";

interface PlayerLobbyProps {
  room: Room | null;
  roomId: string | null;
}

/**
 * İpuçları çeviri anahtarı olarak tutuluyor, düz metin değil — metin `t()`
 * ile render sırasında çözülüyor ki dil değişince ekrandaki ipucu da
 * anında o dile geçsin.
 */
const TIPS = [
  { icon: "⚡", key: "tips.early" },
  { icon: "🎯", key: "tips.uniqueBonus" },
  { icon: "🃏", key: "tips.joker" },
  { icon: "🏆", key: "tips.ranking" },
  { icon: "💡", key: "tips.validLetter" },
] as const;

export function PlayerLobby({ room, roomId }: PlayerLobbyProps) {
  const { t } = useLocale();
  const [playerCount, setPlayerCount] = useState(0);
  const [tipIdx, setTipIdx] = useState(0);

  const [barcodeLines] = useState(() => {
    return [...Array(40)].map(() => ({
      widthClass: Math.random() > 0.5 ? 'w-0.5' : 'w-1',
      marginClass: Math.random() > 0.7 ? 'mx-1' : 'mx-0.5'
    }));
  });

  // Live player count
  useEffect(() => {
    if (!roomId) return;
    const q = query(collection(db, "players"), where("room_id", "==", roomId));
    const unsub = onSnapshot(q, (snap) => setPlayerCount(snap.size));
    return () => unsub();
  }, [roomId]);

  // Rotate tips every 3.5s
  useEffect(() => {
    const timer = setInterval(() => {
      setTipIdx((i) => (i + 1) % TIPS.length);
    }, 3500);
    return () => clearInterval(timer);
  }, []);

  return (
    <motion.div
      key="lobby"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, filter: "blur(10px)" }}
      className="flex flex-col items-center justify-between text-center p-6 relative overflow-hidden min-h-[100dvh]"
    >
      <PlayerBackground />
      {/* Darker background overlay for the cyberpunk vibe */}
      <div className="absolute inset-0 bg-black/70 z-0 pointer-events-none" />

      {/* --- HEADER (ID CARD / SECURITY CLEARANCE) --- */}
      <div className="relative z-10 w-full max-w-sm mt-4">
        <LanguageSwitcher className="absolute top-2 right-2 opacity-70 hover:opacity-100 transition-opacity z-50" />
        <div className="border border-cyan-500/30 bg-cyan-950/20 backdrop-blur-md rounded-xl p-5 shadow-[0_0_20px_rgba(0,229,255,0.1)] text-left flex flex-col gap-2 relative overflow-hidden">
          {/* Glitch CRT lines overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,255,255,0.05)_50%)] bg-[length:100%_4px] pointer-events-none opacity-50" />
          
          <div className="flex justify-between items-start pt-1">
             <h1 className="text-2xl font-black text-white tracking-[0.2em] font-premium drop-shadow-[0_0_10px_rgba(0,229,255,0.8)]" style={{ animation: "text-glitch-slight 4s infinite" }}>
               HENGAME
             </h1>
             <span className="text-[8px] text-cyan-400 uppercase tracking-widest font-mono bg-cyan-950/80 px-2 py-1 rounded border border-cyan-500/30 mt-1 shadow-[0_0_10px_rgba(0,229,255,0.2)]">
               ID_AUTH_01
             </span>
          </div>

          <div className="flex flex-col mt-3">
            <span className="text-[10px] text-white/40 uppercase tracking-widest font-mono mb-1">Status:</span>
            <span className="text-xs text-green-400 font-mono tracking-widest uppercase shadow-[0_0_10px_rgba(0,255,0,0.1)]" style={{ animation: "text-glitch-slight 3s infinite" }}>
              [ {t("lobby.networkConnected")} ]
            </span>
          </div>

          {/* Barcode section */}
          <div className="mt-5 w-full h-10 bg-black/60 border border-white/10 rounded flex relative overflow-hidden">
             {/* Simple vertical lines for barcode */}
             <div className="flex items-end w-full h-full opacity-60 px-1 py-1">
                {barcodeLines.map((line, i) => (
                  <div key={i} className={`h-full bg-white ${line.widthClass} ${line.marginClass}`} />
                ))}
             </div>
             {/* Scanning laser */}
             <div className="absolute top-0 left-0 w-full h-[2px] bg-cyan-400 shadow-[0_0_10px_#00e5ff]" style={{ animation: "barcode-scan 2s linear infinite" }} />
          </div>
        </div>
      </div>

      {/* --- MIDDLE (NEON PULSE RADAR) --- */}
      <div className="relative z-10 flex-1 flex items-center justify-center w-full my-8 min-h-[250px]">
        {/* Radar Rings */}
        <div className="absolute inset-0 flex items-center justify-center">
           <div className="absolute w-32 h-32 rounded-full border border-orange-500 shadow-[0_0_30px_#ff5500]" style={{ animation: "radar-pulse 4s ease-out infinite" }} />
           <div className="absolute w-32 h-32 rounded-full border border-cyan-500 shadow-[0_0_30px_#00e5ff]" style={{ animation: "radar-pulse 4s ease-out infinite 1.3s" }} />
           <div className="absolute w-32 h-32 rounded-full border border-pink-500 shadow-[0_0_30px_#ff00ff]" style={{ animation: "radar-pulse 4s ease-out infinite 2.6s" }} />
           
           {/* Static glowing core */}
           <div className="absolute w-36 h-36 rounded-full border border-white/20 bg-black/40 backdrop-blur-md shadow-[0_0_40px_rgba(0,229,255,0.15)] flex flex-col items-center justify-center gap-1 z-10">
             <motion.div animate={{ rotate: 360 }} transition={{ duration: 15, repeat: Infinity, ease: "linear" }} className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-500/30 opacity-70" />
             <motion.div animate={{ rotate: -360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="absolute inset-2 rounded-full border border-dotted border-orange-500/40 opacity-50" />
             
             <span className="text-white/95 text-sm font-black tracking-[0.3em] uppercase drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] z-20 mt-1">
               SYNCING
             </span>
             <span className="text-[9px] text-cyan-300 font-mono tracking-widest z-20 bg-black/60 px-2 py-0.5 rounded-sm border border-cyan-500/30 mt-1">
               ETA: --:--
             </span>
           </div>
        </div>
      </div>

      {/* --- FOOTER (GLASS TERMINAL) --- */}
      <div className="relative z-10 w-full max-w-sm mb-4">
        {/* Categories */}
        {room && room.categories?.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center mb-5">
            {room.categories.map((cat) => (
              <span
                key={cat}
                className="text-[9px] text-white/80 font-mono tracking-widest uppercase border border-white/20 px-2.5 py-1 rounded bg-black/50 shadow-[0_0_10px_rgba(0,0,0,0.5)]"
              >
                #{cat}
              </span>
            ))}
          </div>
        )}

        {/* Terminal panel */}
        <div className="w-full bg-black/70 border border-white/10 rounded-lg p-5 backdrop-blur-xl relative font-mono text-left shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
          {/* Decorative corner brackets */}
          <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-cyan-500/50 rounded-tl-sm" />
          <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-cyan-500/50 rounded-tr-sm" />
          <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-cyan-500/50 rounded-bl-sm" />
          <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-cyan-500/50 rounded-br-sm" />
          
          <div className="flex justify-between items-center mb-4 pb-3 border-b border-white/10">
             <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#00ff00]" />
               <span className="text-[10px] text-green-400 uppercase tracking-widest">
                  {t("waitingRoom.playersConnected", playerCount)}
               </span>
             </div>
             
             {room && (
               <div className="flex gap-3 text-[9px] text-white/40 uppercase tracking-widest">
                 <span>RND: {room.total_rounds}</span>
                 <span>TMR: {room.timer_setting}s</span>
               </div>
             )}
          </div>
          
          <div className="h-10 flex items-center relative overflow-hidden">
            <AnimatePresence mode="wait">
              <motion.div
                key={tipIdx}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.3 }}
                className="text-[10px] md:text-[11px] text-white/90 leading-relaxed flex gap-2 w-full"
              >
                <span className="text-cyan-500 font-bold shrink-0">{">"}</span>
                <span className="break-words">
                  {TIPS[tipIdx].icon} {t(TIPS[tipIdx].key)}
                </span>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
