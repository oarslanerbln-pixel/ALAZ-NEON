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

const COLORS = ["#ff0055", "#00e5ff", "#aeff00", "#ffaa00", "#b700ff"];

export function HostBarDisplay({ room, players, updateRoomStatus }: Props) {
  const { t } = useLocale();
  const [gameState, setGameState] = useState<"intro" | "active" | "reveal">("intro");
  const [timeLeft, setTimeLeft] = useState(60);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (room.status === "bar_intro") {
      Promise.resolve().then(() => setGameState("intro"));
      SoundManager.getInstance().playMusic(sounds.LOBBY_AMBIENT, 0.4);
      
      timer = setTimeout(() => {
        // Generate random recipe of 4 colors
        const recipe = Array.from({length: 4}).map(() => COLORS[Math.floor(Math.random() * COLORS.length)]);
        updateRoomStatus("bar_active", { 
          bar_active_recipe: recipe,
          bar_end_time: Date.now() + 60000 
        });
      }, 5000);
    } else if (room.status === "bar_active") {
      Promise.resolve().then(() => setGameState("active"));
      SoundManager.getInstance().playMusic(sounds.GAME_PULSE, 0.6);
    } else if (room.status === "bar_reveal") {
      Promise.resolve().then(() => setGameState("reveal"));
      SoundManager.getInstance().playMusic(sounds.FANFARE, 0.7);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [room.status, updateRoomStatus]);

  // Timer logic & Recipe Rotation for active state
  useEffect(() => {
    if (gameState !== "active" || !room.bar_end_time) return;
    
    // Timer for time left
    const timerInterval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((room.bar_end_time! - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining === 0) {
        clearInterval(timerInterval);
        updateRoomStatus("bar_reveal");
      }
    }, 500);

    // Recipe rotation every 4 seconds
    const recipeInterval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((room.bar_end_time! - Date.now()) / 1000));
      if (remaining > 0) {
        const recipe = Array.from({length: 4}).map(() => COLORS[Math.floor(Math.random() * COLORS.length)]);
        updateRoomStatus("bar_active", { bar_active_recipe: recipe });
      }
    }, 4000);

    return () => {
      clearInterval(timerInterval);
      clearInterval(recipeInterval);
    };
  }, [gameState, room.bar_end_time, updateRoomStatus]);

  // Sort players by score
  const sortedPlayers = [...players].sort((a, b) => (b.bar_score || 0) - (a.bar_score || 0));
  const topPlayers = sortedPlayers.slice(0, 5);

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
            <h1 className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-cyan-400 drop-shadow-[0_0_20px_rgba(255,0,85,0.5)] uppercase tracking-widest mb-6">
              {t("host.barIntroTitle")}
            </h1>
            <p className="text-3xl text-cyan-300 font-mono tracking-widest uppercase">
              {t("host.barIntroDesc")}
            </p>
          </motion.div>
        )}

        {gameState === "active" && (
          <motion.div
            key="active"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full h-full flex flex-col items-center justify-between py-10"
          >
            {/* Header: Timer */}
            <div className="text-center mb-8">
               <h2 className="text-6xl font-black text-cyan-400 font-mono drop-shadow-[0_0_15px_rgba(0,229,255,0.5)]">
                 00:{timeLeft.toString().padStart(2, "0")}
               </h2>
            </div>

            {/* Main Center: Cocktail Recipe */}
            <div className="flex-1 flex flex-col items-center justify-center">
              <h3 className="text-2xl text-white/50 font-mono uppercase tracking-widest mb-6">Hedef Kokteyl</h3>
              <div className="flex gap-4 p-8 bg-white/5 rounded-2xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                {room.bar_active_recipe?.map((color, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: idx * 0.1 }}
                    className="w-20 h-32 rounded-lg border-2"
                    style={{ 
                      backgroundColor: `${color}40`,
                      borderColor: color,
                      boxShadow: `0 0 20px ${color}60`
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Bottom: Leaderboard */}
            <div className="w-full max-w-4xl mt-8">
              <div className="flex justify-center gap-4">
                {topPlayers.map((p, i) => (
                  <div key={p.id} className="flex-1 bg-white/5 border border-white/10 p-4 rounded-xl flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="text-sm text-white/50 mb-1">{p.nickname}</div>
                    <div className="text-3xl font-black text-cyan-400">{p.bar_score || 0}</div>
                    {i === 0 && (
                      <div className="absolute top-0 right-0 bg-yellow-400 text-black text-[10px] font-bold px-2 py-1 rounded-bl-lg">
                        LİDER
                      </div>
                    )}
                  </div>
                ))}
              </div>
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
            <h1 className="text-6xl font-black text-green-400 drop-shadow-[0_0_20px_rgba(0,255,0,0.5)] uppercase tracking-widest mb-12">
              SÜRE BİTTİ
            </h1>
            
            {sortedPlayers.length > 0 && (
              <div className="bg-white/10 p-12 rounded-3xl border border-white/20 shadow-[0_0_50px_rgba(255,255,255,0.1)] inline-block">
                <div className="text-2xl text-cyan-300 font-mono mb-4">GECENİN BARMENİ</div>
                <div className="text-7xl font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] mb-4">
                  {sortedPlayers[0].nickname}
                </div>
                <div className="text-4xl font-bold text-pink-500">
                  {sortedPlayers[0].bar_score || 0} KOKTEYL
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
