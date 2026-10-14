import { describe, it, expect } from "vitest";
import { keepScreenAwake, type WakeLockEnv, type WakeLockHandle } from "../wakeLock";

/** Tarayıcının yerine geçen, elle sürülen sahte ortam. */
function fakeEnv(options: { supported?: boolean } = {}) {
  let visible = true;
  const visibilityListeners = new Set<() => void>();
  const gestureListeners = new Set<() => void>();
  const pending: { resolve: (h: WakeLockHandle) => void; reject: (e: unknown) => void }[] = [];
  const handles: FakeHandle[] = [];

  class FakeHandle implements WakeLockHandle {
    released = false;
    private listeners: (() => void)[] = [];
    release() {
      this.systemRelease();
      return Promise.resolve();
    }
    addEventListener(_type: "release", listener: () => void) {
      this.listeners.push(listener);
    }
    /** Tarayıcının kilidi kendiliğinden bırakması (sekme gizlendi, pil tasarrufu). */
    systemRelease() {
      if (this.released) return;
      this.released = true;
      this.listeners.forEach((l) => l());
    }
  }

  const env: WakeLockEnv = {
    request:
      options.supported === false
        ? undefined
        : () => new Promise<WakeLockHandle>((resolve, reject) => pending.push({ resolve, reject })),
    isVisible: () => visible,
    onVisibilityChange: (listener) => {
      visibilityListeners.add(listener);
      return () => visibilityListeners.delete(listener);
    },
    onUserGesture: (listener) => {
      gestureListeners.add(listener);
      return () => gestureListeners.delete(listener);
    },
  };

  return {
    env,
    handles,
    get requests() {
      return pending.length;
    },
    get gestureSubscribers() {
      return gestureListeners.size;
    },
    get visibilitySubscribers() {
      return visibilityListeners.size;
    },
    async grant() {
      const next = pending.at(-1);
      if (!next) throw new Error("bekleyen istek yok");
      const handle = new FakeHandle();
      handles.push(handle);
      next.resolve(handle);
      await flush();
      return handle;
    },
    async deny() {
      const next = pending.at(-1);
      if (!next) throw new Error("bekleyen istek yok");
      next.reject(new DOMException("izin yok", "NotAllowedError"));
      await flush();
    },
    setVisible(value: boolean) {
      visible = value;
      if (!value) handles.forEach((h) => h.systemRelease());
      visibilityListeners.forEach((l) => l());
    },
    tap() {
      [...gestureListeners].forEach((l) => l());
    },
  };
}

const flush = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

describe("keepScreenAwake", () => {
  it("başlar başlamaz ekran kilidi ister", async () => {
    const f = fakeEnv();
    keepScreenAwake(f.env);
    expect(f.requests).toBe(1);
    const handle = await f.grant();
    expect(handle.released).toBe(false);
  });

  it("durdurulunca kilidi bırakır ve aboneliklerden çıkar", async () => {
    const f = fakeEnv();
    const stop = keepScreenAwake(f.env);
    const handle = await f.grant();
    stop();
    expect(handle.released).toBe(true);
    expect(f.visibilitySubscribers).toBe(0);
    expect(f.gestureSubscribers).toBe(0);
    stop(); // ikinci çağrı zararsız
  });

  it("sekme gizlenip geri gelince kilidi yeniden alır", async () => {
    const f = fakeEnv();
    keepScreenAwake(f.env);
    const first = await f.grant();

    f.setVisible(false);
    expect(first.released).toBe(true);
    expect(f.requests).toBe(1); // gizliyken istenmez

    f.setVisible(true);
    expect(f.requests).toBe(2);
    const second = await f.grant();
    expect(second.released).toBe(false);
  });

  it("gizliyken başlatılırsa görünür olana kadar beklemez, görünür olunca ister", () => {
    const f = fakeEnv();
    f.setVisible(false);
    keepScreenAwake(f.env);
    expect(f.requests).toBe(0);
    f.setVisible(true);
    expect(f.requests).toBe(1);
  });

  it("istek reddedilirse ilk dokunuşta bir kez daha dener", async () => {
    const f = fakeEnv();
    keepScreenAwake(f.env);
    await f.deny();
    expect(f.requests).toBe(1);
    expect(f.gestureSubscribers).toBe(1);

    f.tap();
    expect(f.requests).toBe(2);
    expect(f.gestureSubscribers).toBe(0);
    await f.grant();
    f.tap();
    expect(f.requests).toBe(2); // kilit varken dokunuş yeni istek açmaz
  });

  it("görünürken bırakılan kilit (pil tasarrufu) hemen değil, ilk dokunuşta yeniden istenir", async () => {
    const f = fakeEnv();
    keepScreenAwake(f.env);
    const handle = await f.grant();

    handle.systemRelease();
    expect(f.requests).toBe(1); // al-bırak döngüsü yok
    f.tap();
    expect(f.requests).toBe(2);
  });

  it("istek yoldayken durdurulursa gelen kilit hemen bırakılır", async () => {
    const f = fakeEnv();
    const stop = keepScreenAwake(f.env);
    stop();
    const late = await f.grant();
    expect(late.released).toBe(true);
  });

  it("aynı anda ikinci istek açmaz", () => {
    const f = fakeEnv();
    keepScreenAwake(f.env);
    f.setVisible(true); // istek hâlâ yolda
    f.tap();
    expect(f.requests).toBe(1);
  });

  it("API yoksa hiçbir şey yapmaz ve abone olmaz", () => {
    const f = fakeEnv({ supported: false });
    const stop = keepScreenAwake(f.env);
    expect(f.visibilitySubscribers).toBe(0);
    expect(() => stop()).not.toThrow();
  });
});
