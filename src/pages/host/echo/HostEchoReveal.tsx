import { motion } from 'framer-motion';
import { useMemo, useEffect, useState } from "react";

import type { Room, Player } from "../../../types/database";
import { SoundManager, sounds } from "../../../lib/audio";

interface Props {
  room: Room;
  players: Player[];
  onFinish: () => void;
}

export function HostEchoReveal({ room, players, onFinish }: Props) {
  
  const [showWinner, setShowWinner] = useState(false);

  const topVotedPlayer = useMemo(() => {
    const counts: Record<string, number> = {};
    if (room.echo_votes) {
      Object.values(room.echo_votes).forEach((votedId: string) => {
        counts[votedId] = (counts[votedId] || 0) + 1;
      });
    }
    
    let maxVotes = 0;
    let winnerId: string | null = null;
    
    Object.entries(counts).forEach(([id, count]) => {
      if (count > maxVotes) {
        maxVotes = count;
        winnerId = id;
      }
    });

    return winnerId ? players.find(p => p.id === winnerId) : null;
  }, [room.echo_votes, players]);

  useEffect(() => {
    // Cinematic delay before revealing winner
    const timer = setTimeout(() => {
      setShowWinner(true);
      SoundManager.getInstance().playSFX(sounds.FAILURE);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-black relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,0,60,0.1)_0%,rgba(0,0,0,1)_70%)]" />
      <div className="absolute inset-0 bg-[url('/noise.png')] opacity-[0.03] mix-blend-overlay" />

      {!showWinner ? (
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="text-white/50 text-2xl font-black uppercase tracking-[1em]"
        >
          Hesaplanıyor...
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ type: "spring", bounce: 0.5, duration: 1.5 }}
          className="relative z-10 flex flex-col items-center"
        >
          <span className="text-white/50 uppercase tracking-[0.5em] text-xl font-bold mb-8">
            GÜNAH KEÇİSİ
          </span>
          {topVotedPlayer ? (
            <>
              <motion.h1 
                animate={{ x: [-10, 10, -10, 10, 0] }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-[#ff003c] uppercase tracking-widest drop-shadow-[0_0_50px_rgba(255,0,60,0.8)] mb-4"
              >
                {topVotedPlayer.nickname}
              </motion.h1>
              <p className="text-alaz-orange font-mono text-3xl mt-4 tracking-[0.2em] font-bold">
                {Object.values(room.echo_votes || {}).filter(v => v === topVotedPlayer.id).length} OY
              </p>
            </>
          ) : (
            <h1 className="text-5xl font-black text-white/50 uppercase tracking-widest">
              Hiç Oy Verilmedi
            </h1>
          )}
          
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 4 }}
            onClick={onFinish}
            className="mt-20 px-12 py-4 bg-white/5 border border-white/20 text-white/70 rounded-full uppercase tracking-[0.3em] font-bold hover:bg-white/10 hover:text-white transition-all"
          >
            Lobiye Dön
          </motion.button>
        </motion.div>
      )}
    </div>
  );
}
