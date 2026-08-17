import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { useLocale } from "../../hooks/useLocale";
import { NeonIcon } from "../../components/NeonIcon";

export function LoginPage() {
  const navigate = useNavigate();
  const { t } = useLocale();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Auth logic will be added here
    setTimeout(() => {
      setLoading(false);
      navigate("/");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 relative overflow-hidden font-inter">
      {/* Background elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-alaz-orange/5 blur-[150px] rounded-full" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-alaz-orange/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-alaz-orange/30 shadow-[0_0_30px_rgba(255,77,0,0.2)]">
            <NeonIcon type="flame" color="orange" className="w-10 h-10" />
          </div>
          <h1 className="text-5xl font-black text-white italic tracking-tighter mb-4 uppercase drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
            ALAZ
          </h1>
          <p className="text-gray-500 font-bold uppercase tracking-widest text-[10px]">
            ALAZ
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">
              {t("auth.email")}
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-alaz-orange transition-all"
              placeholder="savasci@alaz.com"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">
              {t("auth.password")}
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-neon-blue transition-all"
              placeholder="••••••••"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
            className="w-full py-5 bg-white text-black font-black text-lg rounded-2xl shadow-[0_20px_40px_rgba(255,255,255,0.1)] hover:bg-alaz-orange hover:text-white transition-all disabled:opacity-50"
          >
            {loading ? "..." : t("auth.login").toUpperCase()}
          </motion.button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-gray-500 text-sm font-medium">
            {t("auth.noAccount")}{" "}
            <Link
              to="/register"
              className="text-alaz-orange font-black uppercase tracking-widest text-xs hover:underline ml-2"
            >
              {t("auth.register")}
            </Link>
          </p>
        </div>

        <div className="mt-12 text-center">
          <button
            onClick={() => navigate("/")}
            className="text-gray-600 text-[10px] font-black uppercase tracking-widest hover:text-white transition-colors"
          >
            {t("leaderboard.back")}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
