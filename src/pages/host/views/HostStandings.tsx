import { useEffect } from "react";
import { motion, animate, useMotionValue, useTransform } from "framer-motion";
import { useLocale } from "../../../hooks/useLocale";
import { upperTL } from "../../../lib/stringUtils";
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
  // `id` is a stable React key: nicknames aren't guaranteed unique (nothing
  // stops two players joining with the same name), so keying rows by name
  // alone could mix up which row owns which animation/identity on re-render.
  type RankingItem = { id: string; name: string; score: number; roundScore: number };
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
      .map(([name, data]) => ({ id: name, name, ...data }))
      .sort((a, b) => b.score - a.score);
  } else {
    ranking = [...players]
      .sort((a, b) => b.total_score - a.total_score)
      .map((p) => {
        const res = roundResults.find((r) => r.playerId === p.id);
        return {
          id: p.id,
          name: p.nickname,
          score: p.total_score,
          roundScore: res ? res.roundScore : 0,
        };
      });
  }


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
        transition={{ delay: 0.1 }}
        className="w-full flex items-center justify-between px-6 py-4 bg-black/80 backdrop-blur-xl border border-white/20 mb-6 shadow-2xl"
      >
        <div className="flex items-center gap-4">
          <div className="w-2 h-8 bg-alaz-orange"></div>
          <h2 className="text-3xl font-black text-white uppercase tracking-[0.3em] font-mono">
            {t("standings.title")}
          </h2>
        </div>
        <div className="flex items-center gap-4 border-l border-white/20 pl-6">
          <span className="text-white/50 text-sm tracking-widest uppercase">Round</span>
          <span className="text-alaz-orange font-mono font-black text-2xl">
            {room?.current_round}
            <span className="text-white/30 mx-1">/</span>
            <span className="text-white/80">{room?.total_rounds}</span>
          </span>
        </div>
      </motion.div>

      <div className="flex-1 w-full flex flex-col overflow-y-auto cyber-scrollbar pr-2">
        {ranking.map((item, index) => {
          const isFirst = index === 0;

          // EA Sports Broadcast Style
          let rowBg = "bg-black/60 backdrop-blur-xl border-l-4 border-l-white/10 border-y border-y-white/5";
          let textStyle = "text-white";
          let scoreStyle = "text-white";
          let badgeBg = "bg-white/10";
          let rankText = "text-white/50";

          if (isFirst) {
            rowBg = "bg-black/80 backdrop-blur-xl border-l-[6px] border-l-alaz-orange border-y border-y-white/20";
            textStyle = "text-white font-black drop-shadow-md";
            scoreStyle = "text-alaz-orange drop-shadow-[0_0_10px_rgba(255,85,0,0.8)]";
            badgeBg = "bg-alaz-orange text-black font-black";
            rankText = "text-alaz-orange drop-shadow-md";
          }

          return (
            <motion.div
              key={item.id}
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 + index * 0.1, type: "tween", ease: "easeOut", duration: 0.4 }}
              className={`relative w-full flex items-center h-20 overflow-hidden mb-2 shadow-2xl transition-all duration-300 hover:bg-white/5 ${rowBg}`}
            >
              {/* Rank Column */}
              <div className={`w-16 h-full flex items-center justify-center border-r border-white/10 bg-black/40`}>
                 <span className={`text-2xl font-mono font-bold tracking-tighter italic ${rankText}`}>
                   {index + 1}
                 </span>
              </div>

              {/* Avatar/Badge */}
              <div className="w-20 h-full flex items-center justify-center border-r border-white/10">
                <div className={`w-10 h-10 flex items-center justify-center font-bold tracking-widest ${badgeBg}`}>
                  {upperTL(item.name.substring(0, 3))}
                </div>
              </div>

              {/* Name Column */}
              <div className="flex-1 flex flex-col justify-center px-6 border-r border-white/10 h-full">
                <div className="flex items-center gap-4">
                  <h3 className={`text-2xl tracking-[0.15em] uppercase ${textStyle}`}>
                    {item.name}
                  </h3>
                  {item.roundScore > 0 && (
                    <motion.span 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 1.5 + index * 0.1 }}
                      className="text-sm font-bold text-green-400 bg-green-400/10 px-2 py-1 rounded-sm border border-green-400/20"
                    >
                      +{item.roundScore}
                    </motion.span>
                  )}
                </div>
              </div>

              {/* Score Column */}
              <div className={`w-40 h-full flex items-center justify-center bg-black/50`}>
                <div className={`text-4xl font-mono font-black tracking-tighter ${scoreStyle}`}>
                  <AnimatedCounter
                    from={item.score - item.roundScore}
                    to={item.score}
                    delay={1.0}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.button
        onClick={onNextStep}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="mt-6 w-full max-w-sm py-4 bg-white text-black hover:bg-alaz-orange hover:text-white font-black uppercase tracking-[0.3em] text-xl transition-all border-b-4 border-black active:border-b-0 active:translate-y-1"
      >
        {room?.current_round === room?.total_rounds ? "FINISH GAME" : "NEXT ROUND"}
      </motion.button>
    </motion.div>
  );
}
