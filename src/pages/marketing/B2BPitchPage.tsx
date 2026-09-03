import { motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useLocale } from "../../hooks/useLocale";
import { PitchFeatureCard } from "./components/PitchFeatureCard";
import { BackgroundSlider } from "../../components/BackgroundSlider";
import { Smartphone, Zap, Tv, ArrowRight, CheckCircle2 } from "lucide-react";
import { LanguageSwitcher } from "../../components/LanguageSwitcher";

export function B2BPitchPage() {
  const { t } = useLocale();
  const containerRef = useRef<HTMLDivElement>(null);
  const [showFloatingCTA, setShowFloatingCTA] = useState(false);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  useEffect(() => {
    const handleScroll = () => {
      setShowFloatingCTA(window.scrollY > window.innerHeight * 0.8);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-[#030307] text-white font-sans overflow-x-hidden relative"
    >
      <div className="absolute top-6 right-6 z-50">
        <LanguageSwitcher />
      </div>

      {/* ═════════ HERO SECTION ═════════ */}
      <section className="relative h-screen flex flex-col items-center justify-center pt-20 overflow-hidden">
        <BackgroundSlider />
        <div className="absolute inset-0 bg-gradient-to-b from-[#030307]/40 via-[#030307]/80 to-[#030307] z-10 pointer-events-none" />

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-20 text-center px-4 max-w-4xl mx-auto flex flex-col items-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="mb-8"
          >
            <div className="w-24 h-24 rounded-full bg-alaz-orange/20 flex items-center justify-center border border-alaz-orange/40 shadow-[0_0_50px_rgba(255,77,0,0.3)] mb-6 mx-auto">
              <span className="font-black text-4xl text-alaz-orange tracking-tighter">ALAZ</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-gray-500 uppercase tracking-tight mb-6"
          >
            {t("b2b.heroTitle")}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-2xl text-gray-400 font-medium max-w-2xl leading-relaxed"
          >
            {t("b2b.heroSubtitle")}
          </motion.p>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-10 z-20 flex flex-col items-center gap-2"
        >
          <div className="w-[1px] h-12 bg-gradient-to-b from-transparent via-white/50 to-white/0 animate-pulse-slow" />
        </motion.div>
      </section>

      {/* ═════════ THE PROBLEM & SOLUTION ═════════ */}
      <section className="relative z-20 py-32 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16">
          {/* Problem */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8 }}
            className="p-10 rounded-3xl bg-red-900/10 border border-red-500/20 flex flex-col justify-center relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/10 blur-[100px]" />
            <h2 className="text-sm font-black text-red-500 tracking-[0.3em] uppercase mb-4">
              {t("b2b.problemTitle")}
            </h2>
            <p className="text-2xl md:text-3xl text-gray-300 font-medium leading-relaxed">
              {t("b2b.problemDesc")}
            </p>
          </motion.div>

          {/* Solution */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="p-10 rounded-3xl bg-neon-blue/10 border border-neon-blue/30 flex flex-col justify-center relative overflow-hidden shadow-[0_0_50px_rgba(34,211,238,0.1)]"
          >
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-neon-blue/10 blur-[100px]" />
            <h2 className="text-sm font-black text-neon-blue tracking-[0.3em] uppercase mb-4">
              {t("b2b.solutionTitle")}
            </h2>
            <p className="text-2xl md:text-3xl text-white font-medium leading-relaxed">
              {t("b2b.solutionDesc")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ═════════ FEATURES GRID ═════════ */}
      <section className="relative z-20 py-20 px-4 bg-[#050508]">
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
      <section className="relative z-20 py-32 px-4 flex flex-col items-center text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-t from-alaz-orange/20 to-transparent pointer-events-none opacity-50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-alaz-orange/10 blur-[200px] rounded-full pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative z-10 max-w-3xl"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30 text-green-400 text-xs font-black tracking-widest uppercase mb-8">
            <CheckCircle2 className="w-4 h-4" /> {t("b2b.roiTitle")}
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white mb-8 leading-tight">
            {t("b2b.roiDesc")}
          </h2>

          <a
            href="mailto:contact@alazneon.com"
            className="inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-alaz-orange to-amber-500 text-black font-black text-lg md:text-xl rounded-full uppercase tracking-widest shadow-[0_0_40px_rgba(255,77,0,0.4)] hover:brightness-110 transition-all hover:scale-105 active:scale-95 cursor-pointer"
          >
            {t("b2b.ctaButton")}
            <ArrowRight className="w-6 h-6" />
          </a>
        </motion.div>
      </section>

      {/* Floating CTA (visible on scroll) */}
      <motion.div
        initial={{ y: 100 }}
        animate={{ y: showFloatingCTA ? 0 : 100 }}
        className="fixed bottom-0 left-0 right-0 p-4 z-50 flex justify-center pointer-events-none"
      >
        <a
          href="mailto:contact@alazneon.com"
          className="pointer-events-auto flex items-center gap-3 px-8 py-4 bg-[#0a0a0f]/90 backdrop-blur-xl border border-white/10 text-white font-bold text-sm md:text-base rounded-full shadow-2xl hover:border-alaz-orange/50 transition-colors"
        >
          <span className="w-2 h-2 rounded-full bg-alaz-orange animate-pulse" />
          {t("b2b.ctaButton")}
        </a>
      </motion.div>
    </div>
  );
}
