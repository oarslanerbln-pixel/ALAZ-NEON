import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useLocale } from "../../../hooks/useLocale";
import { PlayerBackground } from "../../../components/PlayerBackground";
import type { Room } from "../../../types/database";

interface PlayerLobbyProps {
  room: Room | null;
  roomId: string | null;
}

const TIPS = [
  { icon: "⚡", text: "Erken gönder → Erken bonus puan kazan!" },
  { icon: "🎯", text: "Benzersiz cevap → 20 puan. Ortak cevap → 10 puan." },
  { icon: "🃏", text: "JOKER ile bir kategoride puanını 2 katına çıkar." },
  { icon: "🏆", text: "Her turda sıralama değişir. Son tura kadar mücadele et!" },
  { icon: "💡", text: "Harfle başlayan her geçerli cevap sayılır." },
];

export function PlayerLobby({ room, roomId }: PlayerLobbyProps) {
  const { t } = useLocale();
  const [playerCount, setPlayerCount] = useState(0);
  const [tipIdx, setTipIdx] = useState(0);

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
      className="flex flex-col items-center justify-center text-center p-6 relative overflow-hidden min-h-[60vh]"
    >
      <PlayerBackground />
      {/* Background vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)] z-0 pointer-events-none opacity-50" />

      <div className="relative z-10 flex flex-col items-center w-full max-w-sm">

        {/* Animated waiting icon */}
        <div className="relative w-20 h-20 flex items-center justify-center mb-8">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border-[0.5px] border-white/5 border-t-white/30 border-b-white/30"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 13, repeat: Infinity, ease: "linear" }}
            className="absolute inset-3 rounded-full border-[0.5px] border-white/10 border-l-white/40"
          />
          <motion.div
            animate={{ scale: [1, 1.6, 1], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="w-2 h-2 bg-alaz-orange rounded-full shadow-[0_0_15px_rgba(255,77,0,0.8)]"
          />
        </div>

        {/* Status */}
        <motion.h2
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
          className="text-base font-light text-white tracking-[0.4em] mb-2 uppercase"
        >
          {t("lobby.networkConnected")}
        </motion.h2>

        {/* Player count */}
        <motion.div
          key={playerCount}
          initial={{ scale: 1.2, color: "#ff5500" }}
          animate={{ scale: 1, color: "#6b7280" }}
          className="flex items-center gap-2 mb-8"
        >
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
          <span className="text-xs font-mono text-gray-500 tracking-widest uppercase">
            {playerCount} oyuncu bağlandı
          </span>
        </motion.div>

        {/* Room info */}
        {room && room.categories?.length > 0 && (
          <div className="w-full mb-8 bg-zinc-900/60 border border-zinc-800 p-4 relative">
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-alaz-orange/50" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-alaz-orange/50" />
            <p className="text-xs text-alaz-orange/60 uppercase tracking-[0.3em] font-mono mb-3">
              BU TURDAKİ KATEGORİLER
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {room.categories.map((cat) => (
                <span
                  key={cat}
                  className="text-xs text-white/70 font-mono border border-zinc-700 px-2 py-1 bg-zinc-800/50"
                >
                  {cat}
                </span>
              ))}
            </div>
            <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-zinc-800">
              <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wide">
                ⏱ {room.timer_setting}sn
              </span>
              <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-wide">
                🏁 {room.total_rounds} tur
              </span>
            </div>
          </div>
        )}

        {/* Rotating tips */}
        <div className="w-full h-16 flex items-center justify-center overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={tipIdx}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.4 }}
              className="flex items-start gap-3 bg-zinc-900/40 border border-zinc-800/60 px-4 py-3 w-full"
            >
              <span className="text-lg shrink-0 mt-0.5">{TIPS[tipIdx].icon}</span>
              <p className="text-xs text-zinc-400 font-light leading-relaxed text-left">
                {TIPS[tipIdx].text}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </motion.div>
  );
}
