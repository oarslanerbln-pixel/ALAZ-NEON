import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  motion,
  useMotionValue,
  useTransform,
  useSpring,
  AnimatePresence,
} from "framer-motion";
import { KineticSpark } from "../components/KineticSpark";
import { SoundManager, sounds } from "../lib/audio";
import { useLocale } from "../hooks/useLocale";
import { AttractMode } from "../components/AttractMode";

function TiltCard({
  children,
  onClick,
  className,
  style,
}: {
  children: React.ReactNode;
  onClick: () => void;
  className: string;
  style?: React.CSSProperties;
}) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const mouseXSpring = useSpring(x);
  const mouseYSpring = useSpring(y);

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["10deg", "-10deg"]);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-10deg", "10deg"]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const xPct = mouseX / width - 0.5;
    const yPct = mouseY / height - 0.5;

    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{
        ...style,
        rotateY,
        rotateX,
        transformStyle: "preserve-3d",
      }}
      className={className}
    >
      <div className="card-inner-content">{children}</div>
    </motion.div>
  );
}

const HERO_IMAGES = [
  "/hero-1.png",
  "/hero-2.png",
  "/hero-3.png",
  "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?q=80&w=2000&auto=format&fit=crop", // Istanbul 1
  "https://images.unsplash.com/photo-1527838832700-5059252407fa?q=80&w=2000&auto=format&fit=crop", // Istanbul 2
];

