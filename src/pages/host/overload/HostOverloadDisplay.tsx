import { useEffect, useState, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Room, Player } from "../../../types/database";
import { SoundManager, sounds } from "../../../lib/audio";
import { useLocale } from "../../../hooks/useLocale";
import { HostLobby } from "../views/HostLobby";
import { HostHeader } from "../components/HostHeader";
import { TVScaleFrame } from "../../../components/TVScaleFrame";
import { grantRewardToPlayers } from "../../../lib/rewards";
import { useVenue } from "../../../contexts/VenueContextCore";

interface HostOverloadDisplayProps {
  room: Room;
  players: Player[];
  updateRoomStatus: (status: Room["status"], updates?: Partial<Room>) => Promise<void>;
}

export function HostOverloadDisplay({ room, players, updateRoomStatus }: HostOverloadDisplayProps) {
  const { t } = useLocale();
  const [timeLeft, setTimeLeft] = useState<number>(room.overload_time_allowed || 10);
  const [isExploding, setIsExploding] = useState(false);
  const { venue } = useVenue();
  const hasGrantedReward = useRef(false);

  // Active players (not eliminated)
  const activePlayers = useMemo(() => {
    return players.filter(p => !(room.overload_eliminated_ids || []).includes(p.id));
  }, [players, room.overload_eliminated_ids]);

  const targetPlayer = useMemo(() => {
    return players.find(p => p.id === room.overload_target_id);
  }, [players, room.overload_target_id]);

  // Host Logic (Server Authoritative)
  useEffect(() => {
    if (activePlayers.length === 0) return;

    if (!room.overload_target_id || room.overload_target_id === "passing" || !activePlayers.find(p => p.id === room.overload_target_id)) {
      const candidates = activePlayers.filter(p => p.id !== room.overload_last_target_id);
      const pool = candidates.length > 0 ? candidates : activePlayers;
      const nextTarget = pool[Math.floor(Math.random() * pool.length)];

      let newTimeAllowed = room.overload_time_allowed || 10;
      if (room.overload_target_id === "passing") {
        newTimeAllowed = Math.max(1.5, newTimeAllowed * 0.88);
        SoundManager.getInstance().playSFX(sounds.SUCCESS);
      } else if (!room.overload_target_id) {
        newTimeAllowed = 10;
      }

      updateRoomStatus("playing", {
        overload_target_id: nextTarget.id,
        overload_time_allowed: newTimeAllowed,
        overload_start_time: Date.now()
      });
      return;
    }

    // Win condition (1 survivor)
    if (activePlayers.length === 1 && (room.overload_eliminated_ids?.length || 0) > 0 && room.status !== "finished") {
      SoundManager.getInstance().playSFX(sounds.FANFARE);
      updateRoomStatus("finished");
      return;
    }

    // Timer Loop
    const interval = setInterval(() => {
      if (!room.overload_start_time || isExploding) return;

      const now = Date.now();
      const allowedMs = (room.overload_time_allowed || 10) * 1000;
      const elapsed = now - room.overload_start_time;
      const remaining = Math.max(0, allowedMs - elapsed);

      const sec = Math.ceil(remaining / 1000);
      setTimeLeft(sec);

      if (sec <= 3 && sec > 0) {
        SoundManager.getInstance().playSFX(sounds.TICK_URGENT);
      }

      if (remaining === 0) {
        setIsExploding(true);
        SoundManager.getInstance().playSFX(sounds.CINEMATIC_BOOM);
        
        const newEliminated: string[] = [...(room.overload_eliminated_ids || []), room.overload_target_id as string];
        
        setTimeout(() => {
          updateRoomStatus("playing", {
            overload_target_id: null,
            overload_last_target_id: null,
            overload_eliminated_ids: newEliminated,
            overload_time_allowed: 10,
            overload_start_time: 0
          });
          setIsExploding(false);
        }, 2500);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [room.overload_target_id, room.overload_last_target_id, room.status, room.overload_start_time, room.overload_time_allowed, activePlayers, isExploding, updateRoomStatus, room.overload_eliminated_ids]);

  // Give reward to champion
  useEffect(() => {
    if (activePlayers.length !== 1 || hasGrantedReward.current) return;
    const champion = activePlayers[0];
    if (!champion?.uid) return;
    hasGrantedReward.current = true;
    grantRewardToPlayers(
      [{ uid: champion.uid, nickname: champion.nickname }],
      venue,
    ).catch((err) =>
      console.error("[HostOverloadDisplay] Ödül dağıtımı başarısız:", err),
    );
  }, [activePlayers, venue]);

  return (
    <TVScaleFrame>
      <div className="relative w-full h-full bg-[#05000a] overflow-hidden flex flex-col items-center justify-center font-sans">
        <HostHeader 
          room={room} 
          onEndGameEarly={() => updateRoomStatus("finished")} 
          onReturnToLobby={() => updateRoomStatus("night_lobby", { active_game: "none" })}
        />
        
        {/* Cyberpunk Grid Background */}
        <div className="absolute inset-0 pointer-events-none opacity-25 bg-[linear-gradient(rgba(0,255,255,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(0,255,255,0.2)_1px,transparent_1px)] bg-[size:50px_50px]" />
        
        {/* Critical Voltage Flash */}
        {timeLeft <= 3 && room.status === "playing" && !isExploding && (
          <motion.div 
            animate={{ opacity: [0, 0.4, 0] }} 
            transition={{ repeat: Infinity, duration: timeLeft <= 1.5 ? 0.25 : 0.5 }} 
            className="absolute inset-0 bg-red-600 pointer-events-none z-10 mix-blend-screen"
          />
        )}

        {/* TOP STATUS BAR: Active Players Badges */}
        {room.status !== "lobby" && room.status !== "finished" && (
          <div className="absolute top-24 left-8 right-8 flex justify-between items-center z-20">
            <div className="flex items-center gap-2">
              <span className="text-2xl animate-pulse">⚡</span>
              <span className="text-cyan-400 font-mono font-black tracking-[0.3em] uppercase text-xl">
                AŞIRI YÜKLEME (OVERLOAD)
              </span>
            </div>
            
            <div className="flex gap-2 flex-wrap max-w-xl justify-end">
              {players.map(p => {
                const isEliminated = (room.overload_eliminated_ids || []).includes(p.id);
                const isCurrent = p.id === targetPlayer?.id;

                return (
                  <div 
                    key={p.id} 
                    className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border transition-all ${
                      isCurrent 
                        ? 'border-red-500 bg-red-600/30 text-white shadow-[0_0_20px_rgba(239,68,68,0.8)] scale-105' 
                        : isEliminated 
                        ? 'border-white/5 text-gray-600 line-through bg-black/40' 
                        : 'border-cyan-400/40 text-cyan-300 bg-cyan-950/30'
                    }`}
                  >
                    {p.nickname}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <AnimatePresence mode="wait">
          {room.status === "lobby" ? (
            <motion.div
              key="lobby"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-50 bg-black/90 backdrop-blur-sm"
            >
              <HostLobby
                room={room}
                players={players}
                onStartGame={async () => {
                  const nextTarget = players[Math.floor(Math.random() * players.length)];
                  await updateRoomStatus("playing", {
                    overload_target_id: nextTarget?.id || null,
                    overload_start_time: Date.now(),
                    overload_eliminated_ids: []
                  });
                }}
                onUpdateCategories={async () => {}}
              />
            </motion.div>
          ) : room.status === "finished" ? (
            <motion.div
              key="finished"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="z-10 flex flex-col items-center justify-center text-center"
            >
              <span className="text-8xl mb-4 animate-bounce">👑</span>
              <h1 className="text-4xl text-cyan-400 font-mono font-black uppercase tracking-widest mb-2">
                HAYATTA KALAN ŞAMPİYON
              </h1>
              <h2 className="text-7xl md:text-8xl text-white font-black uppercase drop-shadow-[0_0_40px_rgba(0,255,255,0.9)] mb-10">
                {activePlayers[0]?.nickname || "KAZANAN"}
              </h2>
              <button
                onClick={() => updateRoomStatus("lobby", { active_game: "none", overload_eliminated_ids: [], overload_target_id: null })}
                className="px-10 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 text-black font-black uppercase tracking-widest text-xl rounded-2xl transition-all shadow-[0_0_40px_rgba(0,255,255,0.5)] transform active:scale-95"
              >
                {t("quiz.finishGame", "OYUNU BİTİR")}
              </button>
            </motion.div>
          ) : isExploding ? (
            <motion.div
              key="explosion"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: [1, 1.5, 2], opacity: [1, 1, 0] }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="absolute inset-0 flex flex-col items-center justify-center z-50 pointer-events-none"
            >
              <div className="w-[800px] h-[800px] bg-red-600 rounded-full blur-[120px]" />
              <span className="text-9xl mb-4">💥</span>
              <h1 className="text-8xl md:text-9xl font-black text-white uppercase drop-shadow-[0_0_40px_rgba(255,0,0,1)] tracking-widest">
                AŞIRI YÜKLENDİ!
              </h1>
            </motion.div>
          ) : (
            <motion.div
              key="active"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative z-10 flex flex-col items-center justify-center mt-12"
            >
              {/* Active Target Banner */}
              {targetPlayer ? (
                <motion.div 
                  initial={{ y: -30, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className="flex flex-col items-center text-center mb-6"
                >
                  <span className="text-red-500 text-sm font-mono font-bold tracking-[0.5em] mb-1 animate-pulse">
                    ⚡ VOLTAJ KİMDE:
                  </span>
                  <h1 className="text-6xl md:text-8xl font-black text-white uppercase tracking-tight drop-shadow-[0_0_30px_rgba(255,0,0,0.8)]">
                    {targetPlayer.nickname}
                  </h1>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center text-center mb-6">
                  <h1 className="text-5xl md:text-6xl font-black text-amber-400 uppercase tracking-widest animate-pulse">
                    ⚡ AKTARILIYOR...
                  </h1>
                </div>
              )}

              {/* High-Voltage Reactor Core */}
              <div className="relative w-64 h-64 md:w-80 md:h-80 flex items-center justify-center my-4">
                <motion.div 
                  animate={{ 
                    scale: timeLeft <= 3 ? [1, 1.15, 1] : [1, 1.05, 1], 
                    rotate: 360 
                  }}
                  transition={{ 
                    scale: { repeat: Infinity, duration: Math.max(0.2, timeLeft / 10) },
                    rotate: { repeat: Infinity, duration: 8, ease: "linear" }
                  }}
                  className="absolute inset-0 rounded-full border-8 border-dashed shadow-[0_0_60px_rgba(239,68,68,0.7)]"
                  style={{ borderColor: timeLeft <= 3 ? '#ff003c' : '#a855f7' }}
                />
                
                <div className="absolute inset-4 rounded-full bg-gradient-to-tr from-red-600/30 to-purple-600/30 blur-xl" />
                
                {/* Countdown Digit */}
                <div className="relative z-10 text-8xl md:text-9xl font-black text-white drop-shadow-[0_0_30px_rgba(255,255,255,0.9)]">
                  {timeLeft}
                </div>
              </div>
              
              <div className="mt-4 px-6 py-2 rounded-full border border-white/10 bg-black/50 text-cyan-300 font-mono text-sm uppercase tracking-widest">
                REFLEKS SÜRESİ: {room.overload_time_allowed?.toFixed(1)}S
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TVScaleFrame>
  );
}
