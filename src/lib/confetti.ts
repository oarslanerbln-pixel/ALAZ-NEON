/**
 * ALAZ NEON — Sıfır bağımlılıklı neon konfeti motoru (Canvas 2D)
 *
 * Profesyonel kalite için uygulanan kurallar:
 *  1. DPR farkındalığı: tuval `devicePixelRatio` ile ölçekleniyor. Eskiden
 *     4K TV'de ve Retina telefonda her parçacık bulanık çiziliyordu.
 *  2. Delta-time fizik: hız/yerçekimi kare süresine göre ölçekleniyor. 120Hz
 *     bir telefonda konfeti iki kat hızlı düşmüyor; sekme arka plana alınıp
 *     dönünce "patlama" olmuyor (dt tavanı: bkz. normalizeFrameDelta).
 *  3. `shadowBlur` YOK: canvas'ın en pahalı işlemidir (her parçacık için
 *     ayrı bir bulanıklaştırma geçişi). Parlaklık additive blending
 *     (`lighter`) ve iki katmanlı çizimle taklit ediliyor — 60fps'i TV
 *     kutusunda da koruyor.
 *  4. `save/restore` YOK: her parçacık için `setTransform` ile tek matris.
 *  5. Parçacık tavanı: üst üste patlamalarda bellek/CPU sınırlı kalıyor.
 *  6. Sayfa görünmezken döngü duruyor; "hareketi azalt" tercihinde motor
 *     hiç parçacık üretmiyor (dekoratif hareket, WCAG 2.3.3).
 *  7. Kağıt gerçekçiliği: her parçacığın "wobble" (yatay eksende dönüş)
 *     ve "tilt" (düzlem içi dönüş) fazı var; arka yüzü koyu — havada
 *     takla atan kağıt gibi okunuyor, düz dikdörtgen gibi değil.
 */
import { normalizeFrameDelta, prefersReducedMotion } from "./motion";

type Shape = "rect" | "circle" | "spark";

interface Particle {
  x: number;
  y: number;
  /** px / kare (60fps birimi) */
  vx: number;
  vy: number;
  size: number;
  color: string;
  /** Kağıdın arka yüzü — flip sırasında görünür */
  colorBack: string;
  shape: Shape;
  /** Düzlem içi dönüş (radyan) */
  tilt: number;
  tiltSpeed: number;
  /** Yatay eksen etrafında takla (radyan) — genişliği cos ile ölçekler */
  wobble: number;
  wobbleSpeed: number;
  alpha: number;
  /** alpha azalması / kare */
  decay: number;
  gravity: number;
  /** hız çarpanı / kare (0..1) */
  drag: number;
}

const NEON_COLORS = [
  "#ffe600", // Cyber Yellow / Gold
  "#ff5500", // Alaz Orange
  "#00e5ff", // Neon Cyan
  "#ff00ff", // Neon Pink
  "#00ff2a", // Hacker Green
  "#ffffff", // Diamond White
];

/** Renk → arka yüz (yaklaşık %55 parlaklık). Hesap bir kez, cache'li. */
const BACK_COLOR_CACHE = new Map<string, string>();
function backColor(hex: string): string {
  const cached = BACK_COLOR_CACHE.get(hex);
  if (cached) return cached;
  const n = parseInt(hex.slice(1), 16);
  const r = Math.round(((n >> 16) & 255) * 0.55);
  const g = Math.round(((n >> 8) & 255) * 0.55);
  const b = Math.round((n & 255) * 0.55);
  const out = `rgb(${r},${g},${b})`;
  BACK_COLOR_CACHE.set(hex, out);
  return out;
}

/** Aynı anda ekranda tutulacak en fazla parçacık. Aşımda en eskiler düşer. */
export const MAX_PARTICLES = 700;
/** 4K TV'de 4x piksel gereksiz; 2x görsel olarak ayırt edilemez, maliyet yarı. */
const MAX_DPR = 2;
const SHAPES: readonly Shape[] = ["rect", "rect", "circle", "spark"];

export interface CannonOptions {
  /** CSS px */
  x: number;
  y: number;
  /** Radyan; -PI/2 = tam yukarı */
  angle: number;
  /** Radyan cinsinden toplam yayılma */
  spread?: number;
  count?: number;
  /** px / kare */
  speedMin?: number;
  speedMax?: number;
}

