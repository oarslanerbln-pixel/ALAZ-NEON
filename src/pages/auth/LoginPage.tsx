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
      {/* Background elements - Premium animated gradient mesh */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden bg-[#030303]">
        <motion.div 
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
            rotate: [0, 90, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-alaz-orange/20 blur-[150px] rounded-full mix-blend-screen" 
        />
        <motion.div 
          animate={{
            scale: [1, 1.5, 1],
            opacity: [0.2, 0.4, 0.2],
            rotate: [0, -90, 0]
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-neon-blue/20 blur-[120px] rounded-full mix-blend-screen" 
        />
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.03]" />
      </div>

      <motion.div
        initial={{ opacity: 0, rotateX: 45, y: 100, scale: 0.8, z: -500 }}
        animate={{ opacity: 1, rotateX: 0, y: 0, scale: 1, z: 0 }}
        transition={{ 
          duration: 1.2, 
          type: "spring", 
          bounce: 0.4,
          ease: "easeOut"
        }}
        style={{ perspective: 1000, transformStyle: "preserve-3d" }}
        className="w-full max-w-md relative z-10"
      >
        <div className="relative p-10 bg-black/40 backdrop-blur-3xl rounded-[2rem] border border-white/10 shadow-[0_0_80px_rgba(255,77,0,0.15)] group" style={{ transformStyle: "preserve-3d" }}>
          
          {/* Animated 3D Borders */}
          <div className="absolute inset-0 rounded-[2rem] border-2 border-transparent bg-clip-border before:absolute before:inset-0 before:-z-10 before:rounded-[2rem] before:bg-gradient-to-r before:from-alaz-orange/50 before:via-neon-blue/50 before:to-[#ff003c]/50 before:opacity-0 group-hover:before:opacity-100 before:transition-opacity before:duration-700" />

          <div className="text-center mb-10 relative z-20" style={{ transform: "translateZ(50px)" }}>
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-28 h-28 mx-auto mb-8 flex items-center justify-center group"
            >
              {/* Ambient Premium Glow */}
              <div className="absolute inset-0 bg-alaz-orange/20 blur-[30px] rounded-full group-hover:bg-alaz-orange/40 transition-colors duration-700" />
              
              {/* Sharp Diamond Container */}
              <div className="absolute inset-3 bg-black/90 backdrop-blur-xl border border-white/20 rotate-45 shadow-2xl overflow-hidden">
                {/* Inner Metallic Shine */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent -translate-x-[100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
              </div>
              
              <NeonIcon type="flame" color="orange" className="w-12 h-12 relative z-10 drop-shadow-[0_0_20px_rgba(255,255,255,0.5)] opacity-90 group-hover:opacity-100 transition-opacity" />
            </motion.div>
            
            <motion.h1 
              className="text-6xl md:text-7xl font-black italic tracking-tighter mb-2 uppercase relative"
              animate={{
                backgroundImage: [
                  "linear-gradient(45deg, #ff4d00, #ff003c)",
                  "linear-gradient(45deg, #00f3ff, #ff003c)",
                  "linear-gradient(45deg, #ff4d00, #FFD700)",
                  "linear-gradient(45deg, #ff4d00, #ff003c)",
                ],
              }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              style={{
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
                color: "transparent",
                filter: "drop-shadow(0px 10px 20px rgba(255,77,0,0.4))",
              }}
            >
              KAMUS
            </motion.h1>
            <p className="text-gray-400 font-bold uppercase tracking-[0.4em] text-[10px] mt-4 flex items-center justify-center gap-2">
              <span className="w-4 h-[1px] bg-alaz-orange/50"></span>
              SİSTEME GİRİŞ
              <span className="w-4 h-[1px] bg-alaz-orange/50"></span>
            </p>
          </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-8 relative z-20" style={{ transform: "translateZ(30px)" }}>
            <div className="space-y-3 relative group">
              <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-2 group-focus-within:text-alaz-orange transition-colors">
                {t("auth.email")}
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-alaz-orange focus:bg-white/10 transition-all placeholder:text-white/20"
                  placeholder="savasci@alaz.com"
                />
                <div className="absolute inset-0 rounded-2xl border border-alaz-orange/0 group-focus-within:border-alaz-orange/30 group-focus-within:shadow-[0_0_20px_rgba(255,77,0,0.2)] transition-all pointer-events-none" />
              </div>
            </div>

            <div className="space-y-3 relative group">
              <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest ml-2 group-focus-within:text-neon-blue transition-colors">
                {t("auth.password")}
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-neon-blue focus:bg-white/10 transition-all placeholder:text-white/20"
                  placeholder="••••••••"
                />
                <div className="absolute inset-0 rounded-2xl border border-neon-blue/0 group-focus-within:border-neon-blue/30 group-focus-within:shadow-[0_0_20px_rgba(0,243,255,0.2)] transition-all pointer-events-none" />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02, textShadow: "0px 0px 8px rgb(255,255,255)" }}
              whileTap={{ scale: 0.98 }}
              disabled={loading}
              className="w-full mt-4 py-5 bg-gradient-to-r from-alaz-orange to-[#ff003c] text-white font-black text-xl rounded-2xl shadow-[0_10px_40px_rgba(255,77,0,0.4)] hover:shadow-[0_10px_60px_rgba(255,77,0,0.6)] transition-all disabled:opacity-50 border border-white/20 relative overflow-hidden group/btn"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out" />
              <span className="relative z-10 tracking-[0.2em]">{loading ? "..." : t("auth.login").toUpperCase()}</span>
            </motion.button>
          </div>
        </form>

        <div className="mt-8 text-center relative z-20" style={{ transform: "translateZ(20px)" }}>
          <p className="text-gray-400 text-sm font-medium">
            {t("auth.noAccount")}{" "}
            <Link
              to="/register"
              className="text-alaz-orange font-black uppercase tracking-widest text-xs hover:text-white transition-colors ml-2 drop-shadow-[0_0_10px_rgba(255,77,0,0.5)]"
            >
              {t("auth.register")}
            </Link>
          </p>
        </div>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-12 text-center" 
            style={{ transform: "translateZ(20px)" }}
          >
            <button
              onClick={() => navigate("/")}
              className="text-gray-500 text-[10px] font-black uppercase tracking-widest hover:text-white hover:tracking-[0.3em] transition-all duration-300"
            >
              {t("leaderboard.back")}
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
