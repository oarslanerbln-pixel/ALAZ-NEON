import { collection, doc, writeBatch } from "firebase/firestore";
import { db } from "./firebase";
import { generateCode } from "./codes";
import { resolveWinners, type Winner } from "./rewardWinners";
import { rewardPayload } from "./clientWrites";
import type { GameMode, Player, VenueConfig } from "../types/database";

/**
 * Belirtilen kazananlara mekan şablonundan bir Reward dokümanı yazar.
 * Kazananı NASIL belirlediği çağırana bağlı — puan bazlı oyunlar (arena,
 * quiz, sensör) `grantGameRewards`'ı kullanır; bomba gibi "son ayakta
 * kalan" modeliyle çalışan oyunlar kazananı kendi mantığıyla bulup
 * doğrudan bu fonksiyonu çağırır.
 *
 * Mekan ödül sistemi kapalıysa ya da satıcı henüz bir şablon tanımlamadıysa
 * (reward_title boş) sessizce hiçbir şey yapmaz — `rewards_enabled` açık
 * olsa bile boş/anlamsız bir ödül dağıtılmasın diye.
 *
 * Firestore yazma hatası (izin, bağlantı vb.) oyunun bitişini ENGELLEMEMELİ
 * — bu yüzden çağıran taraf hatayı yutup sadece konsola loglamalı, ödül
 * dağıtımı oyunun kendisinden daha az kritik.
 *
 * `roomId` zorunlu: kural ödülü yalnızca personel hesabıyla açılmış ve
 * yazanın host'u olduğu bir odaya bağlıysa kabul ediyor (firestore.rules).
 */
export async function grantRewardToPlayers(
  roomId: string,
  winners: Winner[],
  venue: VenueConfig,
): Promise<void> {
  if (!venue.rewards_enabled || !venue.reward_title?.trim()) return;
  const validWinners = winners.filter((w) => w.uid && w.uid !== "anonymous");
  if (validWinners.length === 0) return;

  const batch = writeBatch(db);
  const now = Date.now();
  for (const { uid, nickname } of validWinners) {
    const rewardRef = doc(collection(db, "rewards"));
    batch.set(
      rewardRef,
      rewardPayload({ roomId, uid, nickname, venue, code: generateCode(6), now }),
    );
  }
  await batch.commit();
}

/** Puan bazlı oyunlar için: kazananı puana göre bulur, sonra ödülü yazar. */
export async function grantGameRewards(
  roomId: string,
  gameMode: GameMode,
  players: Player[],
  venue: VenueConfig,
): Promise<void> {
  const winners = resolveWinners(gameMode, players);
  await grantRewardToPlayers(roomId, winners, venue);
}