export class ConfettiEngine {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private particles: Particle[] = [];
  private animationFrameId: number | null = null;
  private isRunning = false;
  private width = 0;
  private height = 0;
  private dpr = 1;
  private lastTime = 0;
  private reducedMotion = false;

  constructor(canvas?: HTMLCanvasElement) {
    if (canvas) this.attachCanvas(canvas);
  }

  public attachCanvas(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.reducedMotion = prefersReducedMotion();
    this.resize();
    if (typeof document !== "undefined") {
      document.addEventListener("visibilitychange", this.handleVisibility);
    }
  }

  /**
   * Tuvali CSS piksel boyutuna göre (DPR ile çarpılmış) yeniden boyutlandırır.
   * Boyut verilmezse canvas'ın kendi kutusu, o da yoksa pencere kullanılır —
   * TVScaleFrame gibi ölçeklenmiş bir kapsayıcı içinde pencere boyutu yanlıştır.
   */
  public resize(cssWidth?: number, cssHeight?: number) {
    if (!this.canvas) return;
    const fallbackW = typeof window !== "undefined" ? window.innerWidth : 0;
    const fallbackH = typeof window !== "undefined" ? window.innerHeight : 0;
    const w = Math.max(1, Math.round(cssWidth ?? (this.canvas.clientWidth || fallbackW)));
    const h = Math.max(1, Math.round(cssHeight ?? (this.canvas.clientHeight || fallbackH)));
    const ratio = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
    this.dpr = Math.min(Math.max(ratio, 1), MAX_DPR);
    this.width = w;
    this.height = h;
    this.canvas.width = Math.round(w * this.dpr);
    this.canvas.height = Math.round(h * this.dpr);
  }

  public get particleCount(): number {
    return this.particles.length;
  }

