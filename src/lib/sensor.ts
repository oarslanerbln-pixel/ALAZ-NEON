/**
 * Sensör (bulanık görsel tahmini) kuralları.
 *
 * Oyunun asıl gerilimi bir risk/ödül kararı: görsel hâlâ bulanıkken basmak
 * çok puan getirir ama yanılma riski yüksek; beklemek güvenli ama puan erir.
 * Eskiden bu karar yoktu: her doğru cevap sabit 100 puandı (düğmede +1000
 * yazıyordu), yanlış cevabın bedeli yoktu (aynı kişi hemen tekrar basabiliyordu)
 * ve her yanlış cevaptan sonra görsel baştan bulanıklaşıyordu.
 */
export const SENSOR_MAX_POINTS = 1000;
export const SENSOR_MIN_POINTS = 200;
export const SENSOR_DEFAULT_REVEAL_SEC = 25;

/** Bulanıklığın tamamen kalkma süresi: kurulumdaki ayar, 10–60 sn. */
export function sensorRevealSec(timerSetting: number | undefined): number {
  if (typeof timerSetting !== "number" || !Number.isFinite(timerSetting) || timerSetting <= 0) {
    return SENSOR_DEFAULT_REVEAL_SEC;
  }
  return Math.min(60, Math.max(10, Math.round(timerSetting)));
}

/**
 * Görselin açılma oranı [0, 1]. Başlangıç anı odada saklanıyor; buzzer
 * sırasında geçen süre başlangıç ileri kaydırılarak düşülüyor (bkz.
 * resumedStart), böylece yanlış cevaptan sonra görsel kaldığı yerden açılır.
 */
export function revealProgress(startedAt: number | undefined, now: number, revealSec: number): number {
  if (!startedAt || startedAt <= 0) return 0;
  return Math.min(1, Math.max(0, (now - startedAt) / (revealSec * 1000)));
}

/** Doğru cevabın puanı: açılma oranıyla doğrusal olarak 1000 → 200, 10'a yuvarlı. */
export function sensorPoints(progress: number): number {
  const p = Math.min(1, Math.max(0, progress));
  const raw = SENSOR_MAX_POINTS - (SENSOR_MAX_POINTS - SENSOR_MIN_POINTS) * p;
  return Math.round(raw / 10) * 10;
}

/** Buzzer süresi kadar başlangıcı ileri kaydırır: bekleme puanı eritmez. */
export function resumedStart(startedAt: number, pausedAt: number, now: number): number {
  return startedAt + Math.max(0, now - pausedAt);
}

/** Bu görselde basabilecek (kilitlenmemiş) oyuncu kaldı mı. */
export function everyoneLockedOut(playerIds: readonly string[], lockedOut: readonly string[]): boolean {
  if (playerIds.length === 0) return false;
  const locked = new Set(lockedOut);
  return playerIds.every((id) => locked.has(id));
}
