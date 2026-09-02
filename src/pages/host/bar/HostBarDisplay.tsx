import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SoundManager, sounds } from "../../../lib/audio";
import { useLocale } from "../../../hooks/useLocale";
import type { Room, Player } from "../../../types/database";
import { TVScaleFrame } from "../../../components/TVScaleFrame";
import { HostHeader } from "../components/HostHeader";
import { KineticSpark } from "../../../components/KineticSpark";

interface Props {
  room: Room;
  players: Player[];
  updateRoomStatus: (status: Room["status"], data?: Partial<Room>) => void;
}

const COLORS = ["#ff0055", "#00e5ff", "#aeff00", "#ffaa00", "#b700ff"];
const INGREDIENT_NAMES: Record<string, string> = {
  "#ff0055": "ÇİLEK LİKÖRÜ",
  "#00e5ff": "BLUE CURAÇAO",
  "#aeff00": "LIME & MİNT",
  "#ffaa00": "PORTAKAL C",
  "#b700ff": "VİYOLA ŞURUP"
};

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
        const recipe = Array.from({ length: 4 }).map(() => COLORS[Math.floor(Math.random() * COLORS.length)]);
        updateRoomStatus("bar_active", { 
          bar_active_recipe: recipe,
          bar_end_time: Date.now() + 60000 
        });
      }, 4500);
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

  // Timer logic & Recipe Rotation
  useEffect(() => {
    if (gameState !== "active" || !room.bar_end_time) return;
    
    const timerInterval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((room.bar_end_time! - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 5 && remaining > 0) {
        SoundManager.getInstance().playSFX(sounds.TICK_URGENT);
      }
      if (remaining === 0) {
        clearInterval(timerInterval);
        updateRoomStatus("bar_reveal");
      }
    }, 500);

    // Recipe rotation every 4.5 seconds
    const recipeInterval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((room.bar_end_time! - Date.now()) / 1000));
      if (remaining > 0) {
        const recipe = Array.from({ length: 4 }).map(() => COLORS[Math.floor(Math.random() * COLORS.length)]);
        updateRoomStatus("bar_active", { bar_active_recipe: recipe });
      }
    }, 4500);

    return () => {
      clearInterval(timerInterval);
      clearInterval(recipeInterval);
    };
  }, [gameState, room.bar_end_time, updateRoomStatus]);

  const sortedPlayers = [...players].sort((a, b) => (b.bar_score || 0) - (a.bar_score || 0));
  const topPlayers = sortedPlayers.slice(0, 5);

  return (
    <TVScaleFrame>
      <div className="w-full h-full overflow-hidden bg-[#0a0008] text-white flex flex-col p-4 font-sans">
        <HostHeader 
          room={room} 
          onEndGameEarly={() => updateRoomStatus("bar_reveal")} 
          onReturnToLobby={() => updateRoomStatus("night_lobby", { active_game: "none" })}
        />

        <div className="flex-1 relative overflow-hidden flex items-center justify-center">
          <AnimatePresence mode="wait">
            {gameState === "intro" && (
              <motion.div
                key="intro"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.1, opacity: 0 }}
                className="text-center z-10 flex flex-col items-center"
              >
                <span className="text-8xl mb-4 animate-bounce">🍸</span>
                <h1 className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-amber-400 to-cyan-400 drop-shadow-[0_0_30px_rgba(255,0,85,0.6)] uppercase tracking-wider mb-4">
                  {t("host.barIntroTitle")}
                </h1>
                <p className="text-2xl text-cyan-300 font-mono tracking-widest uppercase max-w-xl">
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
                className="w-full h-full flex flex-col items-center justify-between py-6"
              >
                {/* Header: Timer */}
                <div className="flex items-center gap-3 bg-black/60 border border-cyan-500/40 px-8 py-3 rounded-full backdrop-blur-md shadow-[0_0_25px_rgba(0,229,255,0.3)]">
                  <span className="text-cyan-400 font-mono text-sm uppercase tracking-widest font-bold">
                    KOKTEYL SERVİS SÜRESİ:
                  </span>
                  <span className="text-4xl font-black text-cyan-300 font-mono">
                    00:{timeLeft.toString().padStart(2, "0")}
                  </span>
                </div>

                {/* Main Recipe Glass Presentation */}
                <div className="flex flex-col items-center justify-center my-auto">
                  <span className="text-xs font-mono uppercase tracking-[0.4em] text-pink-400 font-bold mb-4">
                    🎯 İSTENEN KOKTEYL TARİFİ (4 KATMAN)
                  </span>
                  
                  <div className="flex gap-4 p-8 bg-black/70 rounded-3xl border-2 border-white/20 shadow-[0_0_50px_rgba(255,0,128,0.3)] backdrop-blur-xl">
                    {room.bar_active_recipe?.map((color, idx) => (
                      <motion.div 
                        key={idx + color}
                        initial={{ y: -30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: idx * 0.08 }}
                        className="w-24 h-40 rounded-2xl border-4 flex flex-col items-center justify-between p-3 relative overflow-hidden"
                        style={{ 
                          backgroundColor: `${color}30`,
                          borderColor: color,
                          boxShadow: `0 0 25px ${color}80`
                        }}
                      >
                        <span className="text-xs font-mono font-bold text-white z-10">#{idx + 1}</span>
                        <div 
                          className="absolute inset-x-0 bottom-0 h-3/4 opacity-70"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-[10px] font-mono font-black text-white z-10 text-center leading-tight uppercase drop-shadow-md">
                          {INGREDIENT_NAMES[color] || "KATMAN"}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Bottom: Bartenders Live Score Leaderboard */}
                <div className="w-full max-w-5xl">
                  <div className="flex justify-center gap-4">
                    {topPlayers.map((p, i) => (
                      <div 
                        key={p.id} 
                        className={`flex-1 p-4 rounded-2xl flex flex-col items-center justify-center border transition-all ${
                          i === 0 
                            ? 'bg-amber-500/20 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)]' 
                            : 'bg-white/5 border-white/10'
                        }`}
                      >
                        <span className="text-xs text-gray-400 font-mono uppercase truncate max-w-[120px]">
                          {i === 0 ? "🥇 " : ""}{p.nickname}
                        </span>
                        <span className="text-3xl font-black text-white mt-1 font-mono">
                          {p.bar_score || 0} 🍹
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {gameState === "reveal" && (
              <motion.div
                key="reveal"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center z-10 flex flex-col items-center"
              >
                <KineticSpark playAudio={false} />
                
                <span className="text-8xl mb-4 animate-bounce">🏆</span>
                <h1 className="text-5xl md:text-6xl font-black uppercase text-amber-400 mb-2 drop-shadow-[0_0_30px_rgba(245,158,11,0.8)]">
                  GECENİN BAŞ BARMENİ!
                </h1>
                
                <h2 className="text-6xl md:text-7xl font-black text-white uppercase tracking-wider mb-8 drop-shadow-lg">
                  {topPlayers[0]?.nickname || "BİLİNMİYOR"} ({topPlayers[0]?.bar_score || 0} Kokteyl)
                </h2>

                <button
                  onClick={() => updateRoomStatus("lobby", { active_game: "none" })}
                  className="px-12 py-5 bg-gradient-to-r from-pink-500 to-amber-500 hover:brightness-110 text-white font-black uppercase tracking-widest text-xl rounded-2xl transition-all shadow-[0_0_40px_rgba(255,0,128,0.5)] transform active:scale-95"
                >
                  {t("colors.endGame")}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </TVScaleFrame>
  );
}