  /** Merkezden (veya verilen noktadan) her yöne patlama. Koordinatlar CSS px. */
  public burst(originX?: number, originY?: number, particleCount = 80) {
    if (!this.canvas || !this.ctx || this.reducedMotion) return;
    const startX = originX ?? this.width / 2;
    const startY = originY ?? this.height / 2;
    // Alt %30'dan ateşlenirse "top" gibi yukarı kaldır
    const lift = startY > this.height * 0.7 ? 6 : 0;

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 12;
      this.spawn(
        startX,
        startY,
        Math.cos(angle) * speed,
        Math.sin(angle) * speed - lift,
        SHAPES[Math.floor(Math.random() * SHAPES.length)],
      );
    }
    this.start();
  }

  /** Belirli bir noktadan, belirli bir açıyla koni şeklinde püskürtme. */
  public cannon({
    x,
    y,
    angle,
    spread = 0.5,
    count = 60,
    speedMin = 12,
    speedMax = 26,
  }: CannonOptions) {
    if (!this.canvas || !this.ctx || this.reducedMotion) return;
    for (let i = 0; i < count; i++) {
      const a = angle + (Math.random() - 0.5) * spread;
      const speed = speedMin + Math.random() * (speedMax - speedMin);
      this.spawn(x, y, Math.cos(a) * speed, Math.sin(a) * speed, "rect");
    }
    this.start();
  }

  /** Alt köşelerden çifte zafer volkanı. */
  public celebrationCannon() {
    if (!this.canvas) return;
    const w = this.width;
    const h = this.height;
    this.cannon({ x: 0, y: h, angle: -Math.PI / 4, spread: 0.55, count: 60 });
    this.cannon({ x: w, y: h, angle: (-3 * Math.PI) / 4, spread: 0.55, count: 60 });
  }

  private spawn(x: number, y: number, vx: number, vy: number, shape: Shape) {
    if (this.particles.length >= MAX_PARTICLES) {
      this.particles.splice(0, this.particles.length - MAX_PARTICLES + 1);
    }
    const color = NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)];
    this.particles.push({
      x,
      y,
      vx,
      vy,
      size: shape === "spark" ? 3 + Math.random() * 4 : 5 + Math.random() * 8,
      color,
      colorBack: backColor(color),
      shape,
      tilt: Math.random() * Math.PI * 2,
      tiltSpeed: (Math.random() - 0.5) * 0.35,
      wobble: Math.random() * Math.PI * 2,
      wobbleSpeed: 0.12 + Math.random() * 0.14,
      alpha: 1,
      decay: shape === "spark" ? 0.02 + Math.random() * 0.015 : 0.006 + Math.random() * 0.008,
      gravity: shape === "spark" ? 0.12 : 0.22 + Math.random() * 0.08,
      drag: shape === "spark" ? 0.96 : 0.985,
    });
  }

  private start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastTime = 0;
    this.animationFrameId = requestAnimationFrame(this.frame);
  }

  private frame = (now: number) => {
    const dt = this.lastTime === 0 ? 1 : normalizeFrameDelta(now - this.lastTime);
    this.lastTime = now;
    this.step(dt);
    this.render();

    if (this.particles.length > 0) {
      this.animationFrameId = requestAnimationFrame(this.frame);
    } else {
      this.isRunning = false;
      this.animationFrameId = null;
    }
  };

  /**
   * Simülasyonu `dt` kare (60fps birimi; 1 = 16.67ms) ilerletir. Kare
   * hızından bağımsız: dt=2 ile 30 adım, dt=1 ile 60 adımla aynı yere gelir.
   * Public: testler ve harici zamanlayıcılar doğrudan sürebilsin.
   */
  public step(dt: number) {
    const floor = this.height + 60;
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      const drag = Math.pow(p.drag, dt);
      p.vx *= drag;
      p.vy = p.vy * drag + p.gravity * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.tilt += p.tiltSpeed * dt;
      p.wobble += p.wobbleSpeed * dt;
      p.alpha -= p.decay * dt;

      if (p.alpha <= 0 || p.y > floor) {
        // Sırasız silme: son elemanı buraya taşı (splice O(n) yerine O(1))
        const last = this.particles.pop()!;
        if (i < this.particles.length) this.particles[i] = last;
      }
    }
  }

  private render() {
    const ctx = this.ctx;
    if (!ctx) return;
    const dpr = this.dpr;

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, this.width, this.height);

    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      const cos = Math.cos(p.tilt);
      const sin = Math.sin(p.tilt);
      ctx.setTransform(dpr * cos, dpr * sin, -dpr * sin, dpr * cos, p.x * dpr, p.y * dpr);
      ctx.globalAlpha = p.alpha < 1 ? Math.max(0, p.alpha) : 1;

      if (p.shape === "rect") {
        // Takla: genişlik cos(wobble) ile daralıp genişler, arka yüz koyu
        const flip = Math.cos(p.wobble);
        const w = p.size * Math.max(0.12, Math.abs(flip));
        const h = p.size * 0.62;
        ctx.fillStyle = flip >= 0 ? p.color : p.colorBack;
        ctx.fillRect(-w / 2, -h / 2, w, h);
      } else if (p.shape === "circle") {
        const flip = Math.cos(p.wobble);
        const rx = (p.size / 2) * Math.max(0.15, Math.abs(flip));
        ctx.fillStyle = flip >= 0 ? p.color : p.colorBack;
        ctx.beginPath();
        ctx.ellipse(0, 0, rx, p.size / 2, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        // Kıvılcım: additive blending ile ucuz "neon" parlaması
        ctx.globalCompositeOperation = "lighter";
        ctx.fillStyle = p.color;
        this.star(ctx, p.size * 2.2, 0.28);
        ctx.fillStyle = "#ffffff";
        this.star(ctx, p.size, 1);
        ctx.globalCompositeOperation = "source-over";
      }
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.globalAlpha = 1;
  }

  /** Dört uçlu yıldız; `alphaMul` dış hâle için düşük opaklık. */
  private star(ctx: CanvasRenderingContext2D, s: number, alphaMul: number) {
    const base = ctx.globalAlpha;
    ctx.globalAlpha = base * alphaMul;
    const t = s / 3;
    ctx.beginPath();
    ctx.moveTo(0, -s);
    ctx.lineTo(t, -t);
    ctx.lineTo(s, 0);
    ctx.lineTo(t, t);
    ctx.lineTo(0, s);
    ctx.lineTo(-t, t);
    ctx.lineTo(-s, 0);
    ctx.lineTo(-t, -t);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = base;
  }

  private handleVisibility = () => {
    if (typeof document === "undefined") return;
    if (document.hidden) {
      if (this.animationFrameId !== null) cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
      this.isRunning = false;
    } else if (this.particles.length > 0) {
      this.start();
    }
  };

  public destroy() {
    if (this.animationFrameId !== null) cancelAnimationFrame(this.animationFrameId);
    if (typeof document !== "undefined") {
      document.removeEventListener("visibilitychange", this.handleVisibility);
    }
    this.animationFrameId = null;
    this.particles = [];
    this.isRunning = false;
    if (this.ctx && this.canvas) {
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
  }
}
