import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { useLocale } from "../../hooks/useLocale";
import { upperTL } from "../../lib/stringUtils";
import { errorMessage } from "../../lib/errors";
import { NeonIcon } from "../../components/NeonIcon";
import { useVenue } from "../../contexts/VenueContextCore";

export function LoginPage() {
  const navigate = useNavigate();
  const { t, locale } = useLocale();
  const { venue } = useVenue();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Daha önce bu form hiçbir yere bağlı değildi — submit'te sahte bir
  // gecikme atıp "başarılı" gibi ana sayfaya yönlendiriyordu, kimse
  // gerçekten giriş yapmıyordu. Şimdi gerçek Firebase Auth ile giriş
  // yapıyor; bu oturum /admin/venue (mekan markası ayarları) erişiminin
  // güvenlik kapısı.
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
      navigate("/admin/venue");
    } catch (err) {
      setErrorMsg(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6 relative overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <div className="surface relative p-10 rounded-[2rem]">
          <div className="text-center mb-10">
            <div className="relative w-20 h-20 mx-auto mb-8 flex items-center justify-center">
              <div className="absolute inset-0 surface-2 rounded-2xl" />
              <NeonIcon type="flame" color="orange" className="w-10 h-10 relative z-10" />
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-7xl font-black italic tracking-tighter mb-2 uppercase relative break-words text-accent">
              {venue.name}
            </h1>
            <p className="text-gray-400 font-bold uppercase tracking-[0.4em] text-xs mt-4 flex items-center justify-center gap-2">
              <span className="w-4 h-[1px] bg-accent/50"></span>
              {t("auth.loginHeading")}
              <span className="w-4 h-[1px] bg-accent/50"></span>
            </p>
          </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <AnimatePresence>
            {errorMsg && (
              <motion.p
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="text-bad text-xs font-bold bg-bad/10 border border-bad/30 rounded-xl px-4 py-3 text-center"
              >
                {errorMsg}
              </motion.p>
            )}
          </AnimatePresence>
          <div className="space-y-8 relative z-20">
            <div className="space-y-3 relative group">
              <label htmlFor="login-email" className="text-xs text-gray-400 font-black uppercase tracking-widest ml-2 group-focus-within:text-accent transition-colors">
                {t("auth.email")}
              </label>
              <input
                id="login-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-accent focus:bg-white/10 transition-colors placeholder:text-white/20"
                placeholder="savasci@alaz.com"
              />
            </div>

            <div className="space-y-3 relative group">
              <label htmlFor="login-password" className="text-xs text-gray-400 font-black uppercase tracking-widest ml-2 group-focus-within:text-accent transition-colors">
                {t("auth.password")}
              </label>
              <input
                id="login-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-accent focus:bg-white/10 transition-colors placeholder:text-white/20"
                placeholder="••••••••"
              />
            </div>

            <button
              disabled={loading}
              className="btn-primary w-full mt-4 py-5 font-black text-xl rounded-2xl"
            >
              <span className="tracking-[0.2em]">{loading ? "..." : upperTL(t("auth.login"), locale)}</span>
            </button>
          </div>
        </form>

          <div className="mt-12 text-center">
            <button
              onClick={() => navigate("/")}
              className="text-gray-500 text-xs font-black uppercase tracking-widest hover:text-white transition-colors"
            >
              {t("leaderboard.back")}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
