import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Room, Player } from "../../../types/database";
import { KineticSpark } from "../../../components/KineticSpark";
import { useLocale } from "../../../hooks/useLocale";

interface Props {
  room: Room;
  players: Player[];
  updateRoomStatus: (status: Room["status"], updates?: Partial<Room>) => Promise<void>;
}

export function HostPulseDisplay({ room, players, updateRoomStatus }: Props) {
  
  const [timeLeft, setTimeLeft] = useState(10);
  const [scale, setScale] = useState(1);
  const [isExploding, setIsExploding] = useState(false);

  // State Management
  useEffect(() => {
    if (room.status === "lobby" || room.status === "pulse_intro") {
      updateRoomStatus("pulse_active", { 
        pulse_target_time: Date.now() + 10000, 
        pulse_clicks: {} 
      });
    }
  }, [room.status, updateRoomStatus]);

  // Active Timer
  useEffect(() => {
    if (room.status === "pulse_active" && room.pulse_target_time) {
      const interval = setInterval(() => {
        const now = Date.now();
        const diff = room.pulse_target_time! - now;
        
        if (diff <= 0) {
          clearInterval(interval);
          setIsExploding(true);
          setTimeLeft(0);
          
          // Wait 2 seconds for late clicks to arrive then reveal
          setTimeout(() => {
            updateRoomStatus("pulse_reveal");
          }, 2000);
        } else {
          setTimeLeft(Math.ceil(diff / 1000));
          // Scale pulsing effect based on closeness to target
          const progress = 1 - (diff / 10000);
          setScale(1 + (progress * 1.5));
        }
      }, 50);

      return () => clearInterval(interval);
    }
  }, [room.status, room.pulse_target_time, updateRoomStatus]);

  // Calculate Result
  const syncResult = useMemo(() => {
    if (room.status !== "pulse_reveal" || !room.pulse_target_time) return null;
    
    const clicks = Object.values(room.pulse_clicks || {});
    if (clicks.length === 0) return { success: false, avgDiff: 9999, participation: 0 };

    let totalDiff = 0;
    clicks.forEach((clickTime: number) => {
      totalDiff += Math.abs(clickTime - room.pulse_target_time!);
    });

    const avgDiff = totalDiff / clicks.length;
    const participation = (clicks.length / players.length) * 100;
    
    // Success criteria: Average diff < 500ms and participation > 50%
    const success = avgDiff < 500 && participation >= 50;

    return { success, avgDiff, participation };
  }, [room.status, room.pulse_clicks, room.pulse_target_time, players.length]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-12 bg-black relative overflow-hidden min-h-screen">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,243,255,0.1)_0%,rgba(0,0,0,1)_80%)]" />
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />

      {room.status === "pulse_active" && (
        <>
          <div className="absolute top-16 text-center z-20">
            <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-[0.5em] mb-4">
              PULSE: Senkronizasyon
            </h2>
            <p className="text-neon-blue font-bold uppercase tracking-widest animate-pulse">
              Çekirdek patladığı an butona basın!
            </p>
          </div>

          <div className="relative flex items-center justify-center w-full h-full z-10 perspective-[1000px]">
            {isExploding ? (
              <div className="w-64 h-64 rounded-full bg-white animate-ping" />
            ) : (
              <motion.div
                animate={{ scale: [scale, scale * 1.1, scale] }}
                transition={{ duration: Math.max(0.2, timeLeft / 10), repeat: Infinity, ease: "easeInOut" }}
                className="w-48 h-48 rounded-full bg-neon-blue/20 border-4 border-neon-blue shadow-[0_0_100px_rgba(0,243,255,0.5)] flex items-center justify-center relative"
              >
                <div className="absolute inset-0 bg-white/10 rounded-full animate-ping" />
                <span className="text-5xl font-black text-white mix-blend-overlay">
                  {timeLeft}
                </span>
              </motion.div>
            )}
          </div>
        </>
      )}

      {room.status === "pulse_reveal" && syncResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative z-20 text-center flex flex-col items-center"
        >
          {syncResult.success ? (
            <>
              <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-neon-blue uppercase tracking-widest drop-shadow-[0_0_50px_rgba(0,243,255,0.6)] mb-6">
                KUSURSUZ!
              </h1>
              <p className="text-white/70 text-xl uppercase tracking-[0.4em] font-medium mb-12">
                Mükemmel Uyum Sağlandı
              </p>
            </>
          ) : (
            <>
              <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-[#ff003c] uppercase tracking-widest drop-shadow-[0_0_50px_rgba(255,0,60,0.6)] mb-6">
                ÇATLADI!
              </h1>
              <p className="text-white/70 text-xl uppercase tracking-[0.4em] font-medium mb-12">
                Senkronizasyon Başarısız
              </p>
            </>
          )}

          <div className="flex gap-12 bg-white/[0.03] border border-white/10 p-8 rounded-3xl backdrop-blur-md">
            <div>
              <p className="text-white/30 text-xs uppercase tracking-widest mb-2">Ortalama Hata</p>
              <p className={`text-3xl font-black ${syncResult.success ? 'text-neon-blue' : 'text-[#ff003c]'}`}>
                {syncResult.avgDiff === 9999 ? "Yok" : `${Math.round(syncResult.avgDiff)}ms`}
              </p>
            </div>
            <div>
              <p className="text-white/30 text-xs uppercase tracking-widest mb-2">Katılım</p>
              <p className="text-3xl font-black text-white">
                %{Math.round(syncResult.participation)}
              </p>
            </div>
          </div>

          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            onClick={() => updateRoomStatus("lobby", { active_game: "none" })}
            className="mt-16 px-12 py-4 bg-white/5 border border-white/20 text-white/70 rounded-full uppercase tracking-[0.3em] font-bold hover:bg-white/10 hover:text-white transition-all"
          >
            Lobiye Dön
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
