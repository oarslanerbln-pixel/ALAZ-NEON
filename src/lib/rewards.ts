import { collection, doc, writeBatch } from "firebase/firestore";
import { db } from "./firebase";
import { generateCode } from "./codes";
import type { GameMode, Player, Reward, VenueConfig } from "../types/database";

interface Winner {
  uid: string;
  nickname: string;
}

/**
 * Bireysel modda en yüksek puanlı oyuncu(lar), takım modunda kazanan
 * takımın TÜM üyeleri — bir oyun modu takım skorunu izlemiyorsa (quiz/
 * bomb/sensör) çağıran taraf zaten "individual" geçiyor, bu yüzden bu
 * fonksiyon değişiklik yapmadan her oyun tipinde kullanılabiliyor.
 *
 * Beraberlik durumunda (aynı en yüksek puana sahip birden fazla oyuncu/
 * takım) hepsi kazanan sayılır — kimseyi keyfi biçimde elemek yerine.
 */
export function resolveWinners(gameMode: GameMode, players: Player[]): Winner[] {
  const scored = players.filter(
    (p) => (p.total_score || 0) > 0 && p.uid && p.uid !== "anonymous",
  );
  if (scored.length === 0) return [];

  if (gameMode === "team") {
    const teamScores = new Map<string, number>();
    for (const p of scored) {
      const key = p.team_name || p.id; // takımsız oyuncu tek kişilik kendi takımı
      teamScores.set(key, (teamScores.get(key) || 0) + (p.total_score || 0));
    }
    const maxTeamScore = Math.max(...teamScores.values());
    const winningTeamKeys = new Set(
      [...teamScores.entries()].filter(([, s]) => s === maxTeamScore).map(([k]) => k),
    );
    return scored
      .filter((p) => winningTeamKeys.has(p.team_name || p.id))
      .map((p) => ({ uid: p.uid!, nickname: p.nickname }));
  }

  const maxScore = Math.max(...scored.map((p) => p.total_score || 0));
  return scored
    .filter((p) => p.total_score === maxScore)
    .map((p) => ({ uid: p.uid!, nickname: p.nickname }));
}

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
 */
export async function grantRewardToPlayers(
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
    const reward: Omit<Reward, "id"> = {
      uid,
      nickname,
      type: venue.reward_type || "drink",
      title: venue.reward_title.trim(),
      description: venue.reward_description?.trim() || "",
      status: "available",
      code: generateCode(6),
      earned_at: now,
    };
    batch.set(rewardRef, reward);
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
