/**
 * Mekan KPI'ları (docs/roadmap.md, 3.2): TV'nin yazdığı oyun olaylarından
 * (`events`) ve oyuncu kayıtlarından hesaplanır. Eski rapor "en çok oynanan
 * oyun"u odanın SON oyunundan sayıyordu; bir gece onlarca oyun barındırdığı
 * için sonuç yanıltıcıydı.
 */
export interface GameEventRecord {
  type: "game_started" | "game_ended";
  room_id: string;
  game: string;
  player_count: number;
  started_at: number;
  ended_at?: number | null;
}

export interface VenueKpis {
  /** Başlatılan oyun sayısı. */
  gamesPlayed: number;
  /** Gece (oda) başına oyun; gece yoksa 0. */
  gamesPerNight: number;
  /** En çok oynanandan aza, eşitlikte ada göre. */
  topGames: { game: string; count: number }[];
  /** Başlangıçtaki ortalama oyuncu sayısı. */
  avgPlayersPerGame: number;
  /** Biten oyunların ortalama süresi (dk); biten oyun yoksa null. */
  avgGameMinutes: number | null;
  /** En çok oyunun başladığı saat (0–23); oyun yoksa null. */
  peakHour: number | null;
  /** Aralıktaki tekil misafir (cihaz/hesap). */
  uniqueGuests: number;
  /** Aralıktan önce de oynamış misafir. */
  returningGuests: number;
  /** returningGuests / uniqueGuests; misafir yoksa null. */
  returningRate: number | null;
}

const round1 = (n: number) => Math.round(n * 10) / 10;

/** Oyun süresi bundan uzunsa TV kapatılmadan bırakılmış sayılır, ortalamaya katılmaz. */
export const MAX_GAME_MINUTES = 90;

export function computeVenueKpis(input: {
  events: readonly GameEventRecord[];
  nightCount: number;
  /** Aralıktaki oyuncu kayıtlarının uid'leri (tekrarlı olabilir). */
  guestUids: readonly string[];
  /** Aralıktan önce görülmüş uid'ler. */
  priorGuestUids: ReadonlySet<string>;
  /** Saat dilimi için; testte sabitlenir. */
  hourOf?: (ms: number) => number;
}): VenueKpis {
  const hourOf = input.hourOf ?? ((ms: number) => new Date(ms).getHours());
  const started = input.events.filter((e) => e.type === "game_started");

  const byGame = new Map<string, number>();
  const byHour = new Map<number, number>();
  for (const e of started) {
    byGame.set(e.game, (byGame.get(e.game) ?? 0) + 1);
    const hour = hourOf(e.started_at);
    byHour.set(hour, (byHour.get(hour) ?? 0) + 1);
  }
  const topGames = [...byGame.entries()]
    .map(([game, count]) => ({ game, count }))
    .sort((a, b) => b.count - a.count || a.game.localeCompare(b.game));
  const peakHour = [...byHour.entries()].sort((a, b) => b[1] - a[1] || a[0] - b[0])[0]?.[0] ?? null;

  const durations = input.events
    .filter((e) => e.type === "game_ended" && typeof e.ended_at === "number")
    .map((e) => ((e.ended_at as number) - e.started_at) / 60_000)
    .filter((minutes) => minutes > 0 && minutes <= MAX_GAME_MINUTES);

  const guests = new Set(input.guestUids.filter(Boolean));
  const returning = [...guests].filter((uid) => input.priorGuestUids.has(uid)).length;

  return {
    gamesPlayed: started.length,
    gamesPerNight: input.nightCount > 0 ? round1(started.length / input.nightCount) : 0,
    topGames,
    avgPlayersPerGame: started.length > 0 ? round1(started.reduce((sum, e) => sum + e.player_count, 0) / started.length) : 0,
    avgGameMinutes: durations.length > 0 ? round1(durations.reduce((a, b) => a + b, 0) / durations.length) : null,
    peakHour,
    uniqueGuests: guests.size,
    returningGuests: returning,
    returningRate: guests.size > 0 ? round1((returning / guests.size) * 100) / 100 : null,
  };
}
