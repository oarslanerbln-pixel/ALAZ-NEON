import { describe, it, expect, vi } from "vitest";
import { createMonitor, type MonitoringSdk } from "../monitoring";

function setup(options: { failLoad?: boolean } = {}) {
  const sdk = { init: vi.fn(), captureException: vi.fn(), setTags: vi.fn() } satisfies MonitoringSdk;
  let idle: (() => void) | null = null;
  const load = vi.fn(() => (options.failLoad ? Promise.reject(new Error("çevrimdışı")) : Promise.resolve(sdk)));
  const target = new EventTarget() as unknown as Window;
  const monitor = createMonitor({ load, whenIdle: (run) => (idle = run), target });
  return {
    sdk,
    load,
    monitor,
    target,
    runIdle: async () => {
      idle?.();
      await monitor.ready();
    },
  };
}

describe("izleme cephesi", () => {
  it("DSN yoksa SDK hiç yüklenmez ve hiçbir şey sıraya alınmaz", async () => {
    const { monitor, load, runIdle } = setup();
    monitor.init({ dsn: undefined, environment: "production" });
    monitor.captureException(new Error("x"));
    await runIdle();
    expect(load).not.toHaveBeenCalled();
  });

  it("SDK açılışta değil, tarayıcı boşa çıkınca yüklenir", async () => {
    const { monitor, load, sdk, runIdle } = setup();
    monitor.init({ dsn: "https://k@o.ingest/1", environment: "production" });
    expect(load).not.toHaveBeenCalled();

    await runIdle();
    expect(load).toHaveBeenCalledTimes(1);
    expect(sdk.init).toHaveBeenCalledWith({
      dsn: "https://k@o.ingest/1",
      environment: "production",
      tracesSampleRate: 0,
    });
  });

  it("SDK inmeden yakalanan hata yüklemeyi hemen başlatır ve kaybolmaz", async () => {
    const { monitor, load, sdk } = setup();
    monitor.init({ dsn: "dsn", environment: "production" });
    const error = new Error("erken");
    monitor.captureException(error, { tags: { write: "join" } });
    expect(load).toHaveBeenCalledTimes(1);

    await monitor.ready();
    expect(sdk.captureException).toHaveBeenCalledWith(error, { tags: { write: "join" } });

    monitor.captureException("sonra");
    expect(sdk.captureException).toHaveBeenLastCalledWith("sonra", undefined);
    expect(load).toHaveBeenCalledTimes(1);
  });

  it("SDK inene kadar yakalanmamış hata ve reddedilen sözler de toplanır", async () => {
    const { monitor, sdk, target } = setup();
    monitor.init({ dsn: "dsn", environment: "production" });
    const boom = new Error("yakalanmadı");
    target.dispatchEvent(Object.assign(new Event("error"), { error: boom }));
    await monitor.ready();
    expect(sdk.captureException).toHaveBeenCalledWith(boom, undefined);

    // SDK kendi dinleyicilerini kurduktan sonra cephe dinlemeyi bırakır (çift rapor yok).
    sdk.captureException.mockClear();
    target.dispatchEvent(Object.assign(new Event("error"), { error: new Error("ikinci") }));
    expect(sdk.captureException).not.toHaveBeenCalled();
  });

  it("SDK inemezse uygulama etkilenmez; bir sonraki hata yeniden dener", async () => {
    const { monitor, load } = setup({ failLoad: true });
    monitor.init({ dsn: "dsn", environment: "production" });
    monitor.captureException(new Error("1"));
    await monitor.ready();
    monitor.captureException(new Error("2"));
    await monitor.ready();
    expect(load).toHaveBeenCalledTimes(2);
  });

  it("sürüm kimliği SDK'ya geçer (kaynak haritalarıyla eşleşme)", async () => {
    const { monitor, sdk, runIdle } = setup();
    monitor.init({ dsn: "dsn", environment: "production", release: "hengame@abc123" });
    await runIdle();
    expect(sdk.init).toHaveBeenCalledWith(expect.objectContaining({ release: "hengame@abc123" }));
  });

  it("SDK inmeden verilen etiketler yüklenince, sıradaki hatalardan önce uygulanır", async () => {
    const { monitor, sdk } = setup();
    monitor.init({ dsn: "dsn", environment: "production" });
    monitor.setTags({ role: "player", room_id: "r1" });
    monitor.setTags({ game: "echo" });
    monitor.captureException(new Error("x"));
    await monitor.ready();

    expect(sdk.setTags).toHaveBeenCalledWith({ role: "player", room_id: "r1", game: "echo" });
    expect(sdk.setTags.mock.invocationCallOrder[0]).toBeLessThan(sdk.captureException.mock.invocationCallOrder[0]);

    monitor.setTags({ game: undefined });
    expect(sdk.setTags).toHaveBeenLastCalledWith({ game: undefined });
  });
});
