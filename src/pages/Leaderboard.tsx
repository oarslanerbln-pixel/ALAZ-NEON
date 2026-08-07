import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useLocale } from "../hooks/useLocale";

export function Leaderboard() {
  const navigate = useNavigate();
  const { t } = useLocale();

  // Mock data for now - will connect to Supabase later
  const leaderboardData = [
    { rank: 1, name: "Ateşin_Oğlu", score: 12450, persona: "Sprinter" },
    { rank: 2, name: "Gece_Yarısı", score: 11200, persona: "Innovator" },
    { rank: 3, name: "Mistik_Ruh", score: 10800, persona: "Sniper" },
    { rank: 4, name: "Cyber_Warrior", score: 9500, persona: "Strategist" },
    { rank: 5, name: "Neon_Blade", score: 8900, persona: "Ghost" },
    { rank: 6, name: "Alaz_Usta", score: 8200, persona: "Innovator" },
    { rank: 7, name: "Shadow_King", score: 7500, persona: "Sprinter" },
    { rank: 8, name: "Pixel_Master", score: 7100, persona: "Sniper" },
  ];

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
            <button className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-alaz-orange shadow-[0_0_15px_rgba(255,77,0,0.2)]">
              {t("leaderboard.thisWeek")}
            </button>
            <button className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-white transition-colors">
              {t("leaderboard.allTime")}
            </button>
          </div>
        </header>

        <div className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl lg:text-7xl font-black italic tracking-tighter text-glow-ultra-alaz mb-4"
            data-text={t("leaderboard.title")}
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

          {/* Rows */}
          {leaderboardData.map((player, index) => (
            <motion.div
              key={player.rank}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`grid grid-cols-12 items-center px-8 py-6 rounded-2xl border transition-all duration-300 group ${
                player.rank === 1
                  ? "bg-alaz-orange/10 border-alaz-orange/30 shadow-[0_10px_40px_rgba(255,77,0,0.1)]"
                  : "bg-white/5 border-white/5 hover:border-white/20"
              }`}
            >
              <div
                className={`col-span-1 text-2xl font-black ${
                  player.rank === 1
                    ? "text-alaz-orange"
                    : player.rank === 2
                      ? "text-gray-300"
                      : player.rank === 3
                        ? "text-orange-900"
                        : "text-gray-700"
                }`}
              >
                #{player.rank}
              </div>
              <div className="col-span-7 flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-lg ${
                    player.rank === 1
                      ? "bg-alaz-orange text-black"
                      : "bg-white/10 text-white"
                  }`}
                >
                  {player.name[0].toUpperCase()}
                </div>
                <div>
                  <div className="text-xl font-black text-white group-hover:text-alaz-orange transition-colors">
                    {player.name}
                  </div>
                  <div className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">
                    {player.persona}
                  </div>
                </div>
              </div>
              <div
                className={`col-span-4 text-right text-3xl font-black ${
                  player.rank === 1
                    ? "text-glow-alaz text-white"
                    : "text-gray-400"
                }`}
              >
                {player.score.toLocaleString()}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
