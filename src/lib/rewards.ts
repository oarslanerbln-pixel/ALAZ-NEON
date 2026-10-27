import { collection, doc, getDoc, writeBatch } from "firebase/firestore";
import { auth, db } from "./firebase";
import { buildRewardDocs, resolveWinners, type Winner } from "./rewardWinners";
import type { GameMode, Player, VenueConfig } from "../types/database";

/**
 * Bu cihazdaki oturum ödül yazabilir mi? Kural ödül oluşturmayı yalnızca
 * personele açıyor (bkz. firestore.rules → rewards): herkes oda açabildiği
 * için "host olmak" güvence değil. Anonim TV oturumunda yazmayı hiç
 * denemiyoruz — her oyun sonunda konsola izin hatası düşmesin.
 */
export async function canGrantRewards(): Promise<boolean> {
  const user = auth.currentUser;
  if (!user || user.isAnonymous) return false;
  const token = await user.getIdTokenResult();
  if (token.claims.staff === true) return true;
  return (await getDoc(doc(db, "staff", user.uid))).exists();
}

/**
 * Belirtilen kazananlara mekan şablonundan bir Reward dokümanı yazar.
 * Kazananı NASIL belirlediği çağırana bağlı — puan bazlı oyunlar (arena,
 * quiz, sapan) `grantGameRewards`'ı kullanır; bomba gibi "son ayakta
 * kalan" modeliyle çalışan oyunlar kazananı kendi mantığıyla bulup
 * doğrudan bu fonksiyonu çağırır.
 *
 * Firestore yazma hatası (izin, bağlantı vb.) oyunun bitişini ENGELLEMEMELİ
 * — bu yüzden çağıran taraf hatayı yutup sadece konsola loglamalı, ödül
 * dağıtımı oyunun kendisinden daha az kritik.
 */
export async function grantRewardToPlayers(
  winners: Winner[],
  venue: VenueConfig,
): Promise<void> {
  const rewards = buildRewardDocs(winners, venue, Date.now());
  if (rewards.length === 0 || !(await canGrantRewards())) return;

  const batch = writeBatch(db);
  for (const reward of rewards) {
    batch.set(doc(collection(db, "rewards")), reward);
  }
  await batch.commit();
}

/** Puan bazlı oyunlar için: kazananı puana göre bulur, sonra ödülü yazar. */
export async function grantGameRewards(
  gameMode: GameMode,
  players: Player[],
  venue: VenueConfig,
): Promise<void> {
  const winners = resolveWinners(gameMode, players);
  await grantRewardToPlayers(winners, venue);
}
