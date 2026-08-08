import { motion } from "framer-motion";
import type { Player } from "../../../types/database";

interface PlayerStandingsProps {
  currentPlayer: Player | null;
}

export function PlayerStandings({ currentPlayer }: PlayerStandingsProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center justify-center min-h-screen p-8 text-center bg-black"
    >
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="w-full max-w-sm"
      >
        <div className="w-16 h-16 border-2 border-white/20 border-t-white animate-spin mx-auto mb-8 rounded-none" />
        
        <h2 className="text-2xl font-light text-white tracking-[0.3em] mb-4">
          İSTATİSTİKLER
        </h2>

        {currentPlayer && (
          <div className="my-10 bg-zinc-900 border border-zinc-800 p-8 shadow-2xl relative overflow-hidden">
            {/* Geometric accents */}
            <div className="absolute top-0 left-0 w-2 h-2 bg-white" />
            <div className="absolute bottom-0 right-0 w-2 h-2 bg-white" />
            
            <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.4em] mb-4">
              TOTAL SCORE
            </p>
            <p className="text-6xl font-light text-white tracking-tighter">
              {currentPlayer.total_score}
            </p>
          </div>
        )}
        
        <p className="text-zinc-500 font-light text-xs tracking-widest uppercase">
          LÜTFEN ANA EKRANI TAKİP EDİNİZ.
        </p>
      </motion.div>
    </motion.div>
  );
}
