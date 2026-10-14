import type { Player } from "../types/database";

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

/**
 * Oyuncu telefonu 30 sn'de bir ping atıyor (bkz. PlayerGame → useHeartbeat).
 * Bomba/voltaj hedefi buna bakıyor.
 *
 * Aralık eskiden 15 sn'ydi. Her ping host'un `players` dinleyicisine bir
 * okuma olarak düşüyor: 30 misafirli 4 saatlik bir gece yalnızca bununla
 * ~28.800 okuma ediyordu (Spark günlük kotası 50.000; bkz. docs/roadmap.md,
 * M2). Eşik aralığın iki katı: tek bir geç/kaybolan ping oyuncuyu elemiyor.
 * Telefonu kilitlenen oyuncu sinyali hemen kesiyor (useHeartbeat sekme
 * gizlenince durur), en geç 60 sn içinde hedef dışı kalıyor; geri
 * döndüğünde anında ping atıp tekrar hedeflenebilir oluyor.
 */
export const PLAYER_HEARTBEAT_MS = 30_000;
const PLAYER_STALE_MS = 60_000;

/**
 * Host ekranı 30 sn'de bir ping atıyor (bkz. useHostRoom → useHeartbeat).
 * Her ping oda dokümanını değiştirdiği için odadaki HER telefonda bir okuma
 * demek: 30 misafirli 3 saatlik bir gecede 15 sn aralık ~21.600 okuma
 * ediyordu (Spark planın günlük kotası 50.000). Uyarı yalnızca
 * bilgilendirme amaçlı, 75 sn gecikme kabul edilebilir.
 */
export const HOST_HEARTBEAT_MS = 30_000;
const HOST_STALE_MS = 75_000;

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
 * Host ekranı hâlâ bağlı mı — saat kaymasına dayanıklı.
 *
 * `host_last_active` TV'nin saatiyle yazılıyor. Eskiden misafir bunu kendi
 * telefonunun saatiyle kıyaslıyordu; saati birkaç dakika geri kalmış bir
 * akıllı TV'de odadaki herkes host yanıbaşında dururken kalıcı bir "HOST
 * ÇEVRİMDIŞI" uyarısı görüyordu. Artık iki farklı saati hiç kıyaslamıyoruz:
 * misafir, değerin en son DEĞİŞTİĞİNİ kendi saatiyle ne zaman gördüğüne
 * bakıyor (`lastChangeSeenAt`).
 *
 * `lastChangeSeenAt` `null` ise (alan hiç yok) ÇEVRİMİÇİ sayılıyor — bu alan
 * eklenmeden önce açılmış odalar yanlışlıkla "host gitti" uyarısı almasın.
 */
export function isHostOnline(lastChangeSeenAt: number | null, now: number = Date.now()): boolean {
  if (lastChangeSeenAt === null) return true;
  return now - lastChangeSeenAt < HOST_STALE_MS;
}
