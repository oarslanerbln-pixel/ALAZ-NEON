/**
 * Telefonda gösterilen geri sayımın bitiş anı — telefonun KENDİ saatiyle.
 *
 * Host bitiş anını (`round_end_time`) TV'nin saatiyle yazıyor. Telefonun
 * saati TV'ninkinden birkaç saniye sapabildiği için o değeri doğrudan
 * kullanmak, kimi misafire süreyi erken bitmiş, kimine hiç başlamamış
 * gösteriyordu. Bu yüzden:
 *
 * - Aşamanın başladığını canlı gördüysek (`live`), süre o andan sayılır.
 *   Saat farkından etkilenmez; yalnızca ağ gecikmesi kadar (~yarım saniye)
 *   geride kalır.
 * - Sayfa aşamanın ortasında açıldıysa (yenileme, geç katılım) başlangıcı
 *   görmedik; host'un bitiş anına güveniyoruz ama tam süreden uzun ya da
 *   şimdiden önce olamayacak şekilde kırpıyoruz.
 *
 * Gösterim amaçlı: cevabın kabulüne host karar veriyor.
 */
export function countdownDeadline(opts: {
  mountedAt: number;
  durationMs: number;
  roundEndTime?: number | null;
  live: boolean;
}): number {
  const { mountedAt, durationMs, roundEndTime, live } = opts;
  const local = mountedAt + durationMs;
  if (live || !roundEndTime) return local;
  return Math.min(local, Math.max(mountedAt, roundEndTime));
}

/** Kalan süre (ms), [0, durationMs] aralığında. */
export function remainingMs(deadline: number, now: number, durationMs: number): number {
  return Math.min(durationMs, Math.max(0, deadline - now));
}
