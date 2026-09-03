import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useLocale } from "../../hooks/useLocale";
import { PitchFeatureCard } from "./components/PitchFeatureCard";
import { BackgroundSlider } from "../../components/BackgroundSlider";
import { Smartphone, Zap, Tv, ArrowRight, CheckCircle2, Crown } from "lucide-react";
import { LanguageSwitcher } from "../../components/LanguageSwitcher";

export function B2BPitchPage() {
  const { t } = useLocale();
  const containerRef = useRef<HTMLDivElement>(null);
  const [showFloatingCTA, setShowFloatingCTA] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "40%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  useEffect(() => {
    const handleScroll = () => {
      setShowFloatingCTA(window.scrollY > window.innerHeight * 0.7);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#020204] text-white font-sans overflow-x-hidden relative selection:bg-alaz-orange/30 selection:text-white"
    >
      <div className="absolute top-6 right-6 z-50">
        <LanguageSwitcher />
      </div>

      {/* Ambient Background Orbs */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <motion.div 
          animate={{ x: [0, 100, 0], y: [0, -50, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-alaz-orange/10 rounded-full blur-[150px]" 
        />
        <motion.div 
          animate={{ x: [0, -80, 0], y: [0, 100, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear", delay: 2 }}
          className="absolute bottom-[-10%] left-[-5%] w-[800px] h-[800px] bg-neon-blue/10 rounded-full blur-[200px]" 
        />
      </div>

      {/* ═════════ HERO SECTION ═════════ */}
      <section className="relative min-h-[100svh] flex flex-col items-center justify-center pt-20 pb-10 overflow-hidden">
        <div className="absolute inset-0 opacity-40 mix-blend-screen pointer-events-none z-0">
           <BackgroundSlider />
        </div>
        
        {/* Vignette Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#020204_100%)] z-10 pointer-events-none" />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-20 text-center px-4 max-w-5xl mx-auto flex flex-col items-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9, filter: "blur(10px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="mb-10"
          >
            <div className="relative w-28 h-28 rounded-full bg-black/40 flex items-center justify-center border border-white/10 backdrop-blur-md mx-auto group">
              <div className="absolute inset-0 rounded-full border border-alaz-orange/30 animate-[spin_10s_linear_infinite]" />
              <div className="absolute inset-[-20px] bg-alaz-orange/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
              <span className="font-black text-5xl text-alaz-orange tracking-tighter relative z-10 drop-shadow-[0_0_15px_rgba(255,77,0,0.8)]">A</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/10 mb-6 backdrop-blur-md"
          >
            <Crown className="w-4 h-4 text-amber-400" />
            <span className="text-xs font-bold tracking-[0.2em] text-gray-300 uppercase">Premium Business Solution</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-5xl md:text-7xl lg:text-[5rem] font-black text-white uppercase tracking-tighter leading-[1.1] mb-8"
          >
            {t("b2b.heroTitle")}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.8 }}
            className="text-lg md:text-2xl text-gray-400 font-light max-w-3xl leading-relaxed tracking-wide"
          >
            {t("b2b.heroSubtitle")}
          </motion.p>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-12 z-20 flex flex-col items-center gap-4"
        >
          <span className="text-[10px] uppercase tracking-[0.3em] text-gray-500 font-bold">Discover</span>
          <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-white/50 to-white/0 animate-[pulse_3s_ease-in-out_infinite]" />
        </motion.div>
      </section>

      {/* ═════════ THE PROBLEM & SOLUTION ═════════ */}
      <section className="relative z-20 py-32 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
          {/* Problem */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="group p-12 rounded-[2rem] bg-gradient-to-br from-white/[0.03] to-transparent border border-white/5 flex flex-col justify-center relative overflow-hidden backdrop-blur-xl"
          >
            <div className="absolute top-0 right-0 w-96 h-96 bg-red-500/5 blur-[120px] rounded-full group-hover:bg-red-500/10 transition-colors duration-1000" />
            <h2 className="text-xs font-black text-red-500/80 tracking-[0.4em] uppercase mb-6 flex items-center gap-3">
              <span className="w-8 h-[1px] bg-red-500/50" />
              {t("b2b.problemTitle")}
            </h2>
            <p className="text-2xl md:text-4xl text-gray-400 font-light leading-snug tracking-wide">
              {t("b2b.problemDesc")}
            </p>
          </motion.div>

          {/* Solution */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            className="group p-12 rounded-[2rem] bg-gradient-to-br from-neon-blue/[0.05] to-transparent border border-neon-blue/20 flex flex-col justify-center relative overflow-hidden backdrop-blur-xl shadow-[0_0_80px_rgba(34,211,238,0.03)]"
          >
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-neon-blue/10 blur-[120px] rounded-full group-hover:bg-neon-blue/20 transition-colors duration-1000" />
            <h2 className="text-xs font-black text-neon-blue tracking-[0.4em] uppercase mb-6 flex items-center gap-3">
              <span className="w-8 h-[1px] bg-neon-blue/50" />
              {t("b2b.solutionTitle")}
            </h2>
            <p className="text-2xl md:text-4xl text-white font-medium leading-snug tracking-wide drop-shadow-md">
              {t("b2b.solutionDesc")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ═════════ FEATURES GRID ═════════ */}
      <section className="relative z-20 py-32 px-4 bg-gradient-to-b from-transparent via-black/50 to-transparent">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <PitchFeatureCard
            title={t("b2b.feature1Title")}
            description={t("b2b.feature1Desc")}
            icon={<Smartphone className="w-8 h-8" />}
            glowColor="cyan"
            delay={0.1}
          />
          <PitchFeatureCard
            title={t("b2b.feature2Title")}
            description={t("b2b.feature2Desc")}
            icon={<Zap className="w-8 h-8" />}
            glowColor="orange"
            delay={0.2}
          />
          <PitchFeatureCard
            title={t("b2b.feature3Title")}
            description={t("b2b.feature3Desc")}
            icon={<Tv className="w-8 h-8" />}
            glowColor="purple"
            delay={0.3}
          />
        </div>
      </section>

      {/* ═════════ ROI & CTA ═════════ */}
      <section className="relative z-20 py-40 px-4 flex flex-col items-center text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-alaz-orange/10 to-transparent pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-alaz-orange/10 blur-[150px] rounded-[100%] pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative z-10 max-w-4xl"
        >
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-black tracking-[0.3em] uppercase mb-10 backdrop-blur-sm">
            <CheckCircle2 className="w-4 h-4" /> {t("b2b.roiTitle")}
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-white mb-12 leading-tight tracking-wide">
            {t("b2b.roiDesc")}
          </h2>

          <a
            href="mailto:contact@alazneon.com"
            className="group relative inline-flex items-center justify-center gap-4 px-12 py-6 bg-white text-black font-black text-lg md:text-xl rounded-full uppercase tracking-[0.2em] overflow-hidden transition-transform hover:scale-105 active:scale-95"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-alaz-orange to-amber-400 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <span className="relative z-10 group-hover:text-white transition-colors duration-500">{t("b2b.ctaButton")}</span>
            <ArrowRight className="w-6 h-6 relative z-10 group-hover:text-white group-hover:translate-x-2 transition-all duration-500" />
          </a>
        </motion.div>
      </section>

      {/* Floating CTA (visible on scroll) */}
      <motion.div
        initial={{ y: 120 }}
        animate={{ y: showFloatingCTA ? 0 : 120 }}
        transition={{ type: "spring", stiffness: 260, damping: 20 }}
        className="fixed bottom-6 left-0 right-0 z-50 flex justify-center pointer-events-none px-4"
      >
        <a
          href="mailto:contact@alazneon.com"
          className="pointer-events-auto flex items-center gap-4 px-8 py-4 bg-[#0a0a0f]/80 backdrop-blur-2xl border border-white/10 text-white font-bold text-sm md:text-base rounded-full shadow-[0_20px_40px_rgba(0,0,0,0.4)] hover:border-alaz-orange/50 hover:bg-[#0a0a0f] transition-all hover:scale-105"
        >
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-alaz-orange opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-alaz-orange"></span>
          </span>
          <span className="tracking-widest uppercase">{t("b2b.ctaButton")}</span>
        </a>
      </motion.div>
    </div>
  );
}
