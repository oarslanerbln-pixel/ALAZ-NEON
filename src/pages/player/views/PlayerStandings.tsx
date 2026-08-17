import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { PlayerBackground } from "../../../components/PlayerBackground";
import type { Player } from "../../../types/database";

interface PlayerStandingsProps {
  currentPlayer: Player | null;
}

interface RankedPlayer {
  id: string;
  nickname: string;
  total_score: number;
  rank: number;
}

export function PlayerStandings({ currentPlayer }: PlayerStandingsProps) {
  const [rankedPlayers, setRankedPlayers] = useState<RankedPlayer[]>([]);
  const [myRank, setMyRank] = useState<number | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!currentPlayer?.room_id) return;

    const fetchRankings = async () => {
      try {
        const q = query(
          collection(db, "players"),
          where("room_id", "==", currentPlayer.room_id),
          orderBy("total_score", "desc")
        );
        const snap = await getDocs(q);
        const players: RankedPlayer[] = snap.docs.map((d, i) => ({
          id: d.id,
          nickname: d.data().nickname,
          total_score: d.data().total_score,
          rank: i + 1,
        }));
        setRankedPlayers(players.slice(0, 5)); // Top 5 göster
        const me = players.find((p) => p.id === currentPlayer.id);
        setMyRank(me?.rank ?? null);
        setLoaded(true);
      } catch {
        setLoaded(true);
      }
    };

    fetchRankings();
  }, [currentPlayer]);

  const rankLabel = (rank: number) => {
    if (rank === 1) return { emoji: "👑", color: "text-yellow-400", border: "border-yellow-500/50", bg: "bg-yellow-500/10" };
    if (rank === 2) return { emoji: "🥈", color: "text-zinc-300", border: "border-zinc-500/50", bg: "bg-zinc-500/10" };
    if (rank === 3) return { emoji: "🥉", color: "text-amber-600", border: "border-amber-600/50", bg: "bg-amber-600/10" };
    return { emoji: `${rank}.`, color: "text-zinc-500", border: "border-zinc-800", bg: "bg-transparent" };
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col items-center p-6 text-center min-h-[60vh] relative z-10"
    >
      <PlayerBackground />
      {/* My Rank Card */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        className="w-full max-w-sm mb-8"
      >
        {currentPlayer && myRank !== null ? (
          <div className="relative bg-zinc-900 border border-zinc-700 p-6 overflow-hidden">
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-alaz-orange" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-alaz-orange" />

            <p className="text-xs text-zinc-500 font-mono uppercase tracking-[0.4em] mb-2">
              SENİN SIRAN
            </p>

            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
              className="text-7xl font-black font-premium leading-none mb-2"
              style={{
                color: myRank === 1 ? "#fbbf24" : myRank <= 3 ? "#e5e7eb" : "#ffffff",
                textShadow: myRank === 1 ? "0 0 30px rgba(251,191,36,0.5)" : myRank <= 3 ? "0 0 20px rgba(255,255,255,0.2)" : "none"
              }}
            >
              {myRank === 1 ? "👑" : `#${myRank}`}
            </motion.div>

            <div className="flex items-baseline justify-center gap-2 mt-3">
              <span className="text-xs text-zinc-500 uppercase tracking-widest">TOPLAM</span>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="text-3xl font-black text-white font-premium"
              >
                {currentPlayer.total_score}
              </motion.span>
              <span className="text-xs text-zinc-500">puan</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-8">
            <div className="w-10 h-10 border-2 border-white/20 border-t-white animate-spin" />
          </div>
        )}
      </motion.div>

      {/* Mini Leaderboard */}
      <AnimatePresence>
        {loaded && rankedPlayers.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="w-full max-w-sm space-y-2"
          >
            <p className="text-xs text-zinc-500 uppercase tracking-[0.4em] mb-4 font-mono">
              ─ SIRALAMA ─
            </p>
            {rankedPlayers.map((p, i) => {
              const style = rankLabel(p.rank);
              const isMe = p.id === currentPlayer?.id;
              return (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.08 }}
                  className={`flex items-center gap-3 px-4 py-3 border transition-all ${style.border} ${style.bg} ${
                    isMe ? "ring-1 ring-alaz-orange/50 scale-[1.02]" : ""
                  }`}
                >
                  <span className={`text-base font-black w-6 text-center shrink-0 ${style.color}`}>
                    {style.emoji}
                  </span>
                  <span className={`flex-1 text-sm font-bold truncate text-left ${isMe ? "text-alaz-orange" : "text-white"}`}>
                    {p.nickname}
                    {isMe && <span className="text-xs text-alaz-orange/60 ml-1 uppercase">(sen)</span>}
                  </span>
                  <span className={`text-sm font-black tabular-nums ${isMe ? "text-alaz-orange" : "text-white/70"}`}>
                    {p.total_score}
                  </span>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.7, 0.4, 0.7] }}
        transition={{ delay: 1, duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className="mt-8 text-zinc-400 font-light text-sm tracking-widest uppercase text-center"
      >
        Lütfen ana ekranı takip ediniz.
      </motion.p>
    </motion.div>
  );
}
