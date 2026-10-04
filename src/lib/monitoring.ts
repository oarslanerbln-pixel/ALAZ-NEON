/**
 * Hata izleme cephesi (docs/roadmap.md, 2.3).
 *
 * Sentry SDK'sı (~29 KB gzip) eskiden giriş paketindeydi: QR'ı okutan her
 * telefon, hiçbir hata olmasa bile onu indirip çalıştırıyordu. Artık uygulama
 * yalnızca bu küçük cepheyi tanıyor; SDK tarayıcı boşa çıkınca ya da ilk
 * hata yakalandığında (hangisi önce olursa) ayrı bir parça olarak iniyor.
 * O ana kadar yakalanan hatalar sıraya alınıp SDK hazır olunca gönderiliyor.
 *
 * DSN tanımlı değilse hiçbir şey yüklenmez ve hiçbir şey sıraya alınmaz.
 */

export interface CaptureContext {
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
}

export interface MonitoringConfig {
  dsn?: string;
  environment: string;
  /** Yayın kimliği (vite.config.ts → appRelease); kaynak haritalarıyla eşleşir. */
  release?: string;
}

/** Hangi ekranda/odada/oyunda olunduğu (undefined → etiketi kaldırır). */
export type MonitoringTags = Record<string, string | undefined>;

/** Cephenin ihtiyaç duyduğu SDK yüzeyi (testte sahtesi veriliyor). */
export interface MonitoringSdk {
  init(options: { dsn: string; environment: string; release?: string; tracesSampleRate: number }): void;
  captureException(error: unknown, context?: CaptureContext): unknown;
  setTags(tags: MonitoringTags): void;
}

interface MonitorDeps {
  load: () => Promise<MonitoringSdk>;
  /** `run`'ı uygun bir boş anda çalıştırır. */
  whenIdle: (run: () => void) => void;
  target?: Pick<Window, "addEventListener" | "removeEventListener">;
}

/** Sıradaki en fazla hata: bir hata döngüsü belleği doldurmasın. */
const MAX_QUEUED = 20;

export function createMonitor(deps: MonitorDeps) {
  let config: (MonitoringConfig & { dsn: string }) | null = null;
  let sdk: MonitoringSdk | null = null;
  let loading: Promise<void> | null = null;
  const queue: [unknown, CaptureContext | undefined][] = [];
  let tags: MonitoringTags = {};

  // SDK inene kadar yakalanmamış hatalar (SDK kendi dinleyicilerini kurunca
  // bunlar kaldırılıyor).
  const onError = (event: Event) => {
    const e = event as ErrorEvent;
    captureException(e.error ?? e.message);
  };
  const onRejection = (event: Event) => captureException((event as PromiseRejectionEvent).reason);

  function load(): Promise<void> {
    if (!config) return Promise.resolve();
    if (!loading) {
      const active = config;
      loading = deps
        .load()
        .then((loaded) => {
          loaded.init({
            dsn: active.dsn,
            environment: active.environment,
            release: active.release,
            // Performans izleme/session replay bilerek kapalı: bu bir maliyet
            // merkezi değil, sadece "bir şey patladı mı" haberimiz olsun diye
            // var — gereğinden fazla veri toplamak hem ücretsiz kotayı hem
            // gizliliği gereksiz yere zorlar.
            tracesSampleRate: 0,
          });
          deps.target?.removeEventListener("error", onError);
          deps.target?.removeEventListener("unhandledrejection", onRejection);
          sdk = loaded;
          loaded.setTags(tags);
          for (const [error, context] of queue.splice(0)) loaded.captureException(error, context);
        })
        .catch(() => {
          // SDK inemedi (çevrimdışı, eski parça): uygulama etkilenmesin.
          // Bir sonraki hata yeniden denesin.
          loading = null;
        });
    }
    return loading;
  }

  function init(options: MonitoringConfig): void {
    if (!options.dsn || config) return;
    config = { ...options, dsn: options.dsn };
    deps.target?.addEventListener("error", onError);
    deps.target?.addEventListener("unhandledrejection", onRejection);
    deps.whenIdle(() => void load());
  }

  function captureException(error: unknown, context?: CaptureContext): void {
    if (sdk) {
      sdk.captureException(error, context);
      return;
    }
    if (!config) return;
    if (queue.length < MAX_QUEUED) queue.push([error, context]);
    void load();
  }

  /**
   * Etiketleri günceller. SDK inmeden önce verilenler saklanıp yüklenince
   * uygulanıyor; sıraya alınmış hatalar da böylece doğru etiketle gidiyor.
   */
  function setTags(next: MonitoringTags): void {
    tags = { ...tags, ...next };
    sdk?.setTags(next);
  }

  return { init, captureException, setTags, ready: () => loading ?? Promise.resolve() };
}

function whenIdle(run: () => void): void {
  if (typeof window === "undefined") return;
  if (typeof window.requestIdleCallback === "function") {
    window.requestIdleCallback(run, { timeout: 10_000 });
  } else {
    setTimeout(run, 3_000);
  }
}

const monitor = createMonitor({
  load: () => import("./sentrySdk"),
  whenIdle,
  target: typeof window !== "undefined" ? window : undefined,
});

export const initMonitoring = monitor.init;
export const captureException = monitor.captureException;
export const setMonitoringTags = monitor.setTags;
