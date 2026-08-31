/**
 * ALAZ NEON - Zero-Dependency Cyberpunk Canvas Confetti Engine
 * Yüksek performanslı, 60fps çalışan neon konfeti ve kıvılcım patlama motoru.
 */

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  rotation: number;
  rotationSpeed: number;
  shape: "rect" | "circle" | "spark";
  alpha: number;
  decay: number;
  wobble: number;
  wobbleSpeed: number;
}

const NEON_COLORS = [
  "#ffe600", // Cyber Yellow / Gold
  "#ff5500", // Alaz Orange
  "#00e5ff", // Neon Cyan
  "#ff00ff", // Neon Pink
  "#00ff2a", // Hacker Green
  "#ffffff", // Diamond White
];

export class ConfettiEngine {
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private particles: Particle[] = [];
  private animationFrameId: number | null = null;
  private isRunning: boolean = false;

  constructor(canvas?: HTMLCanvasElement) {
    if (canvas) {
      this.attachCanvas(canvas);
    }
  }

  public attachCanvas(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.resize();
  }

  public resize() {
    if (!this.canvas) return;
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  public burst(originX?: number, originY?: number, particleCount = 80) {
    if (!this.canvas || !this.ctx) return;

    const startX = originX ?? this.canvas.width / 2;
    const startY = originY ?? this.canvas.height / 2;

    for (let i = 0; i < particleCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 12;
      const shapes: Array<"rect" | "circle" | "spark"> = ["rect", "circle", "spark"];

      this.particles.push({
        x: startX,
        y: startY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - (startY > this.canvas.height * 0.7 ? 6 : 0), // Cannon lift if fired from bottom
        size: 4 + Math.random() * 8,
        color: NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        shape: shapes[Math.floor(Math.random() * shapes.length)],
        alpha: 1,
        decay: 0.008 + Math.random() * 0.012,
        wobble: Math.random() * 10,
        wobbleSpeed: 0.1 + Math.random() * 0.1,
      });
    }

    if (!this.isRunning) {
      this.isRunning = true;
      this.loop();
    }
  }

  /**
   * Alt köşelerden çifte zafer volkanı patlatır
   */
  public celebrationCannon() {
    if (!this.canvas) return;
    const w = this.canvas.width;
    const h = this.canvas.height;

    // Sol volkan
    for (let i = 0; i < 60; i++) {
      const angle = -Math.PI / 4 + (Math.random() - 0.5) * 0.5; // Yukarı sağa doğru 45 derece
      const speed = 12 + Math.random() * 14;
      this.particles.push({
        x: 0,
        y: h,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 5 + Math.random() * 9,
        color: NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 15,
        shape: "rect",
        alpha: 1,
        decay: 0.007 + Math.random() * 0.008,
        wobble: 0,
        wobbleSpeed: 0.15,
      });
    }

    // Sağ volkan
    for (let i = 0; i < 60; i++) {
      const angle = (-3 * Math.PI) / 4 + (Math.random() - 0.5) * 0.5; // Yukarı sola doğru 135 derece
      const speed = 12 + Math.random() * 14;
      this.particles.push({
        x: w,
        y: h,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: 5 + Math.random() * 9,
        color: NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)],
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 15,
        shape: "rect",
        alpha: 1,
        decay: 0.007 + Math.random() * 0.008,
        wobble: 0,
        wobbleSpeed: 0.15,
      });
    }

    if (!this.isRunning) {
      this.isRunning = true;
      this.loop();
    }
  }

  private loop = () => {
    if (!this.ctx || !this.canvas) return;

    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];

      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.25; // Yerçekimi
      p.vx *= 0.985; // Hava sürtünmesi
      p.vy *= 0.985;
      p.rotation += p.rotationSpeed;
      p.alpha -= p.decay;
      p.wobble += p.wobbleSpeed;

      if (p.alpha <= 0 || p.y > this.canvas.height + 50) {
        this.particles.splice(i, 1);
        continue;
      }

      this.ctx.save();
      this.ctx.globalAlpha = Math.max(0, p.alpha);
      this.ctx.translate(p.x, p.y);
      this.ctx.rotate((p.rotation * Math.PI) / 180);

      // Neon glow
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = p.color;
      this.ctx.fillStyle = p.color;

      if (p.shape === "rect") {
        const width = p.size * Math.cos(p.wobble);
        this.ctx.fillRect(-width / 2, -p.size / 2, width, p.size);
      } else if (p.shape === "circle") {
        this.ctx.beginPath();
        this.ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        this.ctx.fill();
      } else if (p.shape === "spark") {
        this.ctx.beginPath();
        this.ctx.moveTo(0, -p.size);
        this.ctx.lineTo(p.size / 3, -p.size / 3);
        this.ctx.lineTo(p.size, 0);
        this.ctx.lineTo(p.size / 3, p.size / 3);
        this.ctx.lineTo(0, p.size);
        this.ctx.lineTo(-p.size / 3, p.size / 3);
        this.ctx.lineTo(-p.size, 0);
        this.ctx.lineTo(-p.size / 3, -p.size / 3);
        this.ctx.closePath();
        this.ctx.fill();
      }

      this.ctx.restore();
    }

    if (this.particles.length > 0) {
      this.animationFrameId = requestAnimationFrame(this.loop);
    } else {
      this.isRunning = false;
      this.animationFrameId = null;
    }
  };

  public destroy() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.particles = [];
    this.isRunning = false;
  }
}
