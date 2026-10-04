import { useEffect } from "react";

/**
 * Tur geri sayımı: bitiş anı odadan (`round_end_time`) okunur, böylece host
 * sayfayı yenilese ya da başka cihazdan devralsa da süre kaldığı yerden
 * devam eder. Saniyede iki kez kalan süreyi bildirir; süre dolunca
 * `onExpire` bir kez çağrılır.
 */
export function useRoundTimer(
  active: boolean,
  roundEndTime: number | null,
  onTick: (remainingSec: number) => void,
  onExpire: () => void,
) {
  useEffect(() => {
    if (!active || !roundEndTime) return;

    const tick = () => {
      const remaining = Math.max(0, Math.floor((roundEndTime - Date.now()) / 1000));
      onTick(remaining);
      return remaining;
    };

    // Hemen bir kez çalıştır: yenileme sonrası ekranın 500ms boyunca eski
    // süreyi göstermesini engelliyor ve süresi çoktan dolmuş bir turu
    // (host bir süre kapalı kalmışsa) anında kapatıyor. Kapatma bir tik
    // sonraya alınıyor; efekt gövdesinde senkron setState zincirleme render
    // doğuruyor.
    if (tick() === 0) {
      const timeout = setTimeout(onExpire, 0);
      return () => clearTimeout(timeout);
    }

    const interval = setInterval(() => {
      if (tick() === 0) {
        clearInterval(interval);
        onExpire();
      }
    }, 500);
    return () => clearInterval(interval);
  }, [active, roundEndTime, onTick, onExpire]);
}
