import { useState, useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SoundManager, sounds } from "../lib/audio";
import { DURATION, EASE, SPRING } from "../lib/motion";
import { useLocale } from "../hooks/useLocale";
import { haptics } from "../lib/haptics";

interface LetterSpinnerProps {
  targetLetter: string;
  onComplete?: () => void;
}

const LETTERS = "ABCDEFGHIJKLMNOPRSTUVYZ".split("");

export function LetterSpinner({
  targetLetter,
  onComplete,
}: LetterSpinnerProps) {
  const { t } = useLocale();
  const [displayIndex, setDisplayIndex] = useState(0);
  const [phase, setPhase] = useState<"spinning" | "locking" | "locked" | "climax">("spinning");
  const [rpmGauge, setRpmGauge] = useState(100);
  const onCompleteRef = useRef(onComplete);

  const fallbackLetter = useMemo(
    () => LETTERS[Math.floor(Math.random() * LETTERS.length)],
    []
  );

  const effectiveLetter = useMemo(() => {
    return targetLetter && targetLetter.trim().length > 0
      ? targetLetter.trim().toUpperCase()
      : fallbackLetter;
  }, [targetLetter, fallbackLetter]);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // ═══════════════════════════════════════════════════════════════
  // KİNETİK ÇARK VE SES KOREOGRAFİSİ (BLENDER EEVEE / UNITY TIMELINE)
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    const startTime = Date.now();
    const spinDuration = 3000;
    let animFrame: number;
    let lastTickTime = 0;

    const tick = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / spinDuration);

      if (progress < 1) {
        // Yumuşak fiziksel yavaşlama (Cubic Ease-Out Inertia)
        const easeOut = 1 - Math.pow(1 - progress, 3.5);
        const nextIdx = Math.floor(easeOut * LETTERS.length * 10) % LETTERS.length;
        setDisplayIndex(nextIdx);

        // RPM Göstergesi
        const currentRpm = Math.max(5, Math.floor((1 - progress) * 100));
        setRpmGauge(currentRpm);

        // Hıza orantılı azalan tıkırtı efekti (mekanik dişli hissi) & Dokunsal titreşim
        const tickInterval = 40 + Math.pow(progress, 2) * 260;
        if (now - lastTickTime > tickInterval) {
          SoundManager.getInstance().playSFX(sounds.VOTE_TICK, 0.35);
          haptics.tap();
          lastTickTime = now;
        }

        animFrame = requestAnimationFrame(tick);
      } else {
        // Kilitleme Evresi
        setRpmGauge(0);
        setPhase("locking");
        SoundManager.getInstance().playSFX(sounds.CLICK, 0.5);
        haptics.impact();

        setTimeout(() => {
          setPhase("locked");
          SoundManager.getInstance().playSFX(sounds.CLICK, 0.5);
          haptics.impact();

          setTimeout(() => {
            setPhase("climax");
            haptics.impact();

            // Sinematik bitiş
            setTimeout(() => {
              onCompleteRef.current?.();
            }, 1200);
          }, 600);
        }, 500);
      }
    };

    animFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrame);
  }, []);

  return (
    <div className="relative w-full h-[520px] sm:h-[580px] md:h-[620px] flex flex-col items-center justify-center select-none overflow-hidden">
      {/* Üst HUD: Protokol Rozeti */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DURATION.base }}
        className="relative z-20 mb-6 flex flex-col items-center gap-2"
      >
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/60 border border-white/15">
          <span className="w-2 h-2 rounded-full bg-alaz-orange" />
          <span className="text-xs tabular-nums tracking-[0.3em] uppercase text-white/90">
            {t("arena.spinnerProtocol")}
          </span>
        </div>
      </motion.div>

      {/* Harf sahnesi: kutu/kart yok, yalnızca köşe işaretleri ve harf */}
      <div className="relative z-10 w-[300px] sm:w-[380px] md:w-[420px] h-[300px] sm:h-[340px] md:h-[360px] flex items-center justify-center perspective-[1200px]">
        {/* Hedefleme köşeleri */}
        <motion.div
          animate={
            phase === "locked"
              ? { scale: [1, 1.12, 0.96, 1], rotate: [0, -2, 2, 0] }
              : phase === "climax"
              ? { scale: [1, 1.2, 1.1] }
              : { scale: 1 }
          }
          transition={{ duration: 0.45, ease: EASE.out }}
          style={{ transformStyle: "preserve-3d" }}
          className="relative w-48 h-48 sm:w-60 sm:h-60 md:w-72 md:h-72 flex items-center justify-center pointer-events-none"
        >
          {/* Lazer Odaklama Köşebentleri (Optic Reticle) */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-accent rounded-tl-xl" />
            <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-accent rounded-tr-xl" />
            <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-accent rounded-bl-xl" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-accent rounded-br-xl" />
          </div>

          {/* Kilitlenme Şok Dalgası (Expanding Shockwave Ring) */}
          <AnimatePresence>
            {(phase === "locked" || phase === "climax") && (
              <motion.div
                initial={{ scale: 0.2, opacity: 0.9 }}
                animate={{ scale: 2.4, opacity: 0 }}
                transition={{ duration: 0.9, ease: EASE.out }}
                className="absolute inset-0 rounded-full border-2 border-alaz-orange pointer-events-none"
              />
            )}
          </AnimatePresence>

          {/* Dönen Harf veya Kilitlenen Hedef (Arka Yıldızları Asla Kapatmayan 3D Tipografi) */}
          <div className="relative z-10 w-full h-full flex items-center justify-center [transform-style:preserve-3d]">
            <AnimatePresence mode="popLayout">
              {phase === "spinning" ? (
                <motion.div
                  key={`spin-${displayIndex}`}
                  initial={{ opacity: 0, scale: 0.65, rotateX: 90, z: -60 }}
                  animate={{ opacity: 1, scale: 1, rotateX: 0, z: 0 }}
                  exit={{ opacity: 0, scale: 1.25, rotateX: -90, z: 60 }}
                  transition={{ duration: 0.11, ease: "linear" }}
                  className="text-7xl sm:text-8xl md:text-[9.5rem] font-black tracking-tight text-white font-sans select-none"
                >
                  {LETTERS[displayIndex]}
                </motion.div>
              ) : (
                <motion.div
                  key={`target-${effectiveLetter}`}
                  initial={{ scale: 0.15, opacity: 0, rotateY: -60, z: -120 }}
                  animate={{ scale: [0.15, 1.25, 0.96, 1.05, 1], opacity: 1, rotateY: 0, z: 0 }}
                  transition={SPRING.bouncy}
                  className="text-8xl sm:text-9xl md:text-[12.5rem] font-black tracking-tighter text-accent select-none will-change-transform"
                >
                  {effectiveLetter}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>

      {/* Alt HUD: Kinetik Durum & Takometre */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DURATION.base, delay: 0.1 }}
        className="relative z-20 mt-8 flex flex-col items-center gap-3"
      >
        <div className="text-sm md:text-base tabular-nums tracking-[0.25em] font-bold text-alaz-orange flex items-center gap-2">
          {phase === "spinning" ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              <span>{t("arena.spinnerResolving")}</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-alaz-orange" />
              <span className="text-white">
                {t("arena.spinnerLocked")}
              </span>
            </>
          )}
        </div>

        {/* Kinetik RPM Gösterge Çubuğu */}
        <div className="w-64 h-1.5 bg-white/10 rounded-full overflow-hidden border border-white/10 relative">
          <motion.div
            className="h-full bg-accent"
            style={{ width: `${rpmGauge}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════
          CLIMAX ŞOK DALGASI & IŞIK PATLAMASI (CINEMATIC SHOCKWAVE)
          ═══════════════════════════════════════════════════════════════ */}
      <AnimatePresence>
        {phase === "climax" && (
          <div className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center overflow-hidden">
            {/* 1-Karelik Flaş */}
            <motion.div
              initial={{ opacity: 0.85 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.45, ease: EASE.out }}
              className="absolute inset-0 bg-white"
            />

          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
