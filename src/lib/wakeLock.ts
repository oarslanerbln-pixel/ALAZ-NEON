/**
 * Ekranı uyanık tutma (docs/roadmap.md, 2.5).
 *
 * Oyun sırasında kimse telefona dokunmadan dakikalarca TV'yi izliyor; sistem
 * ekranı karartıp kilitleyince oyuncu soruyu kaçırıyor, kilitli telefon da
 * canlılık sinyalini kesip bir sonraki turda "kopmuş" sayılıyordu. TV/tablet
 * için de aynısı: ekran koruyucu QR kodunu ve skor tablosunu kapatıyordu.
 *
 * Screen Wake Lock API'nin üç tuzağı burada ele alınıyor:
 *  1. Sekme gizlenince tarayıcı kilidi kendiliğinden bırakır ve geri
 *     dönüşte yeniden ALMAZ — görünürlük dönüşünde yeniden isteniyor.
 *  2. Bazı tarayıcılar (iOS Safari, pil tasarrufu) isteği kullanıcı
 *     etkileşimi olmadan reddedebilir ya da kilidi görünürken bırakabilir —
 *     o durumda ilk dokunuşta/tuşta bir kez daha deneniyor (döngü yok).
 *  3. API'nin olmaması hata değildir: eski tarayıcıda hiçbir şey yapılmaz.
 *
 * Ortam (tarayıcı API'leri) dışarıdan veriliyor ki mantık birim testle
 * sınanabilsin; tarayıcı bağlaması `browserWakeLockEnv()`.
 */

export interface WakeLockHandle {
  release(): Promise<void>;
  addEventListener(type: "release", listener: () => void): void;
}

export interface WakeLockEnv {
  /** `navigator.wakeLock.request("screen")`; API yoksa `undefined`. */
  request?: () => Promise<WakeLockHandle>;
  isVisible(): boolean;
  /** Abone olur, aboneliği kaldıran fonksiyonu döner. */
  onVisibilityChange(listener: () => void): () => void;
  /** İlk dokunuş/tuş için abone olur, aboneliği kaldıran fonksiyonu döner. */
  onUserGesture(listener: () => void): () => void;
}

const noop = () => {};

/**
 * Ekranı uyanık tutmaya başlar; dönen fonksiyon kilidi bırakır ve tüm
 * abonelikleri kaldırır. Birden çok kez çağrılması güvenlidir.
 */
export function keepScreenAwake(env: WakeLockEnv): () => void {
  const request = env.request;
  if (!request) return noop;

  let wanted = true;
  let lock: WakeLockHandle | null = null;
  let pending = false;
  let stopGestureRetry: (() => void) | null = null;

  const disarmGestureRetry = () => {
    stopGestureRetry?.();
    stopGestureRetry = null;
  };

  // Reddedilen ya da görünürken bırakılan kilit için tek seferlik yeniden
  // deneme. Hemen tekrar istemek aynı sebeple yine reddedilir (ya da pil
  // tasarrufunda sonsuz al-bırak döngüsü olur); kullanıcının bir sonraki
  // etkileşimi hem iOS'un "kullanıcı jesti" şartını karşılar hem de doğal bir
  // fren görevi görür.
  const armGestureRetry = () => {
    if (!wanted || stopGestureRetry) return;
    stopGestureRetry = env.onUserGesture(() => {
      disarmGestureRetry();
      acquire();
    });
  };

  const acquire = () => {
    if (!wanted || lock || pending || !env.isVisible()) return;
    pending = true;
    request().then(
      (handle) => {
        pending = false;
        if (!wanted) {
          // İstek yoldayken ekran kapatıldı: alınan kilidi hemen bırak.
          handle.release().catch(noop);
          return;
        }
        lock = handle;
        disarmGestureRetry();
        handle.addEventListener("release", () => {
          if (lock === handle) lock = null;
          // Gizlenince bırakılması olağan: görünürlük dönüşü yeniden alır.
          // Görünürken bırakıldıysa (pil tasarrufu vb.) ilk etkileşimi bekle.
          if (env.isVisible()) armGestureRetry();
        });
      },
      () => {
        pending = false;
        armGestureRetry();
      },
    );
  };

  const onVisibility = () => {
    if (env.isVisible()) acquire();
  };
  const stopVisibility = env.onVisibilityChange(onVisibility);
  acquire();

  return () => {
    if (!wanted) return;
    wanted = false;
    stopVisibility();
    disarmGestureRetry();
    const held = lock;
    lock = null;
    held?.release().catch(noop);
  };
}

/** Gerçek tarayıcı bağlaması. */
export function browserWakeLockEnv(): WakeLockEnv {
  const wakeLock =
    typeof navigator !== "undefined" && "wakeLock" in navigator ? navigator.wakeLock : undefined;

  return {
    request: wakeLock ? () => wakeLock.request("screen") : undefined,
    isVisible: () => document.visibilityState === "visible",
    onVisibilityChange: (listener) => {
      document.addEventListener("visibilitychange", listener);
      return () => document.removeEventListener("visibilitychange", listener);
    },
    onUserGesture: (listener) => {
      const options = { capture: true, passive: true } as const;
      window.addEventListener("pointerdown", listener, options);
      window.addEventListener("keydown", listener, options);
      return () => {
        window.removeEventListener("pointerdown", listener, options);
        window.removeEventListener("keydown", listener, options);
      };
    },
  };
}
