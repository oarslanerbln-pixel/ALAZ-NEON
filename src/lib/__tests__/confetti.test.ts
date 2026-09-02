import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ConfettiEngine, MAX_PARTICLES } from "../confetti";

/**
 * jsdom canvas 2D bağlamı sağlamıyor; motorun kullandığı yüzeyi taklit eden
 * küçük bir sahte bağlam yeterli — fizik ve boyutlandırma test ediliyor,
 * piksel çıktısı değil.
 */
function makeCanvas(clientWidth = 800, clientHeight = 600) {
  const ctx = {
    setTransform: vi.fn(),
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    beginPath: vi.fn(),
    arc: vi.fn(),
    ellipse: vi.fn(),
    fill: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    globalAlpha: 1,
    fillStyle: "",
    globalCompositeOperation: "source-over",
  };
  const canvas = {
    width: 0,
    height: 0,
    clientWidth,
    clientHeight,
    getContext: () => ctx,
  } as unknown as HTMLCanvasElement;
  return { canvas, ctx };
}

/** Motoru dt adımlarıyla, parçacık kalmayana kadar sürer; adım sayısını döner. */
function stepsUntilEmpty(engine: ConfettiEngine, dt: number, limit = 10_000): number {
  let steps = 0;
  while (engine.particleCount > 0 && steps < limit) {
    engine.step(dt);
    steps++;
  }
  return steps;
}

describe("ConfettiEngine", () => {
  const originalDpr = window.devicePixelRatio;

  beforeEach(() => {
    vi.stubGlobal("requestAnimationFrame", vi.fn(() => 1));
    vi.stubGlobal("cancelAnimationFrame", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    Object.defineProperty(window, "devicePixelRatio", { value: originalDpr, configurable: true });
  });

  it("tuvali devicePixelRatio ile ölçekler (Retina/4K'da bulanıklık yok)", () => {
    Object.defineProperty(window, "devicePixelRatio", { value: 2, configurable: true });
    const { canvas } = makeCanvas(800, 600);
    new ConfettiEngine(canvas);
    expect(canvas.width).toBe(1600);
    expect(canvas.height).toBe(1200);
  });

  it("DPR'yi 2 ile sınırlar (4K TV'de 3x piksel gereksiz maliyet)", () => {
    Object.defineProperty(window, "devicePixelRatio", { value: 3, configurable: true });
    const { canvas } = makeCanvas(1000, 500);
    new ConfettiEngine(canvas);
    expect(canvas.width).toBe(2000);
    expect(canvas.height).toBe(1000);
  });

  it("resize(w, h) pencereyi değil verilen CSS boyutunu kullanır (TVScaleFrame uyumu)", () => {
    Object.defineProperty(window, "devicePixelRatio", { value: 1, configurable: true });
    const { canvas } = makeCanvas(800, 600);
    const engine = new ConfettiEngine(canvas);
    engine.resize(1920, 1080);
    expect(canvas.width).toBe(1920);
    expect(canvas.height).toBe(1080);
  });

  it("burst istenen sayıda parçacık üretir ve döngüyü başlatır", () => {
    const { canvas } = makeCanvas();
    const engine = new ConfettiEngine(canvas);
    engine.burst(undefined, undefined, 50);
    expect(engine.particleCount).toBe(50);
    expect(requestAnimationFrame).toHaveBeenCalled();
  });

  it("parçacık tavanını aşmaz (üst üste patlamalarda CPU koruması)", () => {
    const { canvas } = makeCanvas();
    const engine = new ConfettiEngine(canvas);
    engine.burst(undefined, undefined, 2000);
    engine.celebrationCannon();
    expect(engine.particleCount).toBeLessThanOrEqual(MAX_PARTICLES);
  });

  it("kare hızından bağımsızdır: 30fps (dt=2) ve 60fps (dt=1) aynı simüle sürede biter", () => {
    // Rastgeleliği sabitle ki iki motor birebir aynı parçacığı üretsin
    vi.spyOn(Math, "random").mockReturnValue(0.5);
    const a = new ConfettiEngine(makeCanvas().canvas);
    const b = new ConfettiEngine(makeCanvas().canvas);
    a.burst(undefined, undefined, 1);
    b.burst(undefined, undefined, 1);

    const steps60 = stepsUntilEmpty(a, 1);
    const steps30 = stepsUntilEmpty(b, 2);

    // Simüle edilen süre: steps × dt kare. İkisi de aynı anda bitmeli (±1 kare).
    expect(Math.abs(steps60 - steps30 * 2)).toBeLessThanOrEqual(2);
  });

  it("destroy tüm parçacıkları temizler ve rAF'ı iptal eder", () => {
    const { canvas } = makeCanvas();
    const engine = new ConfettiEngine(canvas);
    engine.burst(undefined, undefined, 20);
    engine.destroy();
    expect(engine.particleCount).toBe(0);
    expect(cancelAnimationFrame).toHaveBeenCalled();
  });

  it("'hareketi azalt' tercihinde hiç parçacık üretmez (WCAG 2.3.3)", () => {
    const original = window.matchMedia;
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn().mockImplementation((q: string) => ({
        matches: q.includes("reduce"),
        media: q,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      })),
    });
    try {
      const { canvas } = makeCanvas();
      const engine = new ConfettiEngine(canvas);
      engine.burst();
      engine.celebrationCannon();
      expect(engine.particleCount).toBe(0);
    } finally {
      Object.defineProperty(window, "matchMedia", { configurable: true, value: original });
    }
  });
});
