import type { Player, Room } from "../types/database";

/**
 * "Kim hâlâ orada?" sorusunun tek cevap yeri.
 *
 * İki ayrı kopukluk vardı:
 *
 * 1. Host tarafında hiç sinyal yoktu. TV tarayıcısı kapanır ya da çökerse
 *    oda sonsuza kadar donuk kalıyor, misafirlerin telefonunda hiçbir
 *    açıklama çıkmıyordu. (`join.hostOffline` çevirisi üç dilde hazırdı ama
 *    hiçbir yerde kullanılmıyordu — özellik yarım kalmış.)
 *
 * 2. Oyuncu tarafı 30 sn'lik bir `last_active` filtresi uyguluyordu, ama
 *    hedefi seçen taraf HOST'tu ve host hiç filtre uygulamıyordu. Telefonu
 *    cebine koyup giden misafire bomba/voltaj geçiyor, tur süre dolana
 *    kadar kilitleniyordu.
 */

/** Oyuncu telefonu 15 sn'de bir ping atıyor (bkz. PlayerGame). */
const PLAYER_STALE_MS = 30_000;

/** Host ekranı da 15 sn'de bir ping atıyor (bkz. useHostRoom). */
const HOST_STALE_MS = 45_000;

/**
 * Oyuncu hâlâ oyunda mı.
 *
 * `last_active` hiç yoksa CANLI sayılıyor: alan eklenmeden önce katılmış ya
 * da eski sürümde açık kalmış bir telefon, sırf sinyal göndermiyor diye
 * oyun dışı bırakılmamalı. Yanlış tarafa düşmenin bedeli burada asimetrik —
 * gerçek bir misafiri elemek, hayalet bir oyuncuya sıra vermekten kötü.
 */
export function isPlayerActive(
  player: Pick<Player, "last_active">,
  now: number = Date.now(),
): boolean {
  if (typeof player.last_active !== "number") return true;
  return now - player.last_active < PLAYER_STALE_MS;
}

/**
 * Sırası gelebilecek oyuncuları süzer.
 *
 * Hiç aktif oyuncu kalmadıysa listenin tamamını geri veriyor: oyunu
 * kilitlemektense hayalet bir oyuncuya sıra vermek yeğ. Böylece çağıran
 * tarafın "boş liste" durumunu ayrıca ele alması gerekmiyor.
 */
export function activePlayers<T extends Pick<Player, "last_active">>(
  players: readonly T[],
  now: number = Date.now(),
): T[] {
  const live = players.filter((p) => isPlayerActive(p, now));
  return live.length > 0 ? live : [...players];
}

/**
 * Host ekranı hâlâ bağlı mı.
 *
 * `host_last_active` yoksa ÇEVRİMİÇİ sayılıyor — bu alan eklenmeden önce
 * açılmış odalar ve host'un henüz güncellenmemiş bir sürümü çalıştırdığı
 * durumlar, yanlışlıkla "host gitti" uyarısı göstermemeli.
 */
export function isHostOnline(
  room: Pick<Room, "host_last_active">,
  now: number = Date.now(),
): boolean {
  if (typeof room.host_last_active !== "number") return true;
  return now - room.host_last_active < HOST_STALE_MS;
}
