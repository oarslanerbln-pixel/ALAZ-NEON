import { generateCode } from "./codes";
import type { Room } from "../types/database";

/**
 * Oda kodu seçim mantığı — saf, Firestore'a hiç dokunmuyor.
 *
 * Sorguyu çağıran taraf enjekte ediyor (bkz. roomQueries.ts). Bunun sebebi
 * mimari saflık değil, test edilebilirlik: lib/firebase.ts import edildiği
 * anda Firebase'i başlatıyor, dolayısıyla bu dosya Firestore'u doğrudan
 * import etseydi buradaki mantık hiç test edilemezdi. Asıl hata da tam
 * olarak bu mantıkta duruyordu.
 */

/**
 * Bir oda kodunun "hâlâ sahipli" sayıldığı süre.
 *
 * Odalar hiçbir zaman silinmiyor ve kapanmıyor (kod tabanında tek bir
 * deleteDoc yok, "closed" durumu da hiçbir yerde yazılmıyor), dolayısıyla
 * "aktif oda" durum alanından çıkarılamıyor. Bunun yerine zamana bakıyoruz:
 * bir kafe oturumu bir geceyi aşmıyor, o yüzden 24 saatten eski bir odanın
 * kodu yeniden kullanılabilir. Kod uzayı (32^4 ≈ 1M) böylece o gece açılan
 * oda sayısıyla sınırlı kalıyor, tüm geçmişle değil.
 */
export const ROOM_CODE_LIFETIME_MS = 24 * 60 * 60 * 1000;

/** Oda kodu uzunluğu — QR okutamayan misafir bunu elle giriyor. */
export const ROOM_CODE_LENGTH = 4;

/** Oyuncunun artık katılamayacağı durumlar. */
const CLOSED_STATUSES: ReadonlySet<string> = new Set(["closed", "finished"]);

export type RoomLike = Pick<Room, "status"> & { created_at?: number };

/** Aynı kodu taşıyan odaları getiren fonksiyon (Firestore'a bağlanan taraf). */
export type RoomsByCodeFetcher<T extends RoomLike> = (code: string) => Promise<T[]>;

/**
 * Bir oda "canlı" mı: son 24 saat içinde açılmış ve kapanmamış.
 *
 * `created_at` okunamayan (eski/bozuk) odalar canlı SAYILIYOR: kod ataması
 * açısından güvenli taraf, kodu boşta sanıp çakıştırmak değil, meşgul sayıp
 * başka bir kod üretmek.
 */
export function isRoomLive(room: RoomLike, now: number = Date.now()): boolean {
  if (CLOSED_STATUSES.has(room.status)) return false;
  if (typeof room.created_at !== "number" || Number.isNaN(room.created_at)) return true;
  return now - room.created_at < ROOM_CODE_LIFETIME_MS;
}

/**
 * Aynı kodu taşıyan odalar arasından oyuncunun katılması gerekeni seçer.
 *
 * Önceden çağıran taraf sorgudan dönen ilk dokümanı (`docs[0]`) alıp durum
 * kontrolünü ONDAN SONRA yapıyordu. Kod çakışması varsa Firestore'un
 * döndürdüğü sıra garanti olmadığı için oyuncu kapanmış eski bir odaya
 * düşüp "oyun başlamış" hatası alabiliyor, canlı odaya hiç giremiyordu.
 * Artık önce eleme yapılıyor, sonra EN YENİ canlı oda seçiliyor.
 */
export function pickJoinableRoom<T extends RoomLike>(
  rooms: readonly T[],
  now: number = Date.now(),
): T | null {
  const live = rooms.filter((r) => isRoomLive(r, now));
  if (live.length === 0) return null;
  return live.reduce((newest, candidate) =>
    (candidate.created_at ?? 0) > (newest.created_at ?? 0) ? candidate : newest,
  );
}

/**
 * Canlı bir odanın kullanmadığı bir oda kodu üretir.
 *
 * Önceden kod hiçbir kontrol olmadan üretiliyordu. Odalar da hiç silinmediği
 * için çakışma olasılığı her açılan odayla artıyordu; doğum günü paradoksu
 * gereği ~1.200 odadan sonra veritabanında en az bir çift aynı koda sahip
 * oda bulunma olasılığı %50'yi geçiyor. Çakışan iki odadan biri oyuncuyu
 * yanlış odaya düşürüyordu.
 *
 * Deneme sayısı sınırlı ve son çare olarak kontrolsüz koda düşüyor: gece
 * ortasında Firestore'a ulaşılamadığında kafenin oyunu HİÇ açamaması,
 * düşük ihtimalli bir çakışmadan daha kötü.
 */
export async function allocateRoomCode<T extends RoomLike>(
  fetchRoomsWithCode: RoomsByCodeFetcher<T>,
  attempts = 5,
): Promise<string> {
  let code = generateCode(ROOM_CODE_LENGTH);
  for (let i = 0; i < attempts; i++) {
    code = generateCode(ROOM_CODE_LENGTH);
    try {
      const existing = await fetchRoomsWithCode(code);
      if (!existing.some((room) => isRoomLive(room))) return code;
    } catch (err) {
      console.error("[allocateRoomCode] Kod kontrolü yapılamadı:", err);
      return code;
    }
  }
  console.warn(
    `[allocateRoomCode] ${attempts} denemede boş kod bulunamadı; son kod kullanılıyor.`,
  );
  return code;
}
