import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { SoundManager, sounds } from "../../../lib/audio";
import { useLocale } from "../../../hooks/useLocale";
import type { Room, Player } from "../../../types/database";
import { HostHeader } from "../components/HostHeader";
import { TVScaleFrame } from "../../../components/TVScaleFrame";
import { NeonIcon } from "../../../components/NeonIcon";

interface Props {
  room: Room;
  players: Player[];
  updateRoomStatus: (status: Room["status"], updates?: Partial<Room>) => Promise<void>;
}

export function HostUnityDisplay({ room, players, updateRoomStatus }: Props) {
  const { t } = useLocale();
  const [gameState, setGameState] = useState<"intro" | "active" | "reveal">("intro");
  const [timeLeft, setTimeLeft] = useState(60);

  const target = room.unity_target || (players.length || 1) * 100;
  const current = room.unity_current || 0;
  const percentage = Math.min(100, Math.max(0, (current / target) * 100));

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (room.status === "unity_intro") {
      Promise.resolve().then(() => setGameState("intro"));
      SoundManager.getInstance().playMusic(sounds.LOBBY_AMBIENT, 0.4);
      
      timer = setTimeout(() => {
        updateRoomStatus("unity_active", { 
          unity_target: target,
          unity_current: 0,
          unity_end_time: Date.now() + 60000 
        });
      }, 5000);
    } else if (room.status === "unity_active") {
      Promise.resolve().then(() => setGameState("active"));
    } else if (room.status === "unity_reveal") {
      Promise.resolve().then(() => setGameState("reveal"));
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [room.status, target, updateRoomStatus]);

  // Timer & End Condition
  useEffect(() => {
    if (gameState !== "active") return;

    if (percentage >= 100) {
      // Win condition met
      SoundManager.getInstance().playSFX(sounds.SUCCESS);
      updateRoomStatus("unity_reveal");
      return;
    }

    const endTime = room.unity_end_time || Date.now() + 60000;
    
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((endTime - Date.now()) / 1000));
      setTimeLeft(remaining);

      if (remaining === 0) {
        clearInterval(interval);
        SoundManager.getInstance().playSFX(sounds.FAILURE);
        updateRoomStatus("unity_reveal");
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [gameState, percentage, room.unity_end_time, updateRoomStatus]);

  // Music for active state
  useEffect(() => {
    if (gameState === "active") {
      SoundManager.getInstance().playMusic(sounds.GAME_PULSE, 0.5 + (percentage / 200)); // Gets louder
    } else if (gameState === "reveal") {
      SoundManager.getInstance().stopSound(sounds.GAME_PULSE);
    }
  }, [gameState, percentage]);

  return (
    <TVScaleFrame>
      <div className="w-full h-full flex flex-col p-8 overflow-hidden bg-black/90">
        <HostHeader room={room} onEndGameEarly={() => updateRoomStatus("lobby", { active_game: "none" })} />

        <div className="flex-1 flex items-center justify-center relative w-full">
          <AnimatePresence mode="wait">
            {gameState === "intro" && (
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 1.2 }}
                className="flex flex-col items-center"
              >
                <NeonIcon type="flame" color="orange" className="w-40 h-40 mb-8 animate-pulse" />
                <h1 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-amber-400 to-orange-600 uppercase tracking-widest drop-shadow-[0_0_30px_rgba(245,158,11,0.5)]">
                  {t("host.unityIntroTitle", "NEON BİRLİK")}
                </h1>
                <p className="text-white/50 text-2xl mt-4 uppercase tracking-[0.5em] text-center max-w-3xl">
                  {t("host.unityIntroDesc", "MEKANIN TÜM ENERJİSİNİ KULLANARAK BATARYAYI PATLATIN!")}
                </p>
              </motion.div>
            )}

            {gameState === "active" && (
              <motion.div
                key="active"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center w-full max-w-4xl"
              >
                <h2 className="text-5xl font-black text-amber-400 tracking-widest uppercase mb-12">
                  TELEFONA DELİ GİBİ BAS!
                </h2>
                
                <div className="w-full h-32 bg-white/5 rounded-full border-4 border-white/10 relative overflow-hidden flex items-center p-2 shadow-[inset_0_0_50px_rgba(0,0,0,0.5)]">
                  <motion.div 
                    className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 relative"
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ type: "tween", duration: 0.5 }}
                  >
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,rgba(255,255,255,0.2)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.2)_50%,rgba(255,255,255,0.2)_75%,transparent_75%,transparent)] bg-[length:40px_40px] animate-[slide_2s_linear_infinite]" />
                  </motion.div>
                  <div className="absolute inset-0 flex items-center justify-center font-black text-4xl text-white mix-blend-overlay drop-shadow-md">
                    {Math.floor(percentage)}%
                  </div>
                </div>
                
                <div className="mt-12 text-6xl font-black font-mono text-white/50">
                  00:{timeLeft.toString().padStart(2, "0")}
                </div>
              </motion.div>
            )}

            {gameState === "reveal" && (
              <motion.div
                key="reveal"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center text-center"
              >
                {percentage >= 100 ? (
                  <>
                    <h1 className="text-9xl text-transparent bg-clip-text bg-gradient-to-b from-amber-400 to-orange-600 font-black uppercase drop-shadow-[0_0_50px_rgba(245,158,11,0.8)] mb-4">
                      OVERCHARGE!
                    </h1>
                    <p className="text-4xl text-white font-black tracking-widest uppercase mb-16">
                      MEKAN ENERJİ PATLAMASI YAŞADI!
                    </p>
                  </>
                ) : (
                  <>
                    <h1 className="text-8xl text-red-500 font-black uppercase drop-shadow-[0_0_30px_rgba(239,68,68,0.5)] mb-4">
                      BAŞARISIZ
                    </h1>
                    <p className="text-3xl text-white/50 font-black tracking-widest uppercase mb-16">
                      ENERJİ YETERSİZ KALDI
                    </p>
                  </>
                )}
                
                <button
                  onClick={() => updateRoomStatus("lobby", { active_game: "none", unity_current: 0 })}
                  className="px-12 py-4 bg-amber-500 hover:bg-amber-400 text-black font-black rounded-full uppercase tracking-widest transition-colors shadow-[0_0_30px_rgba(245,158,11,0.4)]"
                >
                  Lobiye Dön
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </TVScaleFrame>
  );
}
