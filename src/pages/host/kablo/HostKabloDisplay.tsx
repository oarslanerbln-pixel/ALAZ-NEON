import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SoundManager, sounds } from "../../../lib/audio";
import { useLocale } from "../../../hooks/useLocale";
import type { Room, Player } from "../../../types/database";

interface Props {
  room: Room;
  players: Player[];
  updateRoomStatus: (status: Room["status"], data?: Partial<Room>) => void;
}

const TARGET_SCORE = 50; // Total puzzles needed to be solved by the whole team

export function HostKabloDisplay({ room, players, updateRoomStatus }: Props) {
  const { t } = useLocale();
  const [gameState, setGameState] = useState<"intro" | "active" | "reveal">("intro");
  
  const totalScore = players.reduce((sum, p) => sum + (p.kablo_score || 0), 0);
  const progressPercent = Math.min(100, Math.floor((totalScore / TARGET_SCORE) * 100));

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (room.status === "kablo_intro") {
      Promise.resolve().then(() => setGameState("intro"));
      SoundManager.getInstance().playMusic(sounds.LOBBY_AMBIENT, 0.4);
      
      timer = setTimeout(() => {
        updateRoomStatus("kablo_active", { kablo_winner_id: null });
      }, 5000);
    } else if (room.status === "kablo_active") {
      Promise.resolve().then(() => setGameState("active"));
      SoundManager.getInstance().playMusic(sounds.GAME_PULSE, 0.6);
    } else if (room.status === "kablo_reveal") {
      Promise.resolve().then(() => setGameState("reveal"));
      SoundManager.getInstance().playMusic(sounds.FANFARE, 0.7);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [room.status, updateRoomStatus]);

  // Check win condition
  useEffect(() => {
    if (gameState === "active" && totalScore >= TARGET_SCORE) {
      updateRoomStatus("kablo_reveal");
    }
  }, [gameState, totalScore, updateRoomStatus]);

  // Find MVP
  const mvp = [...players].sort((a, b) => (b.kablo_score || 0) - (a.kablo_score || 0))[0];

  return (
    <div className="absolute inset-0 flex items-center justify-center p-8 overflow-hidden bg-black text-white font-sans">
      <AnimatePresence mode="wait">
        {gameState === "intro" && (
          <motion.div
            key="intro"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.2, opacity: 0 }}
            className="text-center"
          >
            <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500 drop-shadow-[0_0_20px_rgba(255,170,0,0.5)] uppercase tracking-widest mb-6">
              {t("host.kabloIntroTitle")}
            </h1>
            <p className="text-3xl text-orange-300 font-mono tracking-widest uppercase">
              {t("host.kabloIntroDesc")}
            </p>
          </motion.div>
        )}

        {gameState === "active" && (
          <motion.div
            key="active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full flex flex-col items-center justify-center py-10"
          >
            <h2 className="text-4xl font-black text-yellow-400 font-mono mb-12 drop-shadow-[0_0_15px_rgba(255,200,0,0.5)] tracking-widest">
              SİSTEM YÜKLENİYOR: %{progressPercent}
            </h2>

            {/* Core Batteries */}
            <div className="flex gap-12 items-end h-64 mb-16">
              {[0, 1, 2].map((i) => {
                const fill = Math.max(0, Math.min(100, (progressPercent - i * 33.3) * 3));
                return (
                  <div key={i} className="w-32 h-full bg-white/5 border-4 border-white/20 rounded-t-xl relative overflow-hidden flex flex-col justify-end shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                    <motion.div 
                      className="w-full bg-gradient-to-t from-orange-600 to-yellow-400"
                      initial={{ height: 0 }}
                      animate={{ height: `${fill}%` }}
                      transition={{ type: "spring", bounce: 0.4 }}
                      style={{ boxShadow: fill > 0 ? "0 -10px 20px rgba(255,200,0,0.5)" : "none" }}
                    />
                  </div>
                );
              })}
            </div>

            {/* Live Feed of Solvers */}
            <div className="flex gap-4 flex-wrap justify-center max-w-4xl">
              {players.filter(p => (p.kablo_score || 0) > 0).map(p => (
                <div key={p.id} className="bg-yellow-500/20 text-yellow-300 border border-yellow-500/50 px-4 py-2 rounded-full font-mono text-sm shadow-[0_0_10px_rgba(255,200,0,0.3)]">
                  {p.nickname} : {p.kablo_score} DEVRE
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {gameState === "reveal" && (
          <motion.div
            key="reveal"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center"
          >
            <h1 className="text-7xl font-black text-green-400 drop-shadow-[0_0_30px_rgba(0,255,0,0.6)] uppercase tracking-widest mb-12">
              SİSTEM ÇEVRİMİÇİ!
            </h1>
            
            {mvp && (
              <div className="bg-white/10 p-12 rounded-3xl border border-white/20 shadow-[0_0_50px_rgba(255,255,255,0.1)] inline-block">
                <div className="text-2xl text-yellow-300 font-mono mb-4">EN İYİ TEKNİSYEN</div>
                <div className="text-7xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] mb-4">
                  {mvp.nickname}
                </div>
                <div className="text-4xl font-bold text-orange-400">
                  {mvp.kablo_score || 0} DEVRE TAMAMLANDI
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
