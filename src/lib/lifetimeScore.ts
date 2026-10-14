import type { Player } from "../types/database";

/** Bir oyuncu için yapılacak kalıcı (lig) puanı yazımı. */
export interface LifetimeCredit {
  playerId: string;
  uid: string;
  /** users/{uid}.total_lifetime_score'a eklenecek miktar; 0 ise yalnızca işaretçi güncellenir. */
  delta: number;
  /** players/{id}.lifetime_credited'ın yeni değeri. */
  credited: number;
}

type CreditablePlayer = Pick<Player, "id" | "uid" | "total_score" | "lifetime_credited">;

/**
 * Oda puanından kalıcı lig puanına henüz aktarılmamış farkları hesaplar.
 *
 * Aktarım eskiden oyuncunun kendi cihazında, bellekteki bir taban değere göre
 * yapılıyordu; kural da `users` alanlarını kısıtlamadığı için konsoldan
 * istenen puan yazılabiliyordu. Artık yazan personel hesaplı host ekranı ve
 * "ne kadar aktarıldı" bilgisi oyuncu dokümanında (`lifetime_credited`)
 * kalıcı: host sayfası yenilense de aynı puan iki kez eklenmez, arada
 * kazanılan puan da kaybolmaz.
 *
 * - Oda puanı 0'a döndüyse bu bir oda sıfırlamasıdır ("Tekrar Oyna"), puan
 *   kaybı değil: kalıcı puana dokunmadan yalnızca işaretçi sıfırlanır.
 * - Puan düştüyse (ör. hakem bir cevabı geçersiz saydı) fark eksi olarak
 *   aktarılır; eski oyuncu-taraflı senkron da böyle davranıyordu.
 * - Kimliği olmayan (anonim yer tutucu) oyuncular atlanır.
 */
export function pendingLifetimeCredits(players: readonly CreditablePlayer[]): LifetimeCredit[] {
  const credits: LifetimeCredit[] = [];
  for (const p of players) {
    if (!p.uid || p.uid === "anonymous") continue;
    const total = typeof p.total_score === "number" ? p.total_score : 0;
    const credited = typeof p.lifetime_credited === "number" ? p.lifetime_credited : 0;
    if (total === credited) continue;
    if (total === 0) {
      credits.push({ playerId: p.id, uid: p.uid, delta: 0, credited: 0 });
      continue;
    }
    credits.push({ playerId: p.id, uid: p.uid, delta: total - credited, credited: total });
  }
  return credits;
}
