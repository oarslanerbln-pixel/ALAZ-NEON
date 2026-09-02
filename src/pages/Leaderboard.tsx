import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useLocale } from "../hooks/useLocale";
import { upperTL } from "../lib/stringUtils";
import { useTopPlayers, type LeaderboardRange } from "../hooks/useTopPlayers";
import { getLeagueFromScore } from "../lib/league";
import { ArrowLeft, Crown, Trophy, Medal, Flame, Sparkles } from "lucide-react";
import { LanguageSwitcher } from "../components/LanguageSwitcher";

export function Leaderboard() {
  const navigate = useNavigate();
  const { t } = useLocale();
  const [range, setRange] = useState<LeaderboardRange>("week");
  const { players: leaderboardData, loading } = useTopPlayers(range, 10);

  const topThree = leaderboardData.slice(0, 3);
  const remainingPlayers = leaderboardData.slice(3);

  // Top 3 order for visual podium: #2 on left, #1 in center, #3 on right
  const rank1 = topThree.find((p) => p.rank === 1);
  const rank2 = topThree.find((p) => p.rank === 2);
  const rank3 = topThree.find((p) => p.rank === 3);

  return (
    <div className="min-h-screen bg-[#030307] text-white p-4 sm:p-8 md:p-12 font-sans relative overflow-x-hidden select-none">
      
      {/* Deep Obsidian Background & Atmospheric Gold Aura */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[10%] w-[650px] h-[650px] bg-gradient-to-b from-amber-600/15 via-alaz-orange/10 to-transparent blur-[160px] rounded-full" />
        <div className="absolute bottom-[-10%] left-[5%] w-[550px] h-[550px] bg-gradient-to-t from-cyan-600/10 via-blue-600/5 to-transparent blur-[160px] rounded-full" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:32px_32px] opacity-40" />
      </div>

      <div className="max-w-5xl mx-auto relative z-10">
        
        {/* ════════════════ TOP NAVIGATION BAR ════════════════ */}
        <header className="flex flex-wrap justify-between items-center gap-4 mb-8 sm:mb-12">
          <motion.button
            whileHover={{ x: -4, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/")}
            className="flex items-center gap-2.5 px-4 sm:px-5 py-2.5 bg-[#0e0e18]/90 border border-white/15 hover:border-amber-400/60 rounded-2xl transition-all text-white backdrop-blur-xl shadow-[0_4px_20px_rgba(0,0,0,0.5)] cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            <span className="text-[11px] sm:text-xs font-mono font-black uppercase tracking-[0.2em]">
              {t("leaderboard.back")}
            </span>
          </motion.button>
          
          <div className="flex items-center gap-3">
            {/* Range Toggle: DIESE WOCHE / EWIGE BESTENLISTE */}
            <div className="flex bg-[#0e0e18]/90 p-1 rounded-2xl border border-white/15 backdrop-blur-xl shadow-inner">
              <button
                onClick={() => setRange("week")}
                className={`px-4 sm:px-5 py-2 rounded-xl text-[10px] sm:text-xs font-mono font-black uppercase tracking-[0.18em] transition-all cursor-pointer ${
                  range === "week"
                    ? "bg-gradient-to-r from-amber-500 to-alaz-orange text-black font-black shadow-[0_2px_15px_rgba(255,136,0,0.4)]"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {t("leaderboard.thisWeek")}
              </button>
              <button
                onClick={() => setRange("all")}
                className={`px-4 sm:px-5 py-2 rounded-xl text-[10px] sm:text-xs font-mono font-black uppercase tracking-[0.18em] transition-all cursor-pointer ${
                  range === "all"
                    ? "bg-gradient-to-r from-amber-500 to-alaz-orange text-black font-black shadow-[0_2px_15px_rgba(255,136,0,0.4)]"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {t("leaderboard.allTime")}
              </button>
            </div>

            <LanguageSwitcher />
          </div>
        </header>

        {/* ════════════════ TITLE & HEADER ════════════════ */}
        <div className="text-center mb-10 sm:mb-14">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-[10px] sm:text-xs font-mono font-black tracking-[0.25em] uppercase mb-4 shadow-[0_0_20px_rgba(245,158,11,0.15)]"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>{t("leaderboard.league")}</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-white font-sans drop-shadow-[0_2px_20px_rgba(0,0,0,0.8)]"
          >
            {t("leaderboard.title")}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-gray-400 font-mono font-semibold uppercase tracking-[0.25em] text-xs sm:text-sm mt-2 max-w-xl mx-auto"
          >
            {t("leaderboard.subtitle")}
          </motion.p>
        </div>

        {/* ════════════════ LOADING & EMPTY STATES ════════════════ */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <div className="w-10 h-10 border-3 border-amber-400 border-t-transparent rounded-full animate-spin shadow-[0_0_20px_rgba(251,191,36,0.4)]" />
            <span className="text-xs font-mono font-bold tracking-widest text-amber-300 uppercase">
              DATEN WERDEN GELADEN...
            </span>
          </div>
        )}

        {!loading && leaderboardData.length === 0 && (
          <div className="text-center py-20 bg-[#0e0e18]/60 border border-white/10 rounded-3xl p-8 backdrop-blur-md">
            <Trophy className="w-12 h-12 text-gray-600 mx-auto mb-4 stroke-1" />
            <p className="text-gray-400 font-mono font-bold uppercase tracking-wider text-sm">
              {t("leaderboard.empty")}
            </p>
          </div>
        )}

        {/* ════════════════ TOP 3 PODIUM CARDS (PRESTIGIOUS SHOWCASE) ════════════════ */}
        {!loading && topThree.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 items-end mb-10 sm:mb-14 pt-6">
            
            {/* #2 SILVER (LEFT) */}
            {rank2 ? (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="relative bg-gradient-to-b from-[#181824]/90 to-[#0c0c14]/90 border-t-2 border-t-gray-300/80 border-x border-b border-white/10 rounded-3xl p-6 flex flex-col items-center text-center shadow-[0_10px_30px_rgba(0,0,0,0.6)] backdrop-blur-xl order-2 md:order-1"
              >
                <div className="w-8 h-8 rounded-full bg-gray-300/20 border border-gray-300/40 text-gray-300 flex items-center justify-center font-mono font-black text-xs mb-3 shadow-[0_0_15px_rgba(209,213,219,0.3)]">
                  <Medal className="w-4 h-4" />
                </div>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-200 via-gray-400 to-gray-600 text-black flex items-center justify-center font-black text-2xl shadow-lg mb-3">
                  {upperTL(rank2.name[0])}
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight text-white truncate max-w-full">
                  {rank2.name}
                </h3>
                <span className="text-[10px] font-mono uppercase font-bold text-gray-400 tracking-wider mt-1 px-3 py-0.5 rounded-full bg-white/5 border border-white/10">
                  {getLeagueFromScore(rank2.score).title}
                </span>
                <div className="mt-4 pt-3 border-t border-white/10 w-full flex items-baseline justify-center gap-1.5">
                  <span className="text-2xl font-mono font-black text-gray-200">
                    {rank2.score.toLocaleString()}
                  </span>
                  <span className="text-[10px] font-mono font-black text-gray-400 uppercase">XP</span>
                </div>
              </motion.div>
            ) : <div className="hidden md:block order-2 md:order-1" />}

            {/* #1 GOLD CHAMPION (CENTER - HIGHLIGHT) */}
            {rank1 && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="relative bg-gradient-to-b from-[#241a0e]/95 to-[#0e0a05]/95 border-2 border-amber-400/80 rounded-3xl p-7 flex flex-col items-center text-center shadow-[0_15px_50px_rgba(245,158,11,0.25)] backdrop-blur-2xl order-1 md:order-2 md:-translate-y-4"
              >
                {/* Crown badge */}
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-yellow-400 to-amber-500 text-black font-mono font-black text-[10px] uppercase tracking-[0.25em] flex items-center gap-1.5 shadow-[0_4px_15px_rgba(245,158,11,0.5)]">
                  <Crown className="w-3.5 h-3.5 fill-black text-black" />
                  <span>CHAMPION #1</span>
                </div>

                <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-yellow-300 via-amber-400 to-yellow-600 text-black flex items-center justify-center font-black text-3xl shadow-[0_0_30px_rgba(250,204,21,0.5)] mt-2 mb-3">
                  {upperTL(rank1.name[0])}
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight text-white drop-shadow-sm truncate max-w-full">
                  {rank1.name}
                </h3>
                <span className="text-[11px] font-mono uppercase font-black text-amber-300 tracking-wider mt-1 px-3.5 py-1 rounded-full bg-amber-400/15 border border-amber-400/30 flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5 text-amber-400" />
                  <span>{getLeagueFromScore(rank1.score).title}</span>
                </span>
                <div className="mt-5 pt-4 border-t border-amber-400/20 w-full flex items-baseline justify-center gap-1.5">
                  <span className="text-3xl font-mono font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500 drop-shadow-[0_0_15px_rgba(245,158,11,0.4)]">
                    {rank1.score.toLocaleString()}
                  </span>
                  <span className="text-xs font-mono font-black text-amber-400 uppercase">XP</span>
                </div>
              </motion.div>
            )}

            {/* #3 BRONZE (RIGHT) */}
            {rank3 ? (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="relative bg-gradient-to-b from-[#1c1410]/90 to-[#0d0907]/90 border-t-2 border-t-amber-700/80 border-x border-b border-white/10 rounded-3xl p-6 flex flex-col items-center text-center shadow-[0_10px_30px_rgba(0,0,0,0.6)] backdrop-blur-xl order-3"
              >
                <div className="w-8 h-8 rounded-full bg-amber-700/20 border border-amber-700/40 text-amber-500 flex items-center justify-center font-mono font-black text-xs mb-3 shadow-[0_0_15px_rgba(180,83,9,0.3)]">
                  <Medal className="w-4 h-4" />
                </div>
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-600 via-amber-700 to-amber-900 text-white flex items-center justify-center font-black text-2xl shadow-lg mb-3">
                  {upperTL(rank3.name[0])}
                </div>
                <h3 className="text-xl font-black uppercase tracking-tight text-white truncate max-w-full">
                  {rank3.name}
                </h3>
                <span className="text-[10px] font-mono uppercase font-bold text-amber-500 tracking-wider mt-1 px-3 py-0.5 rounded-full bg-white/5 border border-white/10">
                  {getLeagueFromScore(rank3.score).title}
                </span>
                <div className="mt-4 pt-3 border-t border-white/10 w-full flex items-baseline justify-center gap-1.5">
                  <span className="text-2xl font-mono font-black text-amber-300">
                    {rank3.score.toLocaleString()}
                  </span>
                  <span className="text-[10px] font-mono font-black text-amber-500 uppercase">XP</span>
                </div>
              </motion.div>
            ) : <div className="hidden md:block order-3" />}

          </div>
        )}

        {/* ════════════════ RANKS 4-10 TABLE LIST ════════════════ */}
        {!loading && remainingPlayers.length > 0 && (
          <div className="bg-[#0a0a12]/80 border border-white/10 rounded-3xl p-4 sm:p-6 backdrop-blur-xl shadow-[0_15px_40px_rgba(0,0,0,0.6)]">
            
            {/* Table Column Headers */}
            <div className="grid grid-cols-12 px-4 sm:px-6 py-3 text-[11px] font-mono font-black text-gray-400 uppercase tracking-[0.2em] border-b border-white/10">
              <div className="col-span-2 sm:col-span-1">{t("leaderboard.rank")}</div>
              <div className="col-span-6 sm:col-span-7">{t("leaderboard.player")}</div>
              <div className="col-span-4 text-right">{t("leaderboard.score")}</div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-white/5">
              {remainingPlayers.map((player, idx) => {
                const league = getLeagueFromScore(player.score);
                const rankNum = player.rank < 10 ? `0${player.rank}` : `${player.rank}`;

                return (
                  <motion.div
                    key={player.rank}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="grid grid-cols-12 items-center px-4 sm:px-6 py-4 hover:bg-white/[0.04] transition-colors group"
                  >
                    {/* Rank */}
                    <div className="col-span-2 sm:col-span-1 font-mono font-black text-gray-500 text-sm sm:text-base group-hover:text-white transition-colors">
                      #{rankNum}
                    </div>

                    {/* Player Info & League Badge */}
                    <div className="col-span-6 sm:col-span-7 flex items-center gap-3 sm:gap-4 min-w-0 pr-2">
                      <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center font-bold text-sm text-white shrink-0 group-hover:border-amber-400/50 transition-colors">
                        {upperTL(player.name[0])}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm sm:text-base font-black uppercase text-white tracking-tight truncate group-hover:text-amber-300 transition-colors">
                          {player.name}
                        </h4>
                        <span className="text-[10px] font-mono uppercase font-semibold text-gray-400 flex items-center gap-1">
                          <span>{league.badge}</span>
                          <span>{league.title}</span>
                        </span>
                      </div>
                    </div>

                    {/* XP Score */}
                    <div className="col-span-4 text-right flex items-baseline justify-end gap-1.5">
                      <span className="text-base sm:text-xl font-mono font-black text-white tracking-tight">
                        {player.score.toLocaleString()}
                      </span>
                      <span className="text-[10px] font-mono font-bold text-gray-400 uppercase">
                        XP
                      </span>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
