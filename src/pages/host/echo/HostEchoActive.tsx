import { useEffect, useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Room, Player } from "../../../types/database";
import { useLocale } from "../../../hooks/useLocale";

interface Props {
  room: Room;
  players: Player[];
  onNext: () => void;
}

export function HostEchoActive({ room, players, onNext }: Props) {
  
  const [timeLeft, setTimeLeft] = useState(20);

  useEffect(() => {
    if (room.round_end_time) {
      const updateTimer = () => {
        const remaining = Math.max(0, Math.floor((room.round_end_time! - Date.now()) / 1000));
        setTimeLeft(remaining);
        if (remaining === 0) {
          onNext();
        }
      };
      updateTimer();
      const interval = setInterval(updateTimer, 500);
      return () => clearInterval(interval);
    }
  }, [room.round_end_time, onNext]);

  const voteCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    players.forEach(p => counts[p.id] = 0);
    if (room.echo_votes) {
      Object.values(room.echo_votes).forEach((votedId: string) => {
        if (counts[votedId] !== undefined) {
          counts[votedId]++;
        }
      });
    }
    return counts;
  }, [room.echo_votes, players]);

  const totalVotes = Object.keys(room.echo_votes || {}).length;

  return (
    <div className="flex-1 flex flex-col items-center justify-start p-12 bg-black relative overflow-hidden min-h-screen">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,85,0,0.1)_0%,rgba(0,0,0,1)_80%)]" />
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />

      {/* Header */}
      <div className="relative z-10 text-center mb-16 mt-8">
        <h2 className="text-3xl md:text-5xl font-black text-white uppercase tracking-widest drop-shadow-[0_0_20px_rgba(255,255,255,0.2)] mb-4 max-w-5xl leading-tight">
          {room.echo_question}
        </h2>
        <div className="inline-flex items-center gap-4 bg-white/5 border border-white/10 px-8 py-3 rounded-full backdrop-blur-md">
          <span className="text-alaz-orange animate-pulse">●</span>
          <span className="text-white/80 font-mono text-2xl tracking-[0.3em] font-bold">
            00:{timeLeft.toString().padStart(2, "0")}
          </span>
        </div>
      </div>

      {/* Player Bars */}
      <div className="relative z-10 w-full max-w-6xl grid grid-cols-2 gap-x-12 gap-y-6">
        <AnimatePresence>
          {players.map(player => {
            const count = voteCounts[player.id] || 0;
            const percentage = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
            return (
              <motion.div
                key={player.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 flex flex-col gap-3 relative overflow-hidden backdrop-blur-sm"
              >
                <div className="flex justify-between items-center z-10">
                  <span className="text-white/90 font-bold uppercase tracking-widest text-lg">
                    {player.nickname}
                  </span>
                  <span className="text-white/40 font-black text-xl">
                    {count}
                  </span>
                </div>
                {/* Progress Bar Background */}
                <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden z-10">
                  <motion.div
                    className="h-full bg-gradient-to-r from-alaz-orange to-[#ff003c] rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ type: "spring", bounce: 0.2 }}
                  />
                </div>
                
                {/* Subtle highlight if they have votes */}
                {count > 0 && (
                  <motion.div
                    layoutId="highlight"
                    className="absolute inset-0 bg-white/[0.02] pointer-events-none"
                  />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
      
      {/* Total Votes Counter */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 text-center">
        <p className="text-white/30 uppercase tracking-[0.4em] text-xs font-bold mb-2">
          Kullanılan Oy
        </p>
        <p className="text-4xl font-black text-white/50 tracking-widest">
          {totalVotes} / {players.length}
        </p>
      </div>
    </div>
  );
}
