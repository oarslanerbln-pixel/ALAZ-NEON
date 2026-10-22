import { generateCode } from "./codes";
import type { GameMode, Player, Reward, VenueConfig } from "../types/database";

export interface Winner {
  uid: string;
  nickname: string;
}

/**
 * Saf kazanan hesaplama mantığı — Firestore'a hiç dokunmuyor, bilerek
 * `./firebase`'i (ya da onu import eden hiçbir şeyi) import ETMİYOR.
 *
 * Sebep: `firebase.ts` modül yüklenirken Auth'u başlatıyor (`initializeAuth`); env
 * değişkenleri yoksa (CI'daki `Unit tests` adımı .env.local taşımıyor)
 * bu çağrı `auth/invalid-api-key` ile patlıyor. `scoring.ts` de aynı
 * sebeple firebase.ts'i hiç import etmiyor — kurulu örüntü bu: saf hesap
 * mantığı Firebase'siz, Firestore'a yazan orkestrasyon (rewards.ts) ayrı
 * dosyada.
 *
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

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Kazananlar için yazılacak ödül dokümanlarını üretir (saf — Firestore'a
 * dokunmaz). Şekli firestore.rules'taki `isValidNewReward` ile birebir
 * aynı olmalı; kural fazladan alanı reddediyor.
 *
 * Mekan ödül sistemi kapalıysa ya da satıcı henüz bir şablon tanımlamadıysa
 * (reward_title boş) boş liste döner — `rewards_enabled` açık olsa bile
 * boş/anlamsız bir ödül dağıtılmasın diye. Oturumsuz ("anonymous") kazanan
 * ödül alamaz: ödülü görebileceği bir hesap yok.
 */
export function buildRewardDocs(
  winners: Winner[],
  venue: VenueConfig,
  now: number,
  makeCode: () => string = () => generateCode(6),
): Omit<Reward, "id">[] {
  const title = venue.reward_title?.trim();
  if (!venue.rewards_enabled || !title) return [];

  // Firestore `set()` undefined alan kabul etmiyor (hata fırlatıyor) — bu
  // yüzden geçerlilik günü tanımlı değilse expires_at anahtarını objeye hiç
  // eklemiyoruz, `undefined` olarak set etmiyoruz.
  const validityDays = venue.reward_validity_days;
  const expiresAt =
    typeof validityDays === "number" && validityDays > 0 ? now + validityDays * DAY_MS : null;

  return winners
    .filter((w) => w.uid && w.uid !== "anonymous")
    .map(({ uid, nickname }) => ({
      uid,
      nickname,
      type: venue.reward_type || "drink",
      title,
      description: venue.reward_description?.trim() || "",
      status: "available" as const,
      code: makeCode(),
      earned_at: now,
      ...(expiresAt !== null ? { expires_at: expiresAt } : {}),
    }));
}
