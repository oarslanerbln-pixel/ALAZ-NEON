import { useEffect, useRef } from "react";
import { normalizeFrameDelta, prefersReducedMotion } from "../lib/motion";

interface Particle {
  x: number;
  y: number;
  size: number;
  /** Temel hız (px/kare, 60fps birimi) — hız çarpanı çizim anında uygulanır */
  vx: number;
  vy: number;
  color: string;
}

const PARTICLE_COUNT = 120;
const LINK_DISTANCE = 150;
const LINK_DISTANCE_SQ = LINK_DISTANCE * LINK_DISTANCE;
const MAX_DPR = 2;
/** Neon: Blue, Pink, Orange, Gold */
const COLORS = ["#00f3ff", "#ff003c", "#ff4d00", "#FFD700"];

/**
 * Parlama sprite'ı: radyal gradyan BİR KEZ offscreen tuvale çiziliyor, her
 * karede `drawImage` ile kopyalanıyor. Eski sürüm 120 parçacık × 60 kare =
 * saniyede 7.200 `shadowBlur` geçişi yapıyordu — canvas'ın en pahalı işlemi.
 */
function makeGlowSprite(color: string, radius: number, dpr: number): HTMLCanvasElement {
  const size = Math.ceil(radius * 2 * dpr);
  const sprite = document.createElement("canvas");
  sprite.width = size;
  sprite.height = size;
  const ctx = sprite.getContext("2d");
  if (ctx) {
    const c = size / 2;
    const g = ctx.createRadialGradient(c, c, 0, c, c, c);
    g.addColorStop(0, color);
    g.addColorStop(0.35, color);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, size, size);
  }
  return sprite;
}

/**
 * Takımyıldız arka planı (TV ve quiz ekranları).
 *
 * - DPR farkındalığı + kapsayıcı tabanlı ölçüm (TVScaleFrame içinde pencere
 *   boyutu yanlıştır).
 * - Delta-time: 120Hz ekranda iki kat hızlı akmıyor.
 * - `speedMultiplier` değişince parçacıklar YENİDEN ÜRETİLMİYOR (eskiden
 *   son 10 saniyeye girince tüm yıldızlar bir anda yer değiştiriyordu);
 *   çarpan lerp ile yumuşakça hedefe gidiyor.
 * - Sayfa görünmezken döngü durur; "hareketi azalt" tercihinde tek kare çizilir.
 */
