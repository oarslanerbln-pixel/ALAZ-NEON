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
import { useVenue } from "../contexts/VenueContextCore";
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
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
      role="button"
      tabIndex={0}
      style={{
        ...style,
        rotateY,
        rotateX,
        transformStyle: "preserve-3d",
      }}
      className={`${className} focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-yellow-400`}
    >
      <div className="card-inner-content">{children}</div>
    </motion.div>
  );
}


export function LandingPage() {
  const navigate = useNavigate();
  // Bypass intro screen entirely
  const [showIntro, setShowIntro] = useState(false);
  const { t } = useLocale();
  const { venue } = useVenue();
  const [isIdle, setIsIdle] = useState(false);

  // Initial cinematic animation timer
  useEffect(() => {
    const timer = setTimeout(() => {/* cinematic intro finished */}, 3000);
    return () => clearTimeout(timer);
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
    <div className="w-full min-h-screen bg-blue-950 overflow-hidden relative" style={{ perspective: "1400px" }}>
      {/* Cinematic Container */}
      <motion.div
        className="w-full min-h-screen flex flex-col items-center justify-center p-6 text-center relative"
        initial={{ scale: 1.05, opacity: 0, filter: "blur(10px)" }}
        animate={{
          scale: isIdle ? 1.02 : 1,
          opacity: 1,
          filter: "blur(0px)",
        }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* PREMIUM CINEMATIC BACKGROUND */}
        {/* PREMIUM CINEMATIC BACKGROUND - OLED BLACK */}
        <div className="fixed inset-0 z-0 bg-black pointer-events-none" />

      <AnimatePresence>
        {!showIntro && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            // Sabit konumlu olduğu için sayfa altından kayarak geçiyor ve
            // arkasında perde olmayınca içeriğin üstüne binip okunmaz hâle
            // getiriyordu. Aşağı doğru sönen degrade, butonları içerikten
            // ayırıyor ve geçişi kasıtlı gösteriyor.
            className="fixed top-0 left-0 right-0 z-50 w-full px-4 sm:px-6 pt-4 sm:pt-6 pb-8 flex justify-between items-center gap-3 bg-gradient-to-b from-[rgba(0,0,0,1)] via-[rgba(0,0,0,0.8)] to-transparent pointer-events-none [&>*]:pointer-events-auto"
          >
            {/*
              Telefonda bu iki buton yan yana sığmıyordu: 11px yazı + 0.2em harf
              aralığı + px-6/px-8 dolgu, 375px'lik ekranda satır kırıp taşıyordu.
              Küçük ekranda ölçüler daralıyor, `whitespace-nowrap` de sözcüklerin
              alt satıra düşmesini engelliyor.
            */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate("/leaderboard")}
              className="flex items-center gap-2 px-3 py-2 sm:px-6 sm:py-3 bg-black/40 border border-white/20 hover:bg-white hover:text-black hover:border-white transition-all group backdrop-blur-md min-w-0"
              style={{ clipPath: "polygon(10px 0, calc(100% - 10px) 0, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0 calc(100% - 10px), 0 10px)" }}
            >
              <span className="text-[9px] sm:text-[11px] font-black uppercase tracking-[0.08em] sm:tracking-[0.2em] text-white group-hover:text-black transition-colors whitespace-nowrap truncate">
                {t("leaderboard.title")}
              </span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              onClick={() => navigate("/login")}
              className="px-3 py-2 sm:px-8 sm:py-3 bg-black/40 border border-white/20 hover:bg-white hover:text-black hover:border-white transition-all group backdrop-blur-md shrink-0"
              style={{ clipPath: "polygon(10px 0, calc(100% - 10px) 0, 100% 10px, 100% calc(100% - 10px), calc(100% - 10px) 100%, 10px 100%, 0 calc(100% - 10px), 0 10px)" }}
            >
              <span className="text-[9px] sm:text-[11px] font-black uppercase tracking-[0.08em] sm:tracking-[0.2em] text-white group-hover:text-black transition-colors whitespace-nowrap">
                {t("auth.login")}
              </span>
            </motion.button>
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
                showTagline={false}
                tagline={t("landing.tagline")}
                playAudio={false}
                text={venue.name}
              />
            </div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 1 }}
              className="mb-24"
            >
              {/*
                Eski hâli `koyu kırmızı → beyaz` degradesi üzerine siyah
                yazıydı: solda yazı zemine gömülüyor, sağda ise beyaz üstünde
                sertleşiyordu — tek bir buton içinde iki farklı okunabilirlik.
                Artık tek aileden bir kor degradesi (kehribar → alaz-orange)
                zemin üstünde beyaz neon yazı; sıcak zemin + soğuk-beyaz neon
                tam ters uçlarda olduğu için kontrast doğal olarak yüksek.
              */}
              <button
                onClick={() => {
                  SoundManager.getInstance().playSFX(sounds.CLICK);
                  setShowIntro(false);
                }}
                // Zemin siyah: beyaz neon yazı için klasik neon-tabela
                // kontrastı (parlak tüp + kapkaranlık cam). Turuncu artık
                // sadece ince bir kenarlık ve butonun etrafındaki dış
                // ışımada — marka rengini korurken zemini karartıyor.
                className="relative px-8 py-4 sm:px-14 sm:py-6 bg-black hover:bg-[#0d0400] border-2 border-[#FF8A2E]/70 hover:border-[#FFA04D] transition-all text-base sm:text-xl font-sans font-black uppercase tracking-[0.18em] group shadow-[0_0_40px_rgba(255,85,0,0.45)] hover:shadow-[0_0_60px_rgba(255,140,40,0.6)] hover:scale-[1.03] active:scale-[0.99]"
                // Köşe kesimi 15px → 22px: daha belirgin sekizgen siluet.
                style={{ clipPath: "polygon(22px 0, calc(100% - 22px) 0, 100% 22px, 100% calc(100% - 22px), calc(100% - 22px) 100%, 22px 100%, 0 calc(100% - 22px), 0 22px)" }}
              >
                {/*
                  Sisli/yumuşak tek bir blur yerine dar yarıçaplı, katmanlı
                  gölgeler kullanıyoruz — gerçek neon tüpü gibi keskin bir
                  çekirdek + dar bir ışıma verir. Yanıp sönme düz bir sinüs
                  değil: döngü içinde iki kısa "titreme" anı var (gerçek neon
                  tüplerinin kararsız buzz'ını taklit ediyor), aradaki uzun
                  bölüm sabit parlak kalıyor.
                */}
                <motion.span
                  className="whitespace-nowrap text-white"
                  animate={{
                    textShadow: [
                      "0 0 2px #fff, 0 0 6px #fff, 0 0 14px rgba(255,255,255,0.9), 0 0 28px rgba(255,255,255,0.55)",
                      "0 0 2px #fff, 0 0 6px #fff, 0 0 14px rgba(255,255,255,0.9), 0 0 28px rgba(255,255,255,0.55)",
                      "0 0 1px rgba(255,255,255,0.3), 0 0 2px rgba(255,255,255,0.2)",
                      "0 0 2px #fff, 0 0 6px #fff, 0 0 14px rgba(255,255,255,0.9), 0 0 28px rgba(255,255,255,0.55)",
                      "0 0 2px #fff, 0 0 6px #fff, 0 0 14px rgba(255,255,255,0.9), 0 0 28px rgba(255,255,255,0.55)",
                      "0 0 1px rgba(255,255,255,0.45), 0 0 4px rgba(255,255,255,0.3)",
                      "0 0 2px #fff, 0 0 6px #fff, 0 0 14px rgba(255,255,255,0.9), 0 0 28px rgba(255,255,255,0.55)",
                    ],
                  }}
                  transition={{
                    duration: 2.8,
                    times: [0, 0.32, 0.36, 0.4, 0.72, 0.76, 1],
                    repeat: Infinity,
                    ease: "linear",
                  }}
                >
                  {t("landing.loginCta")}
                </motion.span>
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
            <div className="flex-1 flex flex-col items-center justify-center w-full mt-24 mb-16 relative z-10">
              {/* Deep shadow stage behind the logo to pop it out against the vivid background */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none -z-10">
                <div className="w-[80vw] h-[40vh] bg-black/80 blur-[80px] rounded-[100%]" />
              </div>
              
              <div className="w-full max-w-[1400px] h-[35vh] min-h-[300px] relative pointer-events-none drop-shadow-[0_0_100px_rgba(0,0,0,0.9)]">
                <KineticSpark showTagline delay={-1} text={venue.name} />
              </div>
            </div>
            {/* Role Selection Buttons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full max-w-4xl mx-auto pb-20">
              <TiltCard
                onClick={() => {
                  SoundManager.getInstance().playSFX(sounds.CLICK);
                  navigate("/host/setup");
                }}
                className="group relative overflow-hidden p-10 transition-all bg-black/40 backdrop-blur-xl border border-alaz-orange/30 hover:border-alaz-orange cursor-pointer"
                style={{ clipPath: "polygon(25px 0, calc(100% - 25px) 0, 100% 25px, 100% calc(100% - 25px), calc(100% - 25px) 100%, 25px 100%, 0 calc(100% - 25px), 0 25px)" }}
              >
                {/* Gold Glow Border Animation */}
                <div className="absolute inset-0 z-0 opacity-100">
                  <div className="absolute top-0 left-0 w-[200%] h-[200%] -translate-x-1/2 -translate-y-1/2 bg-[conic-gradient(from_0deg,transparent_0_180deg,rgba(255,215,0,0.2)_360deg)] animate-[spin_6s_linear_infinite]" />
                  <div className="absolute inset-[2px] bg-black/90 backdrop-blur-3xl z-10" style={{ clipPath: "polygon(24px 0, calc(100% - 24px) 0, 100% 24px, 100% calc(100% - 24px), calc(100% - 24px) 100%, 24px 100%, 0 calc(100% - 24px), 0 24px)" }} />
                </div>
                
                <div className="relative z-20 text-center flex flex-col items-center justify-center min-h-[160px]">
                  <span className="text-white/60 text-[10px] uppercase tracking-[0.4em] font-black mb-4 group-hover:text-alaz-orange transition-colors flex items-center justify-center gap-3">
                    <span className="w-1.5 h-1.5 bg-alaz-orange rounded-none animate-pulse"></span>
                    {t("landing.hostSectionLabel")}
                  </span>
                  <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight uppercase">
                    {t("landing.hostSectionTitle")}
                  </h2>
                  <p className="text-gray-400 text-sm leading-relaxed font-medium">
                    {t("landing.hostSectionDesc")}
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
                <div className="absolute inset-0 z-0 animate-pulse opacity-100" style={{ animationDuration: "4s" }}>
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

            {/* Game Modes Showcase Section */}
            <div className="w-full max-w-6xl mx-auto pb-24 px-6 flex flex-col items-center relative z-20">
              <h3 className="text-white/50 text-sm font-black uppercase tracking-[0.5em] mb-12">Oyun Modları</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
                
                {/* ALAZ ARENA Card */}
                <button
                  onClick={() => {
                    SoundManager.getInstance().playSFX(sounds.CLICK);
                    navigate("/host/setup");
                  }}
                  className="relative group overflow-hidden bg-black/40 backdrop-blur-xl border border-white/10 hover:border-transparent p-8 rounded-sm text-left transition-all duration-500 shadow-[0_0_20px_rgba(0,0,0,0.5)]"
                >
                  {/* Animated glowing border background */}
                  <div className="absolute inset-[-50%] z-0 bg-[conic-gradient(from_0deg,transparent_0_180deg,rgba(255,85,0,1)_270deg,rgba(255,85,0,1)_360deg)] animate-[spin_8s_linear_infinite] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute inset-[-50%] z-0 bg-[conic-gradient(from_0deg,transparent_0_180deg,rgba(255,85,0,1)_270deg,rgba(255,85,0,1)_360deg)] animate-[spin_8s_linear_infinite] opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md" />
                  <div className="absolute inset-[3px] bg-black/90 backdrop-blur-xl z-10 rounded-sm" />
                  
                  <div className="absolute -right-20 -top-20 w-48 h-48 bg-alaz-orange/10 rounded-full blur-[80px] group-hover:bg-alaz-orange/30 transition-colors duration-500 z-10" />
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none z-10" />
                  
                  <div className="relative z-20 flex flex-col h-full">
                    {/* VARYANT 1: Stroke & Fill (İçi boş yazının dolması) */}
                    <div className="text-[10px] text-alaz-orange/50 mb-1 font-mono uppercase hidden">Varyant 1: Stroke Fill</div>
                    <h3 className="text-xl font-black mb-2 tracking-widest relative flex flex-col">
                      <span className="text-white group-hover:text-alaz-orange transition-all duration-500 group-hover:drop-shadow-[0_0_12px_rgba(255,85,0,1)]">
                        HENGAME
                      </span>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-alaz-orange to-yellow-500 text-3xl mt-1">ARENA</span>
                    </h3>
                    <p className="text-gray-400 text-xs leading-relaxed mt-2 flex-1">{t("landing.modeArenaDesc")}</p>
                  </div>
                </button>

                {/* ALAZ QUIZ Card */}
                <button
                  onClick={() => {
                    SoundManager.getInstance().playSFX(sounds.CLICK);
                    navigate("/host/setup");
                  }}
                  className="relative group overflow-hidden bg-black/40 backdrop-blur-xl border border-white/10 hover:border-transparent p-8 rounded-sm text-left transition-all duration-500 shadow-[0_0_20px_rgba(0,0,0,0.5)]"
                >
                  {/* Animated glowing border background */}
                  <div className="absolute inset-[-50%] z-0 bg-[conic-gradient(from_0deg,transparent_0_180deg,rgba(0,229,255,1)_270deg,rgba(0,229,255,1)_360deg)] animate-[spin_8s_linear_infinite] opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ animationDelay: "-1s" }} />
                  <div className="absolute inset-[-50%] z-0 bg-[conic-gradient(from_0deg,transparent_0_180deg,rgba(0,229,255,1)_270deg,rgba(0,229,255,1)_360deg)] animate-[spin_8s_linear_infinite] opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md" style={{ animationDelay: "-1s" }} />
                  <div className="absolute inset-[3px] bg-black/90 backdrop-blur-xl z-10 rounded-sm" />
                  
                  <div className="absolute -right-20 -top-20 w-48 h-48 bg-neon-blue/10 rounded-full blur-[80px] group-hover:bg-neon-blue/30 transition-colors duration-500 z-10" />
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none z-10" />
                  
                  <div className="relative z-20 flex flex-col h-full">
                    {/* VARYANT 2: Breathing Glow (Yumuşak ve derin parlama) */}
                    <div className="text-[10px] text-neon-blue/50 mb-1 font-mono uppercase hidden">Varyant 2: Liquid Glow</div>
                    <h3 className="text-xl font-black mb-2 tracking-widest flex flex-col">
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-neon-blue to-white bg-[length:200%_100%] bg-left group-hover:bg-right transition-all duration-700 ease-in-out group-hover:drop-shadow-[0_0_10px_rgba(0,229,255,0.8)]">
                        HENGAME
                      </span>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-blue to-blue-400 text-3xl mt-1">QUIZ</span>
                    </h3>
                    <p className="text-gray-400 text-xs leading-relaxed mt-2 flex-1">{t("landing.modeQuizDesc")}</p>
                  </div>
                </button>

                {/* ALAZ BOMB Card */}
                <button
                  onClick={() => {
                    SoundManager.getInstance().playSFX(sounds.CLICK);
                    navigate("/host/setup");
                  }}
                  className="relative group overflow-hidden bg-black/40 backdrop-blur-xl border border-white/10 hover:border-transparent p-8 rounded-sm text-left transition-all duration-500 shadow-[0_0_20px_rgba(0,0,0,0.5)]"
                >
                  {/* Animated glowing border background */}
                  <div className="absolute inset-[-50%] z-0 bg-[conic-gradient(from_0deg,transparent_0_180deg,rgba(255,0,0,1)_270deg,rgba(255,0,0,1)_360deg)] animate-[spin_8s_linear_infinite] opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ animationDelay: "-2s" }} />
                  <div className="absolute inset-[-50%] z-0 bg-[conic-gradient(from_0deg,transparent_0_180deg,rgba(255,0,0,1)_270deg,rgba(255,0,0,1)_360deg)] animate-[spin_8s_linear_infinite] opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md" style={{ animationDelay: "-2s" }} />
                  <div className="absolute inset-[3px] bg-black/90 backdrop-blur-xl z-10 rounded-sm" />

                  <div className="absolute -right-20 -top-20 w-48 h-48 bg-red-500/10 rounded-full blur-[80px] group-hover:bg-red-500/30 transition-colors duration-500 z-10" />
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none z-10" />
                  
                  <div className="relative z-20 flex flex-col h-full">
                    {/* VARYANT 3: Sweeping Gradient (Soldan sağa ışık süzülmesi) */}
                    <div className="text-[10px] text-red-500/50 mb-1 font-mono uppercase hidden">Varyant 3: Light Sweep</div>
                    <h3 className="text-xl font-black mb-2 flex flex-col">
                      <span className="text-white group-hover:text-red-500 tracking-[0.1em] group-hover:tracking-[0.25em] transition-all duration-500 ease-out group-hover:drop-shadow-[0_0_8px_rgba(255,0,0,0.8)]">
                        HENGAME
                      </span>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-orange-500 text-3xl mt-1 tracking-widest">BOMB</span>
                    </h3>
                    <p className="text-gray-400 text-xs leading-relaxed mt-2 flex-1">{t("landing.modeBombDesc")}</p>
                  </div>
                </button>

                {/* ALAZ SENSÖR Card */}
                <button
                  onClick={() => {
                    SoundManager.getInstance().playSFX(sounds.CLICK);
                    navigate("/host/setup");
                  }}
                  className="relative group overflow-hidden bg-black/40 backdrop-blur-xl border border-white/10 hover:border-transparent p-8 rounded-sm text-left transition-all duration-500 shadow-[0_0_20px_rgba(0,0,0,0.5)]"
                >
                  {/* Animated glowing border background */}
                  <div className="absolute inset-[-50%] z-0 bg-[conic-gradient(from_0deg,transparent_0_180deg,rgba(255,0,255,1)_270deg,rgba(255,0,255,1)_360deg)] animate-[spin_8s_linear_infinite] opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ animationDelay: "-3s" }} />
                  <div className="absolute inset-[-50%] z-0 bg-[conic-gradient(from_0deg,transparent_0_180deg,rgba(255,0,255,1)_270deg,rgba(255,0,255,1)_360deg)] animate-[spin_8s_linear_infinite] opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-md" style={{ animationDelay: "-3s" }} />
                  <div className="absolute inset-[3px] bg-black/90 backdrop-blur-xl z-10 rounded-sm" />

                  <div className="absolute -right-20 -top-20 w-48 h-48 bg-neon-pink/10 rounded-full blur-[80px] group-hover:bg-neon-pink/30 transition-colors duration-500 z-10" />
                  <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none z-10" />
                  
                  <div className="relative z-20 flex flex-col h-full">
                    <h3 className="text-xl font-black text-white mb-2 tracking-widest group-hover:text-neon-pink transition-colors flex flex-col">
                      <span>HENGAME</span>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-neon-pink to-purple-500 text-3xl mt-1">SENSÖR</span>
                    </h3>
                    <p className="text-gray-400 text-xs leading-relaxed mt-2 flex-1">{t("landing.modeSensorDesc")}</p>
                  </div>
                </button>

              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isIdle && <AttractMode onClose={() => setIsIdle(false)} />}
      </AnimatePresence>
      </motion.div>
    </div>
  );
}
