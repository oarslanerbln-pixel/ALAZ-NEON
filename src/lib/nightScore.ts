import type { GameType, Player, Room } from "../types/database";

/**
 * GECENİN ŞAMPİYONU — oyunları birbirine bağlayan gece boyu süren yarış.
 *
 * Dashboard her misafirin "gece puanını" (night_score) gösteriyordu ama bu
 * alan hiçbir yerde yazılmıyordu: herkes gece boyu 0'da kalıyordu. Ayrı ayrı
 * 14 mini oyun, gecenin tamamına yayılan bir hedef olmadan tek seferlik
 * kalıyordu (oturum döngüsü eksikti).
 *
 * Neden ham puan değil de SIRALAMA puanı: oyunların ölçekleri uyumsuz — bir
 * quiz sorusu 1500, bir sensör görseli 200–1000, Arena turu 10–40 puan
 * getiriyor. Ham puan toplansaydı gece şampiyonu hep quiz'de iyi olan olurdu.
 * Yarış oyunlarındaki gibi (F1 / Mario Kart) sıralama puanı her oyunu eşit
 * ağırlıkta tutar; katılım puanı da oynayan herkesi ödüllendirir.
 */
export const PLACEMENT_POINTS = [10, 7, 5, 3, 2] as const;
export const PARTICIPATION_POINTS = 1;
/** İşbirliği oyunlarında (Birlik) ortak hedef tutarsa herkese. */
export const COOP_WIN_POINTS = 3;

export type Standings = {
  /** Sıralı gruplar; aynı gruptakiler berabere. Yalnızca derece alanlar. */
  groups: string[][];
  /** Katılım puanı alacak herkes (derece alanlar dahil). */
  participants: string[];
  /** İşbirliği oyunu: herkes aynı puanı alır (grup yerine). */
  coopPoints?: number;
};

/**
 * Standart yarışma sıralaması: iki kişi birinciyse ikisi de 10 alır, sonraki
 * kişi üçüncü sayılır (5). İlk beşin dışı ve derecesizler yalnızca katılım.
 */
export function awardNightPoints(standings: Standings): Record<string, number> {
  const out: Record<string, number> = {};
  for (const id of standings.participants) out[id] = PARTICIPATION_POINTS;
  if (standings.coopPoints !== undefined) {
    for (const id of standings.participants) out[id] = standings.coopPoints;
    return out;
  }
  let position = 0;
  for (const group of standings.groups) {
    const pts = PLACEMENT_POINTS[position] ?? PARTICIPATION_POINTS;
    for (const id of group) out[id] = Math.max(out[id] ?? 0, pts);
    position += group.length;
  }
  return out;
}

/** Skora göre gruplar; skoru 0 ya da olmayan derece almaz. */
export function rankByScore(entries: { id: string; score: number | undefined }[]): string[][] {
  const scored = entries.filter((e) => (e.score ?? 0) > 0);
  scored.sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  const groups: string[][] = [];
  let last: number | null = null;
  for (const e of scored) {
    if (last !== null && e.score === last) groups[groups.length - 1].push(e.id);
    else groups.push([e.id]);
    last = e.score ?? 0;
  }
  return groups;
}

/** Oyunun bitti sayıldığı durum. `null` = bu oyun gece puanı vermiyor. */
const TERMINAL_STATUS: Partial<Record<GameType, Room["status"]>> = {
  scattegories: "finished",
  quiz: "finished",
  sensor: "finished",
  bomb: "finished",
  overload: "finished",
  ayna: "ayna_final",
  vault: "vault_reveal",
  kablo: "kablo_reveal",
  bar: "bar_reveal",
  colors: "colors_reveal",
  spectrum: "spectrum_reveal",
  unity: "unity_reveal",
  pulse: "pulse_reveal",
  // echo (kim daha çok ... oylaması) ve wheel (şans) bilinçli olarak yok:
  // beceri değil, gece yarışını belirlememeli.
};

export function isNightScoredFinish(game: GameType | null, status: Room["status"]): boolean {
  return game !== null && TERMINAL_STATUS[game] === status;
}

function teamWinners(
  teams: Record<string, "red" | "blue"> | null | undefined,
  winner: "red" | "blue" | "draw" | null | undefined,
): string[] {
  if (!teams || !winner || winner === "draw") return [];
  return Object.entries(teams)
    .filter(([, team]) => team === winner)
    .map(([id]) => id);
}

/** Bitmiş bir oyunun gece sıralaması. */
export function gameStandings(game: GameType, room: Room, players: Player[]): Standings {
  const participants = players.map((p) => p.id);
  const present = new Set(participants);
  const onlyPresent = (ids: string[]) => ids.filter((id) => present.has(id));
  const byField = (field: keyof Player) =>
    rankByScore(players.map((p) => ({ id: p.id, score: p[field] as number | undefined })));

  switch (game) {
    case "scattegories":
    case "quiz":
    case "sensor":
    case "bomb":
      return { groups: byField("total_score"), participants };
    case "bar":
      return { groups: byField("bar_score"), participants };
    case "kablo":
      return { groups: byField("kablo_score"), participants };
    case "ayna":
      return {
        groups: rankByScore(players.map((p) => ({ id: p.id, score: room.ayna_totals?.[p.id] }))),
        participants,
      };
    case "overload": {
      // Şampiyon: elenmemiş olan; sonra en son elenenden ilk elenene. Host
      // oyunu erken bitirdiyse hayatta kalanlar birlikte ilk sırayı paylaşır.
      const eliminated = room.overload_eliminated_ids || [];
      const survivors = participants.filter((id) => !eliminated.includes(id));
      const groups = survivors.length > 0 ? [survivors] : [];
      for (const id of [...eliminated].reverse()) if (present.has(id)) groups.push([id]);
      return { groups, participants };
    }
    case "vault":
      return {
        groups: room.vault_winner_id && present.has(room.vault_winner_id) ? [[room.vault_winner_id]] : [],
        participants,
      };
    case "colors": {
      const winners = onlyPresent(teamWinners(room.colors_team_assignments, room.colors_winner));
      return { groups: winners.length ? [winners] : [], participants };
    }
    case "spectrum": {
      let red = 0;
      let blue = 0;
      for (const p of players) {
        const team = room.spectrum_teams?.[p.id];
        if (team === "red") red += p.spectrum_clicks || 0;
        else if (team === "blue") blue += p.spectrum_clicks || 0;
      }
      const winner = red > blue ? "red" : blue > red ? "blue" : "draw";
      const winners = onlyPresent(teamWinners(room.spectrum_teams, winner));
      return { groups: winners.length ? [winners] : [], participants };
    }
    case "unity": {
      const total = players.reduce((sum, p) => sum + (p.unity_clicks || 0), 0);
      const won = !!room.unity_target && total >= room.unity_target;
      return { groups: [], participants, coopPoints: won ? COOP_WIN_POINTS : PARTICIPATION_POINTS };
    }
    default:
      return { groups: [], participants };
  }
}

/**
 * Bir oyun örneğinin kimliği. Aynı oyun aynı gece ikinci kez oynanabilir;
 * puan her oyun örneği için yalnızca BİR KEZ verilmeli (TV yenilemesi,
 * iki ekranın aynı odayı açması).
 */
export function nightAwardKey(room: Pick<Room, "active_game" | "game_started_at">): string | null {
  if (!room.active_game || room.active_game === "none" || !room.game_started_at) return null;
  return `${room.active_game}:${room.game_started_at}`;
}