export function ParticleBackground({ speedMultiplier = 1 }: { speedMultiplier?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const targetSpeedRef = useRef(speedMultiplier);

  useEffect(() => {
    targetSpeedRef.current = speedMultiplier;
  }, [speedMultiplier]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrapper = wrapperRef.current;
    if (!canvas || !wrapper) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduced = prefersReducedMotion();
    const dpr = Math.min(Math.max(window.devicePixelRatio || 1, 1), MAX_DPR);
    const sprites = new Map<string, HTMLCanvasElement>();
    for (const c of COLORS) sprites.set(c, makeGlowSprite(c, 14, dpr));

    let width = 0;
    let height = 0;
    let particles: Particle[] = [];
    let frameId: number | null = null;
    let lastTime = 0;
    let currentSpeed = targetSpeedRef.current;
    const pointer = { x: -9999, y: -9999, radius: 200 };

    const initParticles = () => {
      particles = [];
      for (let i = 0; i < PARTICLE_COUNT; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 2 + 1,
          vx: (Math.random() - 0.5) * 1.5,
          vy: (Math.random() - 0.5) * 1.5,
          color: COLORS[Math.floor(Math.random() * COLORS.length)],
        });
      }
    };

    const resize = (w: number, h: number) => {
      const nextW = Math.max(1, Math.round(w));
      const nextH = Math.max(1, Math.round(h));
      // Yalnızca yeniden konumlandır; parçacıkları koru (ilk kurulum hariç)
      const first = width === 0;
      const sx = first ? 1 : nextW / width;
      const sy = first ? 1 : nextH / height;
      width = nextW;
      height = nextH;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      if (first) initParticles();
      else for (const p of particles) { p.x *= sx; p.y *= sy; }
      if (reduced) draw();
    };

    const draw = () => {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);

      // 1) Bağlantı çizgileri (altta)
      ctx.lineWidth = 1;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        for (let j = i + 1; j < particles.length; j++) {
          const q = particles[j];
          const dx = p.x - q.x;
          const dy = p.y - q.y;
          const d2 = dx * dx + dy * dy;
          if (d2 >= LINK_DISTANCE_SQ) continue;
          ctx.globalAlpha = (1 - Math.sqrt(d2) / LINK_DISTANCE) * 0.35;
          ctx.strokeStyle = p.color;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.stroke();
        }
      }

      // 2) Parlayan küreler (üstte): sprite + beyaz çekirdek
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const sprite = sprites.get(p.color);
        const r = p.size * 5;
        ctx.globalAlpha = 0.75;
        if (sprite) ctx.drawImage(sprite, p.x - r, p.y - r, r * 2, r * 2);
        ctx.globalAlpha = 1;
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;
    };

    const update = (dt: number) => {
      // Hız çarpanı hedefe yumuşakça (≈0.5sn) yaklaşır; ani sıçrama yok
      currentSpeed += (targetSpeedRef.current - currentSpeed) * Math.min(1, 0.08 * dt);
      const maxBase = 2;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // İşaretçi itme (CSS px uzayında)
        const dx = pointer.x - p.x;
        const dy = pointer.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0 && dist < pointer.radius) {
          const force = ((pointer.radius - dist) / pointer.radius) * 0.2 * dt;
          p.vx -= (dx / dist) * force;
          p.vy -= (dy / dist) * force;
        }

        if (p.vx > maxBase) p.vx = maxBase;
        else if (p.vx < -maxBase) p.vx = -maxBase;
        if (p.vy > maxBase) p.vy = maxBase;
        else if (p.vy < -maxBase) p.vy = -maxBase;

        p.x += p.vx * currentSpeed * dt;
        p.y += p.vy * currentSpeed * dt;

        if (p.x < 0) { p.x = 0; p.vx = Math.abs(p.vx); }
        else if (p.x > width) { p.x = width; p.vx = -Math.abs(p.vx); }
        if (p.y < 0) { p.y = 0; p.vy = Math.abs(p.vy); }
        else if (p.y > height) { p.y = height; p.vy = -Math.abs(p.vy); }
      }
    };

    const frame = (now: number) => {
      const dt = lastTime === 0 ? 1 : normalizeFrameDelta(now - lastTime);
      lastTime = now;
      update(dt);
      draw();
      frameId = requestAnimationFrame(frame);
    };

    const start = () => {
      if (reduced || frameId !== null) return;
      lastTime = 0;
      frameId = requestAnimationFrame(frame);
    };
    const stop = () => {
      if (frameId !== null) cancelAnimationFrame(frameId);
      frameId = null;
    };

    // İşaretçi koordinatını tuvalin CSS uzayına çevir (ölçekli kapsayıcı uyumu)
    const toLocal = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;
      pointer.x = ((clientX - rect.left) / rect.width) * width;
      pointer.y = ((clientY - rect.top) / rect.height) * height;
    };
    const onMouseMove = (e: MouseEvent) => toLocal(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) toLocal(t.clientX, t.clientY);
    };
    const onLeave = () => { pointer.x = -9999; pointer.y = -9999; };
    const onVisibility = () => (document.hidden ? stop() : start());

    let observer: ResizeObserver | null = null;
    const onWindowResize = () => resize(wrapper.clientWidth || window.innerWidth, wrapper.clientHeight || window.innerHeight);
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver((entries) => {
        const r = entries[0]?.contentRect;
        if (r && r.width > 0 && r.height > 0) resize(r.width, r.height);
      });
      observer.observe(wrapper);
    } else {
      window.addEventListener("resize", onWindowResize);
    }
    onWindowResize();

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("mouseleave", onLeave);
    document.addEventListener("visibilitychange", onVisibility);

    if (reduced) draw();
    else start();

    return () => {
      stop();
      observer?.disconnect();
      window.removeEventListener("resize", onWindowResize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div ref={wrapperRef} className="fixed inset-0 pointer-events-none z-[-2] overflow-hidden bg-[#030303]">
      {/* Dynamic slow pulsing background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(0,243,255,0.05)_0%,rgba(0,0,0,1)_100%)] mix-blend-screen" />
      <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.05]" />
      <canvas ref={canvasRef} aria-hidden="true" className="absolute inset-0 w-full h-full" />
    </div>
  );
}
