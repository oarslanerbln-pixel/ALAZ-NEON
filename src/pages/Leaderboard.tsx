import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useLocale } from "../hooks/useLocale";
import { upperTL } from "../lib/stringUtils";
import { useTopPlayers, type LeaderboardRange } from "../hooks/useTopPlayers";
import { getLeagueFromScore } from "../lib/league";

/**
 * HEGAME League sıralama sayfası — gerçek oyuncu verilerinden
 * lig seviyeleri ve rozetleriyle kümülatif skorları listeler.
 */
export function Leaderboard() {
  const navigate = useNavigate();
  const { t } = useLocale();
  const [range, setRange] = useState<LeaderboardRange>("week");
  const { players: leaderboardData, loading } = useTopPlayers(range, 10);

  return (
    <div className="min-h-screen bg-black text-white p-8 font-inter relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-alaz-orange/10 blur-[150px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-neon-blue/10 blur-[150px] rounded-full" />
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        <header className="flex justify-between items-center mb-12">
          <motion.button
            whileHover={{ x: -5 }}
            onClick={() => navigate("/")}
            className="text-gray-500 font-black uppercase tracking-widest text-xs flex items-center gap-2 hover:text-white transition-colors"
          >
            {t("leaderboard.back")}
          </motion.button>
          
          <div className="flex gap-4">
            <button
              onClick={() => setRange("week")}
              className={`px-4 py-2 rounded-full bg-white/5 border text-[10px] font-black uppercase tracking-widest transition-colors ${
                range === "week"
                  ? "border-white/10 text-alaz-orange shadow-[0_0_15px_rgba(255,77,0,0.2)]"
                  : "border-white/10 text-gray-500 hover:text-white"
              }`}
            >
              {t("leaderboard.thisWeek")}
            </button>
            <button
              onClick={() => setRange("all")}
              className={`px-4 py-2 rounded-full bg-white/5 border text-[10px] font-black uppercase tracking-widest transition-colors ${
                range === "all"
                  ? "border-white/10 text-alaz-orange shadow-[0_0_15px_rgba(255,77,0,0.2)]"
                  : "border-white/10 text-gray-500 hover:text-white"
              }`}
            >
              {t("leaderboard.allTime")}
            </button>
          </div>
        </header>

        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-block px-4 py-1.5 rounded-full bg-alaz-orange/10 border border-alaz-orange/30 text-alaz-orange text-[11px] font-black tracking-widest uppercase mb-4 shadow-[0_0_20px_rgba(255,85,0,0.2)]"
          >
            ⚡ HEGAME LEAGUE ⚡
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl lg:text-7xl font-black italic tracking-tighter text-glow-ultra-alaz mb-4"
          >
            {t("leaderboard.title")}
          </motion.h1>
          <p className="text-gray-500 font-black uppercase tracking-[0.5em] text-sm">
            {t("leaderboard.subtitle")}
          </p>
        </div>

        <div className="space-y-3">
          {/* Header */}
          <div className="grid grid-cols-12 px-8 py-4 text-[10px] font-black text-gray-600 uppercase tracking-widest">
            <div className="col-span-1">{t("leaderboard.rank")}</div>
            <div className="col-span-7">{t("leaderboard.player")}</div>
            <div className="col-span-4 text-right">
              {t("leaderboard.score")}
            </div>
          </div>

          {loading && (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-2 border-alaz-orange border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {!loading && leaderboardData.length === 0 && (
            <div className="text-center py-16">
              <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">
                {t("leaderboard.empty")}
              </p>
            </div>
          )}

          {/* Rows */}
          {!loading && leaderboardData.map((player, index) => {
            const isFirst = player.rank === 1;
            const isSecond = player.rank === 2;
            const isThird = player.rank === 3;
            const league = getLeagueFromScore(player.score);
            
            let rowBg = "bg-white/5 border-white/5 hover:border-white/20";
            let rankColor = "text-gray-500";
            let avatarBg = "bg-white/10 text-white";
            let scoreColor = "text-gray-400";
            let shadowClass = "";

            if (isFirst) {
              rowBg = "bg-alaz-orange/10 border-alaz-orange/40 backdrop-blur-md";
              rankColor = "text-alaz-orange drop-shadow-[0_0_10px_rgba(255,85,0,0.8)]";
              avatarBg = "bg-gradient-to-br from-alaz-orange to-yellow-500 text-black";
              scoreColor = "text-transparent bg-clip-text bg-gradient-to-r from-alaz-orange to-yellow-500 drop-shadow-[0_0_10px_rgba(255,85,0,0.5)]";
              shadowClass = "shadow-[0_0_30px_rgba(255,85,0,0.2)]";
            } else if (isSecond) {
              rowBg = "bg-gray-400/10 border-gray-400/30 backdrop-blur-sm";
              rankColor = "text-gray-300 drop-shadow-[0_0_5px_rgba(209,213,219,0.5)]";
              avatarBg = "bg-gradient-to-br from-gray-300 to-gray-500 text-black";
              scoreColor = "text-gray-200";
            } else if (isThird) {
              rowBg = "bg-orange-900/20 border-orange-700/30 backdrop-blur-sm";
              rankColor = "text-orange-500 drop-shadow-[0_0_5px_rgba(249,115,22,0.5)]";
              avatarBg = "bg-gradient-to-br from-orange-400 to-orange-700 text-white";
              scoreColor = "text-orange-300";
            }

            return (
              <motion.div
                key={player.rank}
                initial={{ opacity: 0, x: -30 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, type: "spring", stiffness: 100 }}
                className={`grid grid-cols-12 items-center px-8 py-6 rounded-2xl border transition-all duration-300 group hover:scale-[1.01] ${rowBg} ${shadowClass}`}
              >
                <div className={`col-span-1 text-3xl font-black italic ${rankColor}`}>
                  #{player.rank}
                </div>
                <div className="col-span-7 flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black shadow-lg ${avatarBg}`}>
                    {upperTL(player.name[0])}
                  </div>
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-black text-white tracking-wide group-hover:text-alaz-orange transition-colors">
                        {player.name}
                      </span>
                      <span
                        className="text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1"
                        style={{
                          backgroundColor: `${league.color}20`,
                          color: league.color,
                          border: `1px solid ${league.color}40`,
                        }}
                      >
                        <span>{league.badge}</span>
                        <span>{league.title}</span>
                      </span>
                    </div>
                  </div>
                </div>
                <div className={`col-span-4 text-right text-4xl font-black tracking-tighter ${scoreColor}`}>
                  {player.score.toLocaleString()} <span className="text-xs text-gray-500 font-bold uppercase ml-1">XP</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
