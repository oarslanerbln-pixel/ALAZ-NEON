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


      {/* ═════════ HERO SECTION ═════════ */}
      <section className="relative min-h-[100svh] flex flex-col items-center justify-center pt-20 pb-10 overflow-hidden">
        <div className="absolute inset-0 opacity-40 pointer-events-none z-0">
           <BackgroundSlider />
        </div>


        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-20 text-center px-4 max-w-5xl mx-auto flex flex-col items-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="mb-10"
          >
            <div className="surface-2 relative w-28 h-28 rounded-full flex items-center justify-center mx-auto">
              <span className="font-black text-5xl text-alaz-orange tracking-tighter relative z-10">A</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/10 mb-6"
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
          <span className="text-xs uppercase tracking-[0.3em] text-gray-500 font-bold">Discover</span>
          <div className="w-[1px] h-16 bg-white/30" />
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
            className="surface p-12 rounded-[2rem] flex flex-col justify-center relative overflow-hidden"
          >

            <h2 className="text-xs font-black text-bad tracking-[0.4em] uppercase mb-6 flex items-center gap-3">
              <span className="w-8 h-[1px] bg-bad/50" />
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
            className="surface p-12 rounded-[2rem] border-accent/40 flex flex-col justify-center relative overflow-hidden"
          >

            <h2 className="text-xs font-black text-accent tracking-[0.4em] uppercase mb-6 flex items-center gap-3">
              <span className="w-8 h-[1px] bg-accent/50" />
              {t("b2b.solutionTitle")}
            </h2>
            <p className="text-2xl md:text-4xl text-white font-medium leading-snug tracking-wide">
              {t("b2b.solutionDesc")}
            </p>
          </motion.div>
        </div>
      </section>

      {/* ═════════ FEATURES GRID ═════════ */}
      <section className="relative z-20 py-32 px-4">
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

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative z-10 max-w-4xl"
        >
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-ok/10 border border-ok/30 text-ok text-xs font-black tracking-[0.3em] uppercase mb-10">
            <CheckCircle2 className="w-4 h-4" /> {t("b2b.roiTitle")}
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-light text-white mb-12 leading-tight tracking-wide">
            {t("b2b.roiDesc")}
          </h2>

          <a
            href="mailto:contact@alazneon.com"
            className="btn-primary group relative inline-flex items-center justify-center gap-4 px-12 py-6 font-black text-lg md:text-xl rounded-full uppercase tracking-[0.2em]"
          >
            <span>{t("b2b.ctaButton")}</span>
            <ArrowRight className="w-6 h-6" />
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
          className="pointer-events-auto flex items-center gap-4 px-8 py-4 bg-[#0a0a0f] border border-white/10 text-white font-bold text-sm md:text-base rounded-full hover:border-accent/50 hover:bg-[#0a0a0f] transition-colors"
        >
          <span className="inline-flex rounded-full h-3 w-3 bg-accent"></span>
          <span className="tracking-widest uppercase">{t("b2b.ctaButton")}</span>
        </a>
      </motion.div>
    </div>
  );
}