export function LandingPage() {
  const navigate = useNavigate();
  const [showIntro, setShowIntro] = useState(true);
  const { t } = useLocale();
  const [bgIndex, setBgIndex] = useState(0);
  const [isIdle, setIsIdle] = useState(false);
  const [showGameSelection, setShowGameSelection] = useState(false);

  // Background slider logic
  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % HERO_IMAGES.length);
    }, 6000); // 6 seconds per image
    return () => clearInterval(interval);
  }, []);

  // Idle Timer logic
  useEffect(() => {
    let idleTimeout: number;

    const resetIdleTimer = () => {
      if (isIdle) setIsIdle(false);
      clearTimeout(idleTimeout);
      // Wait 30 seconds before showing attract mode
      idleTimeout = window.setTimeout(() => {
        setIsIdle(true);
      }, 30000); 
    };

    // Attach listeners
    window.addEventListener("mousemove", resetIdleTimer);
    window.addEventListener("keydown", resetIdleTimer);
    window.addEventListener("touchstart", resetIdleTimer);
    window.addEventListener("click", resetIdleTimer);

    // Initial start
    resetIdleTimer();

    return () => {
      clearTimeout(idleTimeout);
      window.removeEventListener("mousemove", resetIdleTimer);
      window.removeEventListener("keydown", resetIdleTimer);
      window.removeEventListener("touchstart", resetIdleTimer);
      window.removeEventListener("click", resetIdleTimer);
    };
  }, [isIdle]);

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center min-h-screen relative overflow-hidden bg-black">
      {/* Background Slider - ALWAYS VISIBLE */}
      <AnimatePresence mode="wait">
        <motion.div
          key={bgIndex}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="absolute inset-0 z-0 overflow-hidden"
        >
          <motion.img
            initial={{ scale: 1.0 }}
            animate={{ scale: 1.15 }}
            transition={{ duration: 10, ease: "linear" }}
            src={HERO_IMAGES[bgIndex]}
            alt="Hero Background"
            className="w-full h-full object-cover object-center opacity-90"
          />
          {/* Cinematic Gradient Overlays - Reduced for visibility */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.5)_100%)] pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/60 pointer-events-none" />
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {!showIntro && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed top-0 left-0 right-0 z-50 w-full max-w-7xl mx-auto px-6 pt-6 flex justify-between items-center"
          >
            <div className="flex items-center gap-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => navigate("/leaderboard")}
                className="flex items-center gap-2 px-6 py-3 bg-black/40 border border-white/20 hover:bg-white hover:text-black hover:border-white transition-all group backdrop-blur-md"
                style={{ clipPath: "polygon(10px 0, calc(100% - 10px) 0, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0 calc(100% - 10px), 0 10px)" }}
              >
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white group-hover:text-black transition-colors">
                  {t("leaderboard.title")}
                </span>
              </motion.button>
            </div>

            <div className="flex items-center gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                onClick={() => navigate("/login")}
                className="px-8 py-3 bg-black/40 border border-white/20 hover:bg-white hover:text-black hover:border-white transition-all group backdrop-blur-md"
                style={{ clipPath: "polygon(10px 0, calc(100% - 10px) 0, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0 calc(100% - 10px), 0 10px)" }}
              >
                <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white group-hover:text-black transition-colors">
                  {t("auth.login")}
                </span>
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {showIntro ? (
          <motion.div
            key="intro"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="fixed inset-0 z-40 flex flex-col items-center justify-center pointer-events-auto"
          >
            <div className="relative w-full max-w-7xl flex flex-col items-center justify-center flex-1">
              <KineticSpark
                delay={0}
                showTagline
                tagline={t("landing.tagline")}
                playAudio={false}
              />
            </div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 1 }}
              className="mb-24"
            >
              <button
                onClick={() => {
                  SoundManager.getInstance().playSFX(sounds.CLICK);
                  setShowIntro(false);
                }}
                className="px-10 py-4 border border-white/20 bg-black/40 hover:bg-white hover:text-black hover:border-white transition-all text-sm font-sans font-black uppercase tracking-widest backdrop-blur-md group"
                style={{ clipPath: "polygon(15px 0, calc(100% - 15px) 0, 100% 15px, 100% calc(100% - 15px), calc(100% - 15px) 100%, 15px 100%, 0 calc(100% - 15px), 0 15px)" }}
              >
                <span className="flex items-center gap-3">
                  <span className="w-2 h-2 bg-alaz-orange animate-pulse"></span>
                  SİSTEME GİRİŞ YAP
                  <span className="w-2 h-2 bg-[#ff003c] animate-pulse"></span>
                </span>
              </button>
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="w-full h-full flex flex-col items-center justify-center z-10"
          >
            {/* HERO SECTION - MASSIVE WIDE TEXT */}
            <div className="flex-1 flex flex-col items-center justify-center w-full mt-24 mb-16">
              <div className="w-full max-w-[1400px] h-[35vh] min-h-[300px] relative pointer-events-none drop-shadow-[0_0_50px_rgba(255,215,0,0.2)]">
                <KineticSpark showTagline delay={-1} />
              </div>
            </div>

            {/* Role Selection Buttons */}
            {!showGameSelection ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-4xl mx-auto pb-20">
                <TiltCard
                  onClick={() => {
                    SoundManager.getInstance().playSFX(sounds.CLICK);
                    setShowGameSelection(true);
                  }}
                className="group relative overflow-hidden p-10 transition-all bg-black/40 backdrop-blur-xl border border-alaz-orange/30 hover:border-alaz-orange cursor-pointer"
                style={{ clipPath: "polygon(25px 0, calc(100% - 25px) 0, 100% 25px, 100% calc(100% - 25px), calc(100% - 25px) 100%, 25px 100%, 0 calc(100% - 25px), 0 25px)" }}
              >
                {/* Gold Glow Border Animation */}
                <div className="absolute inset-0 z-0">
                  <div className="absolute top-0 left-0 w-[200%] h-[200%] -translate-x-1/2 -translate-y-1/2 bg-[conic-gradient(from_0deg,transparent_0_180deg,rgba(255,215,0,0.2)_360deg)] animate-[spin_6s_linear_infinite]" />
                  <div className="absolute inset-[2px] bg-black/90 backdrop-blur-3xl z-10" style={{ clipPath: "polygon(24px 0, calc(100% - 24px) 0, 100% 24px, 100% calc(100% - 24px), calc(100% - 24px) 100%, 24px 100%, 0 calc(100% - 24px), 0 24px)" }} />
                </div>
                
                <div className="relative z-20 text-center flex flex-col items-center justify-center min-h-[160px]">
                  <span className="text-white/60 text-[10px] uppercase tracking-[0.4em] font-black mb-4 group-hover:text-alaz-orange transition-colors flex items-center justify-center gap-3">
                    <span className="w-1.5 h-1.5 bg-alaz-orange rounded-none animate-pulse"></span>
                    {t("landing.hostLabel")}
                  </span>
                  <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight uppercase">
                    {t("landing.hostTitle")}
                  </h2>
                  <p className="text-gray-400 text-sm leading-relaxed font-medium">
                    {t("landing.hostDesc")}
                  </p>
                </div>
                <div className="absolute inset-0 bg-alaz-orange/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-20 mix-blend-screen" />
              </TiltCard>

              <TiltCard
                onClick={() => {
                  SoundManager.getInstance().playSFX(sounds.CLICK);
                  navigate("/join");
                }}
                className="group relative overflow-hidden p-10 transition-all bg-black/40 backdrop-blur-xl border border-[#ff003c]/30 hover:border-[#ff003c] cursor-pointer"
                style={{ clipPath: "polygon(25px 0, calc(100% - 25px) 0, 100% 25px, 100% calc(100% - 25px), calc(100% - 25px) 100%, 25px 100%, 0 calc(100% - 25px), 0 25px)" }}
              >
                {/* Wine Red Glow Border Animation */}
                <div className="absolute inset-0 z-0 animate-pulse" style={{ animationDuration: "4s" }}>
                  <div className="absolute top-0 left-0 w-[200%] h-[200%] -translate-x-1/2 -translate-y-1/2 bg-[conic-gradient(from_0deg,transparent_0_180deg,rgba(255,0,60,0.3)_360deg)] animate-[spin_5s_linear_infinite] opacity-80 blur-[10px]" style={{ animationDelay: "-2s" }} />
                  <div className="absolute top-0 left-0 w-[200%] h-[200%] -translate-x-1/2 -translate-y-1/2 bg-[conic-gradient(from_0deg,transparent_0_300deg,rgba(255,0,60,0.4)_360deg)] animate-[spin_5s_linear_infinite]" style={{ animationDelay: "-2s" }} />
                  <div className="absolute inset-[2px] bg-black/90 backdrop-blur-3xl z-10" style={{ clipPath: "polygon(24px 0, calc(100% - 24px) 0, 100% 24px, 100% calc(100% - 24px), calc(100% - 24px) 100%, 24px 100%, 0 calc(100% - 24px), 0 24px)" }} />
                </div>

                <div className="relative z-20 text-center flex flex-col items-center justify-center min-h-[160px]">
                  <span className="text-white/60 text-[10px] uppercase tracking-[0.4em] font-black mb-4 group-hover:text-[#ff003c] transition-colors flex items-center justify-center gap-3">
                    {t("landing.playerLabel")}
                    <span className="w-1.5 h-1.5 bg-[#ff003c] rounded-none animate-pulse"></span>
                  </span>
                  <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight uppercase">
                    {t("landing.playerTitle")}
                  </h2>
                  <p className="text-gray-400 text-sm leading-relaxed font-medium">
                    {t("landing.playerDesc")}
                  </p>
                </div>
                <div className="absolute inset-0 bg-[#ff003c]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-20 mix-blend-screen" />
              </TiltCard>
            </div>
            ) : (
              <div className="w-full max-w-4xl mx-auto pb-20 flex flex-col items-center">
                <h2 className="text-3xl font-black text-white mb-10 tracking-widest uppercase">
                  Oyun Seçimi
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full">
                  <TiltCard
                    onClick={() => {
                      SoundManager.getInstance().playSFX(sounds.START);
                      navigate("/host/setup", { state: { gameType: "scattegories" } });
                    }}
                    className="group relative overflow-hidden p-10 transition-all bg-black/40 backdrop-blur-xl border border-alaz-orange/30 hover:border-alaz-orange cursor-pointer"
                    style={{ clipPath: "polygon(25px 0, calc(100% - 25px) 0, 100% 25px, 100% calc(100% - 25px), calc(100% - 25px) 100%, 25px 100%, 0 calc(100% - 25px), 0 25px)" }}
                  >
                    <div className="relative z-20 text-center flex flex-col items-center justify-center min-h-[160px]">
                      <h2 className="text-3xl md:text-5xl font-black text-alaz-orange mb-4 tracking-tight uppercase">
                        ALAZ NEON
                      </h2>
                      <p className="text-gray-400 text-sm leading-relaxed font-medium">
                        Kelime yeteneğini test et. Klasik İsim Şehir oyununun hiper-modern versiyonu.
                      </p>
                    </div>
                  </TiltCard>

                  <TiltCard
                    onClick={() => {
                      SoundManager.getInstance().playSFX(sounds.START);
                      navigate("/host/setup", { state: { gameType: "quiz" } });
                    }}
                    className="group relative overflow-hidden p-10 transition-all bg-black/40 backdrop-blur-xl border border-blue-500/30 hover:border-blue-500 cursor-pointer"
                    style={{ clipPath: "polygon(25px 0, calc(100% - 25px) 0, 100% 25px, 100% calc(100% - 25px), calc(100% - 25px) 100%, 25px 100%, 0 calc(100% - 25px), 0 25px)" }}
                  >
                    <div className="relative z-20 text-center flex flex-col items-center justify-center min-h-[160px]">
                      <h2 className="text-3xl md:text-5xl font-black text-blue-500 mb-4 tracking-tight uppercase">
                        ALAZ QUIZ
                      </h2>
                      <p className="text-gray-400 text-sm leading-relaxed font-medium">
                        Genel kültürünü kanıtla. Kim Milyoner Olmak İster tarzı zeka ve hız savaşı.
                      </p>
                    </div>
                  </TiltCard>
                </div>
                <button
                  onClick={() => setShowGameSelection(false)}
                  className="mt-12 px-8 py-3 text-sm font-bold text-gray-400 hover:text-white transition-colors"
                >
                  &larr; GERİ DÖN
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isIdle && <AttractMode onClose={() => setIsIdle(false)} />}
      </AnimatePresence>
    </div>
  );
}
