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

const TARGET_SCORE = 40;

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
      }, 4500);
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

  const mvp = [...players].sort((a, b) => (b.kablo_score || 0) - (a.kablo_score || 0))[0];

  return (
    <TVScaleFrame>
      <div className="w-full h-full overflow-hidden bg-[#0a0500] text-white flex flex-col p-4 font-sans">
        <HostHeader 
          room={room} 
          onEndGameEarly={() => updateRoomStatus("kablo_reveal")} 
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
                <span className="text-8xl mb-4 animate-bounce">⚡</span>
                <h1 className="text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500 drop-shadow-[0_0_30px_rgba(255,170,0,0.6)] uppercase tracking-wider mb-4">
                  {t("host.kabloIntroTitle")}
                </h1>
                <p className="text-2xl text-amber-300 font-mono tracking-widest uppercase max-w-xl">
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
                className="w-full h-full flex flex-col items-center justify-between py-6"
              >
                <div className="text-center">
                  <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-[0.4em] block mb-2">
                    ⚡ DEVRE BAĞLANTILARI TAMAMLANIYOR
                  </span>
                  <h2 className="text-5xl font-black text-yellow-400 font-mono drop-shadow-[0_0_20px_rgba(255,200,0,0.6)] tracking-wider">
                    ENERJİ ŞARJI: %{progressPercent}
                  </h2>
                </div>

                {/* Cyberpunk Reactor Batteries */}
                <div className="flex gap-8 items-end h-56 my-auto">
                  {[0, 1, 2].map((i) => {
                    const fill = Math.max(0, Math.min(100, (progressPercent - i * 33.3) * 3));
                    return (
                      <div key={i} className="w-36 h-full bg-black/60 border-4 border-amber-400/40 rounded-3xl relative overflow-hidden flex flex-col justify-end shadow-[0_0_40px_rgba(255,200,0,0.3)] backdrop-blur-md p-1.5">
                        <motion.div 
                          className="w-full bg-gradient-to-t from-amber-600 via-yellow-400 to-amber-200 rounded-2xl"
                          initial={{ height: 0 }}
                          animate={{ height: `${fill}%` }}
                          transition={{ type: "spring", bounce: 0.3 }}
                          style={{ boxShadow: fill > 0 ? "0 -10px 25px rgba(255,200,0,0.6)" : "none" }}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Live Solvers Feed */}
                <div className="flex gap-3 flex-wrap justify-center max-w-4xl">
                  {players.filter(p => (p.kablo_score || 0) > 0).map(p => (
                    <div key={p.id} className="bg-amber-500/20 text-yellow-200 border border-amber-400/50 px-4 py-2 rounded-2xl font-mono text-sm shadow-[0_0_15px_rgba(255,200,0,0.3)] flex items-center gap-2">
                      <span className="font-bold">{p.nickname}:</span>
                      <span className="font-black text-white">{p.kablo_score} DEVRE 🔌</span>
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
                className="text-center z-10 flex flex-col items-center"
              >
                <KineticSpark playAudio={false} />
                <span className="text-8xl mb-4 animate-bounce">🔋</span>
                <h1 className="text-6xl font-black text-yellow-400 uppercase tracking-widest mb-2 drop-shadow-[0_0_30px_rgba(255,200,0,0.8)]">
                  ENERJİ ŞEBEKESİ BAĞLANDI!
                </h1>
                
                {mvp && (
                  <p className="text-3xl text-white font-mono uppercase tracking-widest mb-10">
                    ⚡ BAŞ TEKNİSYEN: <span className="text-amber-400 font-black">{mvp.nickname}</span> ({mvp.kablo_score || 0} Devre)
                  </p>
                )}

                <button
                  onClick={() => updateRoomStatus("lobby", { active_game: "none" })}
                  className="px-12 py-5 bg-gradient-to-r from-yellow-500 to-amber-500 hover:brightness-110 text-black font-black uppercase tracking-widest text-xl rounded-2xl transition-all shadow-[0_0_40px_rgba(255,200,0,0.6)] transform active:scale-95"
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
