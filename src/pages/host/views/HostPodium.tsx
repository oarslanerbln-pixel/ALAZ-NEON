import { useEffect } from "react";
import { motion } from "framer-motion";
import { NeonIcon } from "../../../components/NeonIcon";
import { useLocale } from "../../../hooks/useLocale";
import { ShareableRecapCard } from "../components/ShareableRecapCard";
import { SoundManager, sounds } from "../../../lib/audio";
import type { Player } from "../../../types/database";
import type { JulesAward } from "../../../lib/intelligence";

interface HostPodiumProps {
  room: {
    game_mode: "individual" | "team";
    code?: string;
  } | null;
  players: Player[];
  playerStats: Record<
    string,
    { uniqueCount: number; earlyCount: number; blankCount: number }
  >;
  awards?: { creative: JulesAward | null; funny: JulesAward | null };
  onResetGame: () => void;
}

export function HostPodium({
  room,
  players,
  playerStats,
  awards,
  onResetGame,
}: HostPodiumProps) {
  const { t } = useLocale();

  useEffect(() => {
    // Play celebratory fanfare timed with 1st place rising
    const timer = setTimeout(() => {
      SoundManager.getInstance().playSFX(sounds.FANFARE, 0.7);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);
  const getWinner = (key: "uniqueCount" | "earlyCount" | "blankCount") => {
    let max = 0;
    let pid = "";
    Object.entries(playerStats).forEach(([id, stats]) => {
      const val = Reflect.get(stats, key) as number;
      if (val > max) {
        max = val;
        pid = id;
      }
    });
    const p = players.find((x) => x.id === pid);
    return max > 0 && p ? { name: p.nickname, count: max } : null;
  };

  const uniqueW = getWinner("uniqueCount");
  const earlyW = getWinner("earlyCount");
  const blankW = getWinner("blankCount");

  type RankingItem = { name: string; score: number };
  let ranking: RankingItem[] = [];

  if (room?.game_mode === "team") {
    const teams: Record<string, number> = {};
    players.forEach((p) => {
      const t2 = p.team_name || t("podium.individual");
      teams[t2] = (teams[t2] || 0) + p.total_score;
    });
    ranking = Object.entries(teams)
      .map(([name, score]) => ({ name, score }))
      .sort((a, b) => b.score - a.score);
  } else {
    ranking = [...players]
      .sort((a, b) => b.total_score - a.total_score)
      .map((p) => ({ name: p.nickname, score: p.total_score }));
  }

  const first = ranking[0];
  const second = ranking[1];
  const third = ranking[2];

  return (
    <motion.div
      key="finished"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center min-h-full w-full py-20 overflow-y-auto"
    >
      <motion.h2
        initial={{ y: -50, opacity: 0, scale: 0.8 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, type: "spring" }}
        className="text-4xl md:text-6xl lg:text-7xl font-black text-white mb-20 uppercase tracking-[0.2em] text-glow-ultra-alaz"
      >
        {t("podium.title")}
      </motion.h2>

      <div className="flex items-end justify-center w-full max-w-4xl gap-4 h-[450px] border-b-2 border-white/10 relative">
        <div className="absolute inset-0 bg-gradient-to-t from-alaz-orange/5 to-transparent pointer-events-none" />

        {/* 2nd Place */}
        {second && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "60%" }}
            transition={{ delay: 1, duration: 1 }}
            className="w-64 bg-white/10 border-2 border-white/20 rounded-t-sm flex flex-col items-center justify-start pt-8 relative group"
          >
            <div className="absolute -top-16 text-center w-full">
              <div className="text-4xl font-black text-white truncate max-w-[240px] px-2 mx-auto">
                {second.name}
              </div>
              <div className="text-2xl font-black text-gray-400">
                {second.score} PTS
              </div>
            </div>
            <div className="text-4xl md:text-6xl font-black text-white/20">2</div>
          </motion.div>
        )}

        {/* 1st Place */}
        {first && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "80%" }}
            transition={{ delay: 1.5, duration: 1, type: "spring" }}
            className="w-72 bg-gradient-to-b from-alaz-orange/40 to-alaz-orange/5 border-4 border-alaz-orange rounded-t-sm flex flex-col items-center justify-start pt-8 relative z-10 shadow-[0_-20px_80px_rgba(255,77,0,0.3)]"
          >
            <div className="absolute -top-24 text-center w-full">
              <NeonIcon
                type="crown"
                color="orange"
                className="w-12 h-12 mx-auto mb-2 animate-beat drop-shadow-[0_0_20px_rgba(255,77,0,1)]"
              />
              <div className="text-3xl md:text-5xl font-black text-glow-alaz text-alaz-orange truncate max-w-[280px] px-2 mx-auto">
                {first.name}
              </div>
              <div className="text-3xl font-black text-white">
                {first.score} PTS
              </div>
            </div>
            <div className="text-5xl md:text-7xl lg:text-8xl font-black text-alaz-orange/40 mt-4">
              1
            </div>
          </motion.div>
        )}

        {/* 3rd Place */}
        {third && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: "40%" }}
            transition={{ delay: 0.5, duration: 1 }}
            className="w-64 bg-white/5 border border-white/10 rounded-t-sm flex flex-col items-center justify-start pt-8 relative"
          >
            <div className="absolute -top-16 text-center w-full">
              <div className="text-3xl font-black text-white truncate max-w-[240px] px-2 mx-auto">
                {third.name}
              </div>
              <div className="text-xl font-black text-gray-500">
                {third.score} PTS
              </div>
            </div>
            <div className="text-3xl md:text-5xl font-black text-white/10">3</div>
          </motion.div>
        )}

      </div>

      {/* RECAP CARD MOVED OUT OF PODIUM TO PREVENT OVERLAP */}
      {awards && (awards.creative || awards.funny) && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2 }}
          className="mt-12 w-full max-w-md flex justify-center"
        >
          <ShareableRecapCard awards={awards} roomCode={room?.code} />
        </motion.div>
      )}

      {/* OYUNUN ENLERI (AWARDS) */}
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.5, duration: 1 }}
        className="mt-12 w-full max-w-5xl"
      >
        <h3 className="text-center text-sm font-black text-gray-500 uppercase tracking-widest mb-6">
          {t("podium.awardsTitle")}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Mitik Yaratıcı */}
          <div className="glass-panel-alaz rounded-sm p-6 flex flex-col items-center justify-center text-center border-alaz-orange/30 group hover:border-alaz-orange transition-all">
            <div className="w-16 h-16 rounded-sm bg-alaz-orange/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(255,77,0,0.3)]">
              <NeonIcon type="lightbulb" color="orange" className="w-8 h-8" />
            </div>
            <h4 className="text-alaz-orange font-black text-lg uppercase tracking-tight mb-1">
              {t("podium.creativeTitle")}
            </h4>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">
              {t("podium.creativeDesc")}
            </p>
            {uniqueW ? (
              <>
                <div className="text-2xl font-black text-white truncate w-full px-2 mx-auto">
                  {uniqueW.name}
                </div>
                <div className="text-alaz-orange font-bold text-sm mt-1">
                  {uniqueW.count} {t("podium.creativeCount")}
                </div>
              </>
            ) : (
              <div className="text-gray-600 font-bold italic">
                {t("podium.creativeNone")}
              </div>
            )}
          </div>

          {/* Ateşin Oğlu */}
          <div className="glass-panel-pulse-blue rounded-sm p-6 flex flex-col items-center justify-center text-center border-neon-blue/30 group hover:border-neon-blue transition-all">
            <div className="w-16 h-16 rounded-sm bg-neon-blue/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(0,255,255,0.3)]">
              <NeonIcon type="rocket" color="blue" className="w-8 h-8" />
            </div>
            <h4 className="text-neon-blue font-black text-lg uppercase tracking-tight mb-1">
              {t("podium.speedTitle")}
            </h4>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">
              {t("podium.speedDesc")}
            </p>
            {earlyW ? (
              <>
                <div className="text-2xl font-black text-white truncate w-full px-2 mx-auto">
                  {earlyW.name}
                </div>
                <div className="text-neon-blue font-bold text-sm mt-1">
                  {earlyW.count} {t("podium.speedCount")}
                </div>
              </>
            ) : (
              <div className="text-gray-600 font-bold italic">
                {t("podium.speedNone")}
              </div>
            )}
          </div>

          {/* Hayalet */}
          <div className="bg-white/5 border border-white/10 rounded-sm p-6 flex flex-col items-center justify-center text-center group hover:bg-white/10 transition-all">
            <div className="w-16 h-16 rounded-sm bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform text-3xl">
              👻
            </div>
            <h4 className="text-gray-300 font-black text-lg uppercase tracking-tight mb-1">
              {t("podium.ghostTitle")}
            </h4>
            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-4">
              {t("podium.ghostDesc")}
            </p>
            {blankW ? (
              <>
                <div className="text-2xl font-black text-gray-300 truncate w-full px-2 mx-auto">
                  {blankW.name}
                </div>
                <div className="text-gray-500 font-bold text-sm mt-1">
                  {blankW.count} {t("podium.ghostCount")}
                </div>
              </>
            ) : (
              <div className="text-green-500/50 font-bold italic">
                {t("podium.ghostNone")}
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <motion.button
        onClick={onResetGame}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 4 }}
        className="mt-16 px-12 py-4 border-2 border-white/20 hover:border-white/50 text-white font-black rounded-sm transition-all uppercase tracking-widest hover:bg-white/5 relative z-20 mb-20"
      >
        {t("podium.newGame")}
      </motion.button>
    </motion.div>
  );
}
