/**
 * Bomba fitili. Kurulum ekranındaki "fitil süresi" (15/20/30/45 sn) eskiden
 * hiçbir yere bağlı değildi: ilk el sabit 15 sn, her pas sabit 14 sn'den
 * kısalıyordu. Artık ikisi de odanın `timer_setting` değerinden geliyor.
 */
export const BOMB_DEFAULT_FUSE_SEC = 15;
/** Her pasta fitil bu oranla kısalır; alt sınır, oyunu imkânsız kılmamak için. */
export const BOMB_SPEEDUP_PER_PASS = 0.95;
export const BOMB_MIN_MULTIPLIER = 0.35;

export function bombFuseSec(timerSetting: number | undefined): number {
  if (typeof timerSetting !== "number" || !Number.isFinite(timerSetting)) return BOMB_DEFAULT_FUSE_SEC;
  return Math.min(60, Math.max(10, Math.round(timerSetting)));
}

/** Bir pastan sonraki yeni çarpan ve fitil süresi (ms). */
export function nextPassFuse(
  timerSetting: number | undefined,
  currentMultiplier: number | undefined,
): { multiplier: number; fuseMs: number } {
  const multiplier = Math.max(BOMB_MIN_MULTIPLIER, (currentMultiplier || 1) * BOMB_SPEEDUP_PER_PASS);
  return { multiplier, fuseMs: Math.round(bombFuseSec(timerSetting) * 1000 * multiplier) };
}
