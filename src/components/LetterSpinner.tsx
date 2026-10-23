import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SoundManager, sounds } from "../lib/audio";
import { DURATION, EASE, SPRING } from "../lib/motion";
import { useLocale } from "../hooks/useLocale";

interface LetterSpinnerProps {
  targetLetter: string;
  onComplete: () => void;
}

const LETTERS = "ABCDEFGHIJKLMNOPRSTUVYZ".split("");

interface Particle3D {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  size: number;
  color: string;
  alpha: number;
  maxLife: number;
  life: number;
}

export function LetterSpinner({
  targetLetter,
  onComplete,
}: LetterSpinnerProps) {
  const { t } = useLocale();
  const [displayIndex, setDisplayIndex] = useState(0);
  const [phase, setPhase] = useState<"spinning" | "locking" | "locked" | "climax">("spinning");
  const [rpmGauge, setRpmGauge] = useState(100);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
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
  // 60 FPS APU-DOSTU 3D VOLUMETRİK PARÇACIK VE IŞIK HÜZMESİ SİSTEMİ
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();

    const particles: Particle3D[] = [];
    const colors = ["#ff5500", "#ffaa00", "#00f3ff", "#ffffff"];
    const maxParticles = 65;

    const createParticle = (): Particle3D => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.2 + Math.random() * 3.5;
      const dist = 30 + Math.random() * 80;
      return {
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        z: Math.random() * 200 - 100,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        vz: (Math.random() - 0.5) * 2,
        size: 1.5 + Math.random() * 3.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        alpha: 0.1 + Math.random() * 0.7,
        maxLife: 45 + Math.random() * 55,
        life: 0,
      };
    };

    let running = true;
    const render = () => {
      if (!running) return;
      const rect = canvas.getBoundingClientRect();
      const cx = rect.width / 2;
      const cy = rect.height / 2;

      ctx.clearRect(0, 0, rect.width, rect.height);

      // Yeni parçacık üretimi
      if (particles.length < maxParticles) {
        particles.push(createParticle());
      }

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        const progress = p.life / p.maxLife;
        const currentAlpha = p.alpha * (1 - progress);

        // 3D Perspektif İzdüşümü
        const fov = 300;
        const scale = fov / (fov + p.z);
        const px = cx + p.x * scale;
        const py = cy + p.y * scale;
        const pSize = p.size * scale;

        if (progress >= 1 || px < 0 || px > rect.width || py < 0 || py > rect.height) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = currentAlpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 8 * scale;
        ctx.beginPath();
        ctx.arc(px, py, Math.max(0.5, pSize), 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    window.addEventListener("resize", resize);
    return () => {
      running = false;
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

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

        // Hıza orantılı azalan tıkırtı efekti (mekanik dişli hissi)
        const tickInterval = 40 + Math.pow(progress, 2) * 260;
        if (now - lastTickTime > tickInterval) {
          SoundManager.getInstance().playSFX(sounds.VOTE_TICK, 0.35);
          lastTickTime = now;
        }

        animFrame = requestAnimationFrame(tick);
      } else {
        // Kilitleme Evresi
        setRpmGauge(0);
        setPhase("locking");
        SoundManager.getInstance().playSFX(sounds.CLICK, 0.6);

        setTimeout(() => {
          setPhase("locked");
          SoundManager.getInstance().playSFX(sounds.BURN, 0.8);

          setTimeout(() => {
            setPhase("climax");
            SoundManager.getInstance().playSFX(sounds.CINEMATIC_BOOM, 0.7);

            // Patlama ve sinematik bitiş
            setTimeout(() => {
              onCompleteRef.current();
            }, 1600);
          }, 800);
        }, 600);
      }
    };

    animFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrame);
  }, []);

  return (
    <div className="relative w-full h-[620px] flex flex-col items-center justify-center select-none overflow-hidden">
      {/* 3D Hacimsel Parçacık Tuvali */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0 opacity-80"
      />

      {/* Üst HUD: Cyberpunk Protokol Rozeti */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DURATION.base }}
        className="relative z-20 mb-6 flex flex-col items-center gap-2"
      >
        <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/60 border border-white/15 backdrop-blur-xl shadow-[0_0_20px_rgba(255,85,0,0.15)]">
          <span className="w-2 h-2 rounded-full bg-alaz-orange animate-pulse" />
          <span className="text-[11px] font-mono tracking-[0.3em] uppercase text-white/90">
            {t("arena.spinnerProtocol")}
          </span>
        </div>
      </motion.div>

      {/* ═══════════════════════════════════════════════════════════════
          3D JİROSKOPİK HALKALAR & HOLOGRAFİK KRİSTAL MONOLİT
          ═══════════════════════════════════════════════════════════════ */}
      <div className="relative z-10 w-[420px] h-[360px] flex items-center justify-center perspective-[1200px]">
        {/* Ortam Işık Aurası (Ambient Volumetric Glow) */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-tr from-alaz-orange/20 via-neon-blue/15 to-amber-400/20 blur-[90px] rounded-full pointer-events-none -z-10"
        />

        {/* 3D Jiroskop Halkası 1 (Dış — Plazma Cyan) */}
        <motion.div
          aria-hidden="true"
          animate={{
            rotateX: [0, 360],
            rotateY: [360, 0],
            rotateZ: [0, 180, 360],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          style={{ transformStyle: "preserve-3d" }}
          className="absolute w-84 h-84 rounded-full border border-cyan-400/35 border-dashed shadow-[0_0_35px_rgba(0,243,255,0.25)] pointer-events-none"
        />

        {/* 3D Jiroskop Halkası 2 (Orta — Alaz Turuncu) */}
        <motion.div
          aria-hidden="true"
          animate={{
            rotateX: [360, 0],
            rotateY: [0, 360],
            rotateZ: [180, 360, 180],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
          style={{ transformStyle: "preserve-3d" }}
          className="absolute w-72 h-72 rounded-full border-2 border-alaz-orange/45 shadow-[0_0_30px_rgba(255,85,0,0.3)] pointer-events-none border-t-transparent border-b-transparent"
        />

        {/* 3D Jiroskop Halkası 3 (İç — Altın Kor) */}
        <motion.div
          aria-hidden="true"
          animate={{
            rotateX: [180, -180],
            rotateY: [180, -180],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          style={{ transformStyle: "preserve-3d" }}
          className="absolute w-60 h-60 rounded-full border border-amber-300/50 shadow-[0_0_25px_rgba(251,191,36,0.25)] pointer-events-none"
        />

        {/* ═══════════════════════════════════════════════════════════
            MERKEZİ HOLOGRAFİK CAM MONOLİT (HOLO-PRISM CORE)
            ═══════════════════════════════════════════════════════════ */}
        <motion.div
          animate={
            phase === "locked"
              ? { scale: [1, 1.08, 0.98, 1], rotate: [0, -1, 1, 0] }
              : phase === "climax"
              ? { scale: [1, 1.15, 1.08] }
              : { scale: 1 }
          }
          transition={{ duration: 0.45, ease: EASE.out }}
          className="relative w-52 h-52 md:w-60 md:h-60 rounded-3xl bg-black/40 backdrop-blur-2xl border border-white/25 shadow-[0_25px_60px_rgba(0,0,0,0.8),inset_0_0_35px_rgba(255,255,255,0.08)] flex items-center justify-center overflow-hidden"
        >
          {/* Fasetli Cam Yansımaları */}
          <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-white/5 pointer-events-none" />
          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-alaz-orange/20 to-transparent rotate-45 pointer-events-none" />

          {/* Dönen Harf veya Kilitlenen Hedef */}
          <div className="relative z-10 w-full h-full flex items-center justify-center">
            <AnimatePresence mode="popLayout">
              {phase === "spinning" ? (
                <motion.div
                  key={`spin-${displayIndex}`}
                  initial={{ opacity: 0, scale: 0.7, rotateX: 90 }}
                  animate={{ opacity: 1, scale: 1, rotateX: 0 }}
                  exit={{ opacity: 0, scale: 1.25, rotateX: -90 }}
                  transition={{ duration: 0.12 }}
                  className="text-8xl md:text-[8.5rem] font-black tracking-tight text-white font-sans select-none drop-shadow-[0_0_25px_rgba(255,255,255,0.5)]"
                >
                  {LETTERS[displayIndex]}
                </motion.div>
              ) : (
                <motion.div
                  key={`target-${effectiveLetter}`}
                  initial={{ scale: 0.2, opacity: 0, rotate: -30 }}
                  animate={{ scale: 1, opacity: 1, rotate: 0 }}
                  transition={SPRING.bouncy}
                  className="text-9xl md:text-[10.5rem] font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white via-amber-200 to-alaz-orange drop-shadow-[0_0_45px_rgba(255,85,0,0.9)] select-none"
                >
                  {effectiveLetter}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Monolit Köşe Vurguları */}
          <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-white/60 pointer-events-none" />
          <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-white/60 pointer-events-none" />
          <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-white/60 pointer-events-none" />
          <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-white/60 pointer-events-none" />
        </motion.div>
      </div>

      {/* Alt HUD: Kinetik Durum & Takometre */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: DURATION.base, delay: 0.1 }}
        className="relative z-20 mt-8 flex flex-col items-center gap-3"
      >
        <div className="text-sm md:text-base font-mono tracking-[0.25em] font-bold text-alaz-orange flex items-center gap-2">
          {phase === "spinning" ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              <span>{t("arena.spinnerResolving")}</span>
            </>
          ) : (
            <>
              <span className="w-2 h-2 rounded-full bg-alaz-orange" />
              <span className="text-white drop-shadow-[0_0_15px_rgba(255,85,0,0.8)]">
                {t("arena.spinnerLocked")}
              </span>
            </>
          )}
        </div>

        {/* Kinetik RPM Gösterge Çubuğu */}
        <div className="w-64 h-1.5 bg-white/10 rounded-full overflow-hidden border border-white/10 relative">
          <motion.div
            className="h-full bg-gradient-to-r from-neon-blue via-amber-400 to-alaz-orange"
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
              className="absolute inset-0 bg-white mix-blend-overlay"
            />

            {/* Genişleyen Holografik Şok Dalgası 1 */}
            <motion.div
              initial={{ scale: 0.2, opacity: 1 }}
              animate={{ scale: 7, opacity: 0 }}
              transition={{ duration: 1.2, ease: EASE.out }}
              className="absolute w-72 h-72 rounded-full border-4 border-alaz-orange shadow-[0_0_50px_#ff5500] will-change-transform"
            />

            {/* Genişleyen Şok Dalgası 2 (Cyan Plazma) */}
            <motion.div
              initial={{ scale: 0.1, opacity: 0.9 }}
              animate={{ scale: 5.5, opacity: 0 }}
              transition={{ duration: 1.0, ease: EASE.out, delay: 0.1 }}
              className="absolute w-60 h-60 rounded-full border-2 border-cyan-400 shadow-[0_0_40px_#00f3ff] will-change-transform"
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
