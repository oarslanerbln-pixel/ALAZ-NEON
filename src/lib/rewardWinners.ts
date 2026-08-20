import type { GameMode, Player } from "../types/database";

export interface Winner {
  uid: string;
  nickname: string;
}

/**
 * Saf kazanan hesaplama mantığı — Firestore'a hiç dokunmuyor, bilerek
 * `./firebase`'i (ya da onu import eden hiçbir şeyi) import ETMİYOR.
 *
 * Sebep: `firebase.ts` modül yüklenirken `getAuth(app)` çağırıyor; env
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
