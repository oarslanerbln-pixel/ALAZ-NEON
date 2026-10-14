import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { AuroraBackdrop } from "../../../components/fx/AuroraBackdrop";
import { BeamBorder } from "../../../components/fx/BeamBorder";
import { GridPattern } from "../../../components/fx/GridPattern";
import { RevealText } from "../../../components/fx/RevealText";
import { useLocale } from "../../../hooks/useLocale";
import { SoundManager, sounds } from "../../../lib/audio";
import { DURATION, EASE, SPRING } from "../../../lib/motion";

export interface IntroStep {
  icon: string;
  text: string;
}

interface GameIntroCinematicProps {
  /** Başlığın üstündeki küçük satır (ör. "HENGAME"). */
  eyebrow: string;
  title: string;
  subtitle?: string;
  /** "Nasıl oynanır" kartları — en fazla üç, her biri tek kısa cümle. */
  steps: readonly IntroStep[];
  /** Bağlı oyuncuların adları — başlığın altında kısa bir yoklama gibi akar. */
  roster?: readonly string[];
  /** Vurgu renkleri, "r,g,b": [ana, ikincil]. */
  rgb: readonly [string, string];
  onComplete: () => void;
}

/** Sahne süreleri (ms). Toplam ~10.5 sn: eski siberpunk açılıştan 3 sn kısa. */
export const INTRO_TIMELINE = { title: 3_000, rules: 4_500, countFrom: 3 } as const;
export const INTRO_TOTAL_MS = INTRO_TIMELINE.title + INTRO_TIMELINE.rules + INTRO_TIMELINE.countFrom * 1000;

type Phase = "title" | "rules" | "count";

/** Yoklamada gösterilen en fazla isim; fazlası "+N" olur. */
const ROSTER_MAX = 14;

/**
 * Oyunların ortak TV açılışı: başlık → nasıl oynanır → 3-2-1.
 *
 * Eski quiz açılışı "SİSTEM HACKLENDİ / SECURITY BREACH" sahnesi, siren ve
 * saniyede 5 kez yanıp sönen kırmızı bir kutuydu: kafede misafire "sistem
 * çöktü" dedirtiyordu ve saniyede 3'ten fazla parlama WCAG 2.3.1 (ışığa
 * duyarlı epilepsi) eşiğini aşıyordu. Bu sahne aynı heyecanı ışık ve
 * tipografiyle veriyor; misafir 10 saniyede oyunun kuralını da öğreniyor.
 */
