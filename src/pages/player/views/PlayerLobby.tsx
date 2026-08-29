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

        <LanguageSwitcher className="mb-6 opacity-70 hover:opacity-100 transition-opacity" />

        {/* Premium Waiting Indicator */}
        <div className="relative w-32 h-32 flex items-center justify-center mb-8">
          {/* Subtle Outer Glow */}
          <div className="absolute inset-0 bg-alaz-orange/5 rounded-full blur-2xl" />
          
          {/* Smooth rings */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-full border border-white/5 border-t-white/30"
          />
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute inset-4 rounded-full border border-white/5 border-b-alaz-orange/40"
          />
          
          {/* Pulsing Core */}
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-4 h-4 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,1)]"
          />
        </div>

        <motion.h2
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="text-sm font-medium text-white/90 tracking-[0.5em] mb-3 uppercase"
        >
          {t("lobby.networkConnected")}
        </motion.h2>

        <motion.div
          key={playerCount}
          initial={{ scale: 1.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex items-center gap-3 mb-10 bg-white/5 px-4 py-2 rounded-full backdrop-blur-md border border-white/10"
        >
          <div className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
          </div>
          <span className="text-[10px] font-bold text-white/70 tracking-widest uppercase">
            {t("waitingRoom.playersConnected", playerCount)}
          </span>
        </motion.div>

        {room && room.categories?.length > 0 && (
          <div className="w-full mb-10 bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-3xl p-6 relative shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            <p className="text-[9px] text-white/40 uppercase tracking-[0.4em] font-black mb-4">
              {t("waitingRoom.categoriesTitle")}
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {room.categories.map((cat) => (
                <span
                  key={cat}
                  className="text-[10px] text-white/90 font-medium tracking-widest uppercase border border-white/10 px-3 py-1.5 rounded-xl bg-white/[0.05]"
                >
                  {cat}
                </span>
              ))}
            </div>
            <div className="flex items-center justify-center gap-6 mt-6 pt-5 border-t border-white/5">
              <span className="text-[10px] text-white/50 font-medium uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="w-1 h-1 bg-white/30 rounded-full" />
                {t("waitingRoom.timerLabel", String(room.timer_setting))}
              </span>
              <span className="text-[10px] text-white/50 font-medium uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="w-1 h-1 bg-white/30 rounded-full" />
                {t("waitingRoom.roundsLabel", String(room.total_rounds))}
              </span>
            </div>
          </div>
        )}

        <div className="w-full relative h-24 flex items-center justify-center perspective-[1000px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={tipIdx}
              initial={{ opacity: 0, rotateX: -20, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, rotateX: 0, y: 0, scale: 1 }}
              exit={{ opacity: 0, rotateX: 20, y: -10, scale: 0.95 }}
              transition={{ duration: 0.6, type: "spring", bounce: 0.4 }}
              className="absolute w-full bg-gradient-to-br from-white/10 to-transparent border border-white/10 rounded-2xl p-5 backdrop-blur-xl shadow-[0_10px_20px_rgba(0,0,0,0.3)] flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center shrink-0 border border-white/20 shadow-inner">
                <span className="text-xl">{TIPS[tipIdx].icon}</span>
              </div>
              <p className="text-xs text-white/80 font-medium leading-relaxed text-left">
                {t(TIPS[tipIdx].key)}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

      </div>
    </motion.div>
  );
}
