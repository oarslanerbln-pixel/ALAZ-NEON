import { useEffect } from "react";
import { motion, animate, useMotionValue, useTransform } from "framer-motion";
import { useLocale } from "../../../hooks/useLocale";
import type { Player, RoundResultInfo, Room } from "../../../types/database";

interface HostStandingsProps {
  room: Room | null;
  players: Player[];
  roundResults: RoundResultInfo[];
  onNextStep: () => void;
}
function AnimatedCounter({ from, to, delay }: { from: number; to: number; delay: number }) {
  const count = useMotionValue(from);
  const rounded = useTransform(count, (latest) => Math.round(latest));

  useEffect(() => {
    const controls = animate(count, to, { duration: 1.5, delay, ease: "easeOut" });
    return controls.stop;
  }, [count, from, to, delay]);

  return <motion.span>{rounded}</motion.span>;
}

export function HostStandings({
  room,
  players,
  roundResults,
  onNextStep,
}: HostStandingsProps) {
  const { t } = useLocale();

  // Calculate current rankings
  // If team mode, group by team
  type RankingItem = { name: string; score: number; roundScore: number };
  let ranking: RankingItem[] = [];

  if (room?.game_mode === "team") {
    const teams: Record<string, { score: number; roundScore: number }> = {};
    players.forEach((p) => {
      const tName = p.team_name || t("podium.individual");
      if (!teams[tName]) teams[tName] = { score: 0, roundScore: 0 };
      teams[tName].score += p.total_score;
      
      const res = roundResults.find((r) => r.playerId === p.id);
      if (res) {
        teams[tName].roundScore += res.roundScore;
      }
    });
    ranking = Object.entries(teams)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.score - a.score);
  } else {
    ranking = [...players]
      .sort((a, b) => b.total_score - a.total_score)
      .map((p) => {
        const res = roundResults.find((r) => r.playerId === p.id);
        return {
          name: p.nickname,
          score: p.total_score,
          roundScore: res ? res.roundScore : 0,
        };
      });
  }

  // Find max score for bar width calculation
  const maxScore = Math.max(...ranking.map((r) => r.score), 1);

  return (
    <motion.div
      key="standings"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      className="w-full max-w-4xl flex flex-col items-center py-10 h-full overflow-hidden"
    >
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="mb-8 text-center"
      >
        <h2 className="text-4xl font-black text-white uppercase tracking-[0.2em] mb-2 font-mono">
          {t("standings.title")}
        </h2>
        <p className="text-alaz-orange font-bold uppercase tracking-widest text-sm animate-pulse">
          Round {room?.current_round} / {room?.total_rounds}
        </p>
      </motion.div>

      <div className="flex-1 w-full flex flex-col gap-4 overflow-y-auto pr-4 cyber-scrollbar">
        {ranking.map((item, index) => {
          const widthPercent = (item.score / maxScore) * 100;
          return (
            <motion.div
              key={item.name}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 + index * 0.1, type: "spring" }}
              className="relative w-full bg-black/60 border-[0.5px] border-white/10 p-6 flex items-center group overflow-hidden rounded-none shadow-[0_5px_20px_rgba(0,0,0,0.5)]"
            >
              {/* Background Bar */}
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${widthPercent}%` }}
                transition={{ delay: 0.8 + index * 0.1, duration: 1, ease: "easeOut" }}
                className="absolute left-0 top-0 bottom-0 bg-alaz-orange/20 border-r-4 border-alaz-orange -z-10"
              />
              
              <div className="w-12 text-3xl font-black text-white/20 font-mono">
                {index + 1}
              </div>
              
              <div className="flex-1 text-2xl font-black text-white truncate pl-2">
                {item.name}
              </div>
              
              <div className="flex flex-col items-end">
                <div className="text-3xl font-black text-glow-alaz text-alaz-orange font-mono">
                  <AnimatedCounter from={item.score - item.roundScore} to={item.score} delay={1.5 + index * 0.1} />
                </div>
                {item.roundScore > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.5 + index * 0.1 }}
                    className="text-hacker-green font-bold text-xs uppercase tracking-widest font-mono"
                  >
                    +{item.roundScore} pts
                  </motion.div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.button
        onClick={onNextStep}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="mt-8 px-12 py-6 bg-alaz-orange text-black hover:bg-white hover:text-black font-black uppercase tracking-[0.2em] rounded-none transition-all shadow-[0_0_40px_rgba(255,77,0,0.4)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] cursor-pointer text-2xl"
      >
        {room?.current_round === room?.total_rounds ? "FINISH GAME" : "NEXT ROUND"}
      </motion.button>
    </motion.div>
  );
}
