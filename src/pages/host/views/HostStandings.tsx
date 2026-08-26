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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="w-full max-w-5xl flex flex-col items-center py-6 h-full max-h-full overflow-hidden"
    >
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, type: "spring", stiffness: 100 }}
        className="w-full flex items-center justify-between px-8 py-6 bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-3xl mb-8 shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
      >
        <div className="flex items-center gap-4">
          <h2 className="text-3xl font-light text-white uppercase tracking-[0.2em]">
            {t("standings.title")}
          </h2>
        </div>
        <div className="flex items-center gap-4 border-l border-white/10 pl-6">
          <span className="text-white/40 text-sm tracking-widest uppercase">Round</span>
          <span className="text-white font-light text-3xl">
            {room?.current_round}
            <span className="text-white/20 mx-2">/</span>
            <span className="text-white/60">{room?.total_rounds}</span>
          </span>
        </div>
      </motion.div>

      <div className="flex-1 w-full flex flex-col overflow-y-auto pr-4 pb-10 space-y-4" style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.2) transparent" }}>
        {ranking.map((item, index) => {
          const isFirst = index === 0;

          // Apple/Tesla Premium Style
          let rowBg = "bg-white/[0.02] backdrop-blur-2xl border border-white/5 shadow-lg";
          let textStyle = "text-white/90";
          let scoreStyle = "text-white/80 font-light";
          let badgeBg = "bg-white/5 text-white/70";
          let rankText = "text-white/30";

          if (isFirst) {
            rowBg = "bg-white/[0.08] backdrop-blur-3xl border border-white/20 shadow-[0_0_40px_rgba(255,255,255,0.1)]";
            textStyle = "text-white font-medium";
            scoreStyle = "text-white font-normal";
            badgeBg = "bg-white/20 text-white font-medium";
            rankText = "text-white/80";
          }

          return (
            <motion.div
              key={item.id}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 + index * 0.05, type: "spring", stiffness: 100 }}
              className={`relative w-full flex items-center h-20 overflow-hidden rounded-2xl transition-all duration-500 hover:bg-white/[0.06] hover:scale-[1.01] ${rowBg}`}
            >
              {/* Rank Column */}
              <div className={`w-20 h-full flex items-center justify-center border-r border-white/5`}>
                 <span className={`text-3xl font-light tracking-tighter ${rankText}`}>
                   {index + 1}
                 </span>
              </div>

              {/* Avatar/Badge */}
              <div className="w-20 h-full flex items-center justify-center border-r border-white/5">
                <div className={`w-12 h-12 flex items-center justify-center rounded-full text-sm tracking-widest ${badgeBg}`}>
                  {upperTL(item.name.substring(0, 3))}
                </div>
              </div>

              {/* Name Column */}
              <div className="flex-1 flex flex-col justify-center px-6 h-full">
                <div className="flex items-center gap-4">
                  <h3 className={`text-2xl tracking-widest uppercase ${textStyle}`}>
                    {item.name}
                  </h3>
                  {item.roundScore > 0 && (
                    <motion.span 
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.0 + index * 0.1 }}
                      className="text-sm font-medium text-white/80 bg-white/10 px-3 py-1 rounded-full border border-white/20"
                    >
                      +{item.roundScore}
                    </motion.span>
                  )}
                </div>
              </div>

              {/* Score Column */}
              <div className={`w-40 h-full flex items-center justify-center border-l border-white/5`}>
                <div className={`text-4xl tracking-tighter ${scoreStyle}`}>
                  <AnimatedCounter
                    from={item.score - item.roundScore}
                    to={item.score}
                    delay={0.8}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.button
        onClick={onNextStep}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="mt-6 w-full max-w-sm py-5 bg-white text-black hover:bg-gray-100 rounded-full font-medium uppercase tracking-[0.2em] text-lg shadow-[0_0_30px_rgba(255,255,255,0.2)] transition-all"
      >
        {room?.current_round === room?.total_rounds ? t("standings.finishGame") : t("standings.nextRound")}
      </motion.button>
    </motion.div>
  );
}
