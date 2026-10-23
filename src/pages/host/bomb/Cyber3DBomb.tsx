import { useEffect, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { EASE, SPRING } from "../../../lib/motion";

interface Cyber3DBombProps {
  timeLeft: number;
  maxTime?: number;
  className?: string;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
}

/**
 * 3D Kuantum Siber Bomba (Cyber3DBomb)
 *
 * Blender & Unity Eevee Standartlarında:
 * 1. PBR Küresel Gölgelendirme (Obsidyen & Metalik Yansıma)
 * 2. Dinamik Yanan Plazma Fitil (Tükenen manyetik yol + uçta kıvılcım fıskiyesi)
 * 3. Ekvatoral Tokamak Muhafaza Kemeri (Dönen tehlike çizgileri)
 * 4. Kriz Evresi (Son 5 saniyede elektrik arkları, kalp atışı ve sarsıntı)
 */
export function Cyber3DBomb({
  timeLeft,
  maxTime = 15,
  className = "",
}: Cyber3DBombProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isCritical = timeLeft <= 5;
  const isWarning = timeLeft <= 8 && !isCritical;
  const fraction = Math.min(1, Math.max(0, timeLeft / maxTime));

  // Fitilin uzunluğu (0 = bitmiş, 1 = tam)
  const fuseProgress = fraction;

  // ═══════════════════════════════════════════════════════════════
  // 60 FPS APU DOSTU FİTİL KIVILCIMLARI (SPARK EMITTER CANVAS)
  // ═══════════════════════════════════════════════════════════════
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      canvas.width = 160 * dpr;
      canvas.height = 140 * dpr;
      ctx.scale(dpr, dpr);
    };
    resize();

    const sparks: Spark[] = [];
    const colors = ["#ffdd00", "#ff6600", "#ff0044", "#ffffff"];

    let running = true;
    const render = () => {
      if (!running) return;
      ctx.clearRect(0, 0, 160, 140);

      // Fitilin ucu civarında kıvılcım üretimi
      // Fitil yolu sol-yukarıdan merkez-aşağıya doğru eğimli
      const sparkCount = isCritical ? 4 : isWarning ? 2 : 1;
      for (let s = 0; s < sparkCount; s++) {
        const spread = (Math.random() - 0.5) * Math.PI * 1.5;
        const speed = 1.2 + Math.random() * 3.5;
        sparks.push({
          x: 80 + (1 - fuseProgress) * 25,
          y: 40 + (1 - fuseProgress) * 45,
          vx: Math.cos(spread) * speed + (Math.random() - 0.5) * 1.5,
          vy: -Math.abs(Math.sin(spread) * speed) - 1.2,
          size: 1.2 + Math.random() * 2.8,
          color: colors[Math.floor(Math.random() * colors.length)],
          alpha: 0.9,
          life: 0,
          maxLife: 20 + Math.random() * 25,
        });
      }

      for (let i = sparks.length - 1; i >= 0; i--) {
        const p = sparks[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15; // Yerçekimi
        p.alpha = Math.max(0, 1 - p.life / p.maxLife);

        if (p.life >= p.maxLife) {
          sparks.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.shadowColor = p.color;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      running = false;
      cancelAnimationFrame(animId);
    };
  }, [fuseProgress, isCritical, isWarning]);

  return (
    <div className={`relative flex flex-col items-center justify-center select-none ${className}`}>

      {/* ═══════════════════════════════════════════════════════════
          1. DİNAMİK YANAN PLAZMA FİTİL (BURNING FUSE)
          ═══════════════════════════════════════════════════════════ */}
      <div className="relative w-40 h-28 -mb-4 z-20 pointer-events-none">
        {/* Kıvılcım Tuvali */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none z-30"
          style={{ width: "160px", height: "140px" }}
        />

        {/* Fitil SVG Yolu */}
        <svg
          viewBox="0 0 160 140"
          className="absolute inset-0 w-full h-full overflow-visible"
        >
          {/* Fitilin Yanmamış Soğuk İzi */}
          <path
            d="M 30,15 C 65,-5 105,25 90,75 C 85,95 80,105 80,120"
            fill="none"
            stroke="rgba(255,255,255,0.12)"
            strokeWidth="5"
            strokeLinecap="round"
          />

          {/* Fitilin Yanan Dinamik Plazma Kısmı */}
          <motion.path
            d="M 30,15 C 65,-5 105,25 90,75 C 85,95 80,105 80,120"
            fill="none"
            stroke="url(#fuseGradient)"
            strokeWidth="5.5"
            strokeLinecap="round"
            style={{
              pathLength: fuseProgress,
            }}
            transition={{ duration: 0.35, ease: "linear" }}
          />

          {/* Fitil Gradient Tanımı */}
          <defs>
            <linearGradient id="fuseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="35%" stopColor="#ffea00" />
              <stop offset="70%" stopColor="#ff4d00" />
              <stop offset="100%" stopColor="#ff003c" />
            </linearGradient>
          </defs>
        </svg>

        {/* Fitil Ucu Parlama Efekti */}
        <div
          className="absolute w-6 h-6 rounded-full bg-amber-200 blur-sm pointer-events-none z-20 animate-pulse"
          style={{
            left: `${80 + (1 - fuseProgress) * 22}px`,
            top: `${40 + (1 - fuseProgress) * 40}px`,
            boxShadow: isCritical
              ? "0 0 35px #ff0044, 0 0 20px #ffea00"
              : "0 0 25px #ff6600, 0 0 15px #ffdd00",
          }}
        />
      </div>

      {/* ═══════════════════════════════════════════════════════════
          2. DETONATÖR BAŞLIĞI & SOĞUTMA BOĞAZI (CYBER DETONATOR)
          ═══════════════════════════════════════════════════════════ */}
      <div className="relative z-15 w-24 h-9 bg-gradient-to-b from-[#2a2c35] via-[#1a1b22] to-[#0d0e14] rounded-t-xl border-t border-x border-white/25 shadow-[0_-5px_20px_rgba(0,0,0,0.8)] flex items-center justify-around px-2">
        <div className="w-1.5 h-4 bg-white/15 rounded-full" />
        <div className="w-1.5 h-4 bg-white/15 rounded-full" />
        <div
          className={`w-3 h-3 rounded-full ${
            isCritical
              ? "bg-red-500 animate-ping shadow-[0_0_12px_#ff003c]"
              : isWarning
              ? "bg-amber-400 animate-pulse shadow-[0_0_8px_#ffaa00]"
              : "bg-cyan-400 animate-pulse shadow-[0_0_8px_#00f3ff]"
          }`}
        />
        <div className="w-1.5 h-4 bg-white/15 rounded-full" />
        <div className="w-1.5 h-4 bg-white/15 rounded-full" />
      </div>

      {/* ═══════════════════════════════════════════════════════════
          3. 3D KÜRESEL BOMBA GÖVDESİ (3D SPHERICAL BOMB BODY)
          ═══════════════════════════════════════════════════════════ */}
      <div className="relative w-80 h-80 md:w-92 md:h-92 flex items-center justify-center">

        {/* Arka Ortam Parlaması (Volumetric Aura) */}
        <div
          aria-hidden="true"
          className={`absolute inset-0 rounded-full blur-[90px] transition-colors duration-500 pointer-events-none -z-10 ${
            isCritical
              ? "bg-red-600/40 animate-pulse"
              : isWarning
              ? "bg-amber-500/30"
              : "bg-alaz-orange/20"
          }`}
        />

        {/* 3D Küresel Metalik Gövde */}
        <motion.div
          animate={
            isCritical
              ? {
                  scale: [1, 1.05, 0.97, 1.04, 1],
                  rotate: [0, -3, 3, -2, 2, 0],
                }
              : isWarning
              ? {
                  scale: [1, 1.02, 1],
                }
              : { scale: 1 }
          }
          transition={{
            duration: isCritical ? 0.35 : 0.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className={`relative w-full h-full rounded-full border-2 transition-all duration-300 flex items-center justify-center overflow-hidden ${
            isCritical
              ? "border-red-500 shadow-[0_0_80px_rgba(255,0,60,0.8),inset_0_0_60px_rgba(255,0,60,0.4)]"
              : isWarning
              ? "border-amber-400/80 shadow-[0_0_60px_rgba(255,170,0,0.5),inset_0_0_40px_rgba(255,170,0,0.3)]"
              : "border-white/20 shadow-[0_25px_80px_rgba(0,0,0,0.9),inset_0_0_40px_rgba(255,85,0,0.2)]"
          }`}
          style={{
            background:
              "radial-gradient(circle at 35% 25%, #2a2e3d 0%, #12141c 45%, #050608 90%)",
          }}
        >
          {/* Küresel Işık Yansıması (Specular Highlight) */}
          <div
            aria-hidden="true"
            className="absolute top-4 left-10 w-32 h-16 rounded-[100%] bg-gradient-to-b from-white/35 to-transparent blur-[2px] -rotate-35 pointer-events-none"
          />

          {/* Dış Ekvatoral Kuantum Kemeri (Hazard Band) */}
          <motion.div
            aria-hidden="true"
            animate={{ rotate: 360 }}
            transition={{
              duration: isCritical ? 6 : 14,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute inset-x-0 h-10 border-y border-dashed border-white/20 pointer-events-none opacity-40 flex items-center justify-around"
          >
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} className="text-[9px] font-mono tracking-widest text-white/50">
                ⚠ HAZARD ⚠
              </span>
            ))}
          </motion.div>

          {/* ═══════════════════════════════════════════════════════════
              4. DİJİTAL SÜRE ÇEKİRDEĞİ (DIGITAL PLASMA CORE)
              ═══════════════════════════════════════════════════════════ */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            {/* Süre Etiketi */}
            <span
              className={`text-[10px] font-mono tracking-[0.3em] uppercase font-bold mb-1 transition-colors ${
                isCritical ? "text-red-400 animate-pulse" : "text-white/40"
              }`}
            >
              CRITICAL FUSE
            </span>

            {/* Rakam */}
            <div className="relative h-[1.1em] overflow-hidden text-7xl md:text-9xl font-black tabular-nums tracking-tighter leading-none">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={timeLeft}
                  initial={{ y: "0.5em", opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: "-0.5em", opacity: 0 }}
                  transition={SPRING.snappy}
                  className={`block transition-all duration-300 ${
                    isCritical
                      ? "text-white drop-shadow-[0_0_40px_rgba(255,0,60,1)] animate-pulse"
                      : isWarning
                      ? "text-transparent bg-clip-text bg-gradient-to-b from-white via-amber-200 to-amber-500 drop-shadow-[0_0_30px_rgba(255,170,0,0.8)]"
                      : "text-transparent bg-clip-text bg-gradient-to-b from-white via-orange-200 to-alaz-orange drop-shadow-[0_0_25px_rgba(255,85,0,0.7)]"
                  }`}
                  style={
                    isCritical
                      ? {
                          textShadow:
                            "3px 3px 0px rgba(255,0,60,0.8), -3px -3px 0px rgba(0,243,255,0.6)",
                        }
                      : undefined
                  }
                >
                  {timeLeft}
                </motion.span>
              </AnimatePresence>
            </div>

            {/* Alt Kinetik Enerji Göstergesi */}
            <div className="w-24 h-1 bg-white/10 rounded-full mt-2 overflow-hidden border border-white/10">
              <div
                className={`h-full transition-all duration-300 ${
                  isCritical
                    ? "bg-red-500 shadow-[0_0_10px_#ff003c]"
                    : isWarning
                    ? "bg-amber-400 shadow-[0_0_8px_#ffaa00]"
                    : "bg-alaz-orange shadow-[0_0_8px_#ff5500]"
                }`}
                style={{ width: `${fraction * 100}%` }}
              />
            </div>
          </div>

          {/* Kriz Evresi Elektrik Arkları (Critical Lightning Arcs) */}
          {isCritical && (
            <motion.div
              aria-hidden="true"
              initial={{ opacity: 0 }}
              animate={{ opacity: [0.3, 0.9, 0.2, 1, 0.4] }}
              transition={{ duration: 0.2, repeat: Infinity }}
              className="absolute inset-0 rounded-full border-2 border-white pointer-events-none mix-blend-overlay"
            />
          )}
        </motion.div>
      </div>

    </div>
  );
}
