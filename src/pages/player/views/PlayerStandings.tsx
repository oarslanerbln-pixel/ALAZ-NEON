import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { PlayerBackground } from "../../../components/PlayerBackground";
import { useLocale } from "../../../hooks/useLocale";
import type { Player } from "../../../types/database";
import { ConfettiCanvas } from "../../../components/ConfettiCanvas";

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
  const { t } = useLocale();
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
    if (rank === 1) return { emoji: "1", color: "text-white", border: "border-l-[6px] border-l-alaz-orange border-y border-y-white/10", bg: "bg-black/80 backdrop-blur-xl" };
    if (rank === 2) return { emoji: "2", color: "text-white/80", border: "border-l-4 border-l-gray-400 border-y border-y-white/10", bg: "bg-black/70 backdrop-blur-xl" };
    if (rank === 3) return { emoji: "3", color: "text-white/80", border: "border-l-4 border-l-orange-800 border-y border-y-white/10", bg: "bg-black/70 backdrop-blur-xl" };
    return { emoji: `${rank}`, color: "text-white/50", border: "border-l-4 border-l-white/10 border-y border-y-white/5", bg: "bg-black/60 backdrop-blur-xl" };
  };

  return (
    <motion.div
      key="standings"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10"
    >
      {myRank && myRank <= 3 && <ConfettiCanvas trigger={true} autoCannon={true} />}
      <PlayerBackground />
      {/* My Rank Card */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
        className="w-full max-w-sm mb-8"
      >
        {currentPlayer && myRank !== null ? (
          <div className="relative bg-black/80 backdrop-blur-xl border border-white/20 p-6 overflow-hidden shadow-2xl">
            {/* Corner accents */}
            <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-alaz-orange" />
            <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-alaz-orange" />

            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] text-white/50 font-mono uppercase tracking-[0.3em] mb-1">
                  {t("playerStandings.ranking")}
                </p>
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 300 }}
                  className="text-6xl font-black tracking-tighter"
                  style={{
                    color: myRank === 1 ? "#ff5500" : "#ffffff",
                    textShadow: myRank === 1 ? "0 0 20px rgba(255,85,0,0.5)" : "none"
                  }}
                >
                  #{myRank}
                </motion.div>
              </div>

              <div className="text-right border-l border-white/20 pl-6">
                <p className="text-[10px] text-white/50 font-mono uppercase tracking-[0.3em] mb-1">
                  {t("playerStandings.score")}
                </p>
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-4xl font-mono font-black text-white"
                >
                  {currentPlayer.total_score}
                </motion.span>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-8">
            <div className="w-10 h-10 border-2 border-white/20 border-t-alaz-orange animate-spin" />
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
            <p className="text-[10px] text-white/50 uppercase tracking-[0.4em] mb-4 font-mono text-left pl-2">
          {t("playerStandings.leaderboard")}
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
                  className={`flex items-center h-12 shadow-lg transition-all ${style.border} ${style.bg} ${
                    isMe ? "bg-white/10" : ""
                  }`}
                >
                  <div className={`w-10 h-full flex items-center justify-center border-r border-white/10 bg-black/40`}>
                    <span className={`text-sm font-mono font-bold tracking-tighter italic ${style.color}`}>
                      {style.emoji}
                    </span>
                  </div>
                  <span className={`flex-1 text-sm tracking-[0.1em] uppercase truncate text-left px-4 ${isMe ? "text-alaz-orange font-black" : "text-white font-bold"}`}>
                    {p.nickname}
                  </span>
                  <div className={`w-16 h-full flex items-center justify-center bg-black/50`}>
                    <span className={`text-sm font-mono font-black tabular-nums ${isMe ? "text-alaz-orange" : "text-white"}`}>
                      {p.total_score}
                    </span>
                  </div>
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
        {t("playerStandings.watchMainScreen")}
      </motion.p>
    </motion.div>
  );
}