export function GameIntroCinematic({ eyebrow, title, subtitle, roster = [], steps, rgb, onComplete }: GameIntroCinematicProps) {
  const { t } = useLocale();
  const [phase, setPhase] = useState<Phase>("title");
  const [count, setCount] = useState<number>(INTRO_TIMELINE.countFrom);

  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Tüm zaman çizelgesi tek efektte: yeniden render'lar sayaçları sıfırlamaz.
  useEffect(() => {
    const sfx = SoundManager.getInstance();
    sfx.playSFX(sounds.CINEMATIC_BOOM, 0.6);
    const timers: ReturnType<typeof setTimeout>[] = [];
    const at = (ms: number, fn: () => void) => timers.push(setTimeout(fn, ms));

    at(INTRO_TIMELINE.title, () => setPhase("rules"));
    const countStart = INTRO_TIMELINE.title + INTRO_TIMELINE.rules;
    for (let i = 0; i < INTRO_TIMELINE.countFrom; i++) {
      at(countStart + i * 1000, () => {
        if (i === 0) setPhase("count");
        setCount(INTRO_TIMELINE.countFrom - i);
        sfx.playSFX(sounds.VOTE_TICK);
      });
    }
    at(INTRO_TOTAL_MS, () => {
      sfx.playSFX(sounds.START);
      onCompleteRef.current();
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  const [primary, secondary] = rgb;

  return (
    <div className="fixed inset-0 z-[100] bg-[#030307] text-white overflow-hidden flex items-center justify-center">
      <AuroraBackdrop colors={[primary, secondary, primary]} intensity={0.22} />
      <GridPattern />

      <AnimatePresence mode="wait">
        {phase === "title" && (
          <motion.div
            key="title"
            className="relative flex flex-col items-center text-center px-16"
            exit={{ opacity: 0, scale: 0.96, transition: { duration: DURATION.base, ease: EASE.in } }}
          >
            <motion.p
              initial={{ opacity: 0, letterSpacing: "0.2em" }}
              animate={{ opacity: 1, letterSpacing: "0.6em" }}
              transition={{ duration: DURATION.cinematic, ease: EASE.out }}
              className="flex items-center gap-6 text-2xl font-black uppercase"
              style={{ color: `rgb(${primary})` }}
            >
              <span className="h-px w-16 bg-current opacity-50" aria-hidden="true" />
              {eyebrow}
              <span className="h-px w-16 bg-current opacity-50" aria-hidden="true" />
            </motion.p>

            <RevealText
              text={title}
              delay={0.25}
              stagger={0.12}
              className="mt-6 text-[170px] leading-[0.95] font-black uppercase tracking-tight bg-gradient-to-b from-white via-white to-white/60 bg-clip-text text-transparent"
            />

            {subtitle && (
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.1, duration: DURATION.slow, ease: EASE.out }}
                className="mt-8 text-4xl font-black uppercase tracking-[0.4em]"
                style={{ color: `rgb(${secondary})`, textShadow: `0 0 40px rgba(${secondary},0.45)` }}
              >
                {subtitle}
              </motion.p>
            )}

            {roster.length > 0 && (
              <div className="mt-14 flex max-w-[1400px] flex-wrap justify-center gap-3">
                {roster.slice(0, ROSTER_MAX).map((name, i) => (
                  <motion.span
                    key={`${name}-${i}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1.4 + i * 0.06, duration: DURATION.base, ease: EASE.out }}
                    className="rounded-full border border-white/10 bg-white/[0.05] px-5 py-2 text-2xl font-bold text-white/80"
                  >
                    {name}
                  </motion.span>
                ))}
                {roster.length > ROSTER_MAX && (
                  <span className="rounded-full px-5 py-2 text-2xl font-bold text-white/50">+{roster.length - ROSTER_MAX}</span>
                )}
              </div>
            )}
          </motion.div>
        )}

        {phase === "rules" && (
          <motion.div
            key="rules"
            className="relative w-full max-w-[1500px] px-16 flex flex-col items-center"
            exit={{ opacity: 0, y: -24, transition: { duration: DURATION.base, ease: EASE.in } }}
          >
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: DURATION.slow, ease: EASE.out }}
              className="text-2xl font-black uppercase tracking-[0.5em] text-white/50"
            >
              {t("intro.howToPlay")}
            </motion.p>

            <div className="mt-14 grid w-full gap-8" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
              {steps.map((step, i) => (
                <motion.div
                  key={step.text}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...SPRING.gentle, delay: 0.2 + i * 0.18 }}
                >
                  <BeamBorder rgb={i % 2 ? secondary : primary} duration={5 + i} radius="2rem" className="h-full" innerClassName="bg-[#07070c]/95">
                    <div className="h-full flex flex-col items-start gap-6 p-10">
                      <div className="flex w-full items-center justify-between">
                        <span className="text-7xl leading-none" aria-hidden="true">{step.icon}</span>
                        <span className="text-5xl font-black tabular-nums text-white/15">{String(i + 1).padStart(2, "0")}</span>
                      </div>
                      <p className="text-4xl font-bold leading-snug text-white text-balance">{step.text}</p>
                    </div>
                  </BeamBorder>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {phase === "count" && (
          <motion.div
            key="count"
            className="relative flex flex-col items-center gap-12"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.08, transition: { duration: DURATION.base, ease: EASE.in } }}
          >
            <BeamBorder rgb={primary} duration={1} thickness={3} radius="9999px" className="w-[420px] h-[420px]" innerClassName="bg-[#05050a]">
              <div className="w-full h-full flex items-center justify-center rounded-full" style={{ boxShadow: `inset 0 0 120px rgba(${primary},0.18)` }}>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={count}
                    initial={{ opacity: 0, scale: 1.6 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.6 }}
                    transition={{ duration: DURATION.base, ease: EASE.out }}
                    className="text-[240px] font-black leading-none tabular-nums"
                    style={{ textShadow: `0 0 60px rgba(${primary},0.6)` }}
                  >
                    {count}
                  </motion.span>
                </AnimatePresence>
              </div>
            </BeamBorder>
            <p className="text-3xl font-black uppercase tracking-[0.45em] text-white/60">{t("intro.phonesReady")}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
