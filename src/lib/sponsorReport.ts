/**
 * Sponsor gösterim raporu (docs/roadmap.md, 3.3). TV her reklamı gösterdikten
 * (ya da gösterim yarıda kesildikten) sonra bir gösterim kaydı yazar
 * (`ad_impressions`); sponsora sunulan rapor ve fatura dökümü bunlardan.
 */
export interface AdImpressionRecord {
  ad_id: string;
  sponsor_name: string;
  ad_type: "image" | "video";
  room_id: string;
  started_at: number;
  /** Ekranda kalınan süre (ms). */
  shown_ms: number;
  /** Planlanan süre (ms); video için bilinmiyorsa 0. */
  planned_ms: number;
  /** Sonuna kadar gösterildi mi (atlanmadı / kesilmedi). */
  completed: boolean;
  /** Gösterim anında odaya bağlı misafir sayısı. */
  audience: number;
}

export interface SponsorSummary {
  sponsor: string;
  impressions: number;
  completed: number;
  /** completed / impressions (0–1). */
  completionRate: number;
  secondsOnScreen: number;
  /** Gösterimlerin izleyici toplamı (bir misafir birden çok kez sayılabilir). */
  audienceReach: number;
  avgAudience: number;
  firstShown: number;
  lastShown: number;
}

const round1 = (n: number) => Math.round(n * 10) / 10;

/** Sponsor başına özet; en çok ekranda kalan önce. */
export function summarizeSponsors(impressions: readonly AdImpressionRecord[]): SponsorSummary[] {
  const bySponsor = new Map<string, AdImpressionRecord[]>();
  for (const imp of impressions) {
    const key = imp.sponsor_name.trim() || "—";
    bySponsor.set(key, [...(bySponsor.get(key) ?? []), imp]);
  }
  return [...bySponsor.entries()]
    .map(([sponsor, list]) => {
      const completed = list.filter((i) => i.completed).length;
      const audienceReach = list.reduce((sum, i) => sum + i.audience, 0);
      return {
        sponsor,
        impressions: list.length,
        completed,
        completionRate: round1((completed / list.length) * 100) / 100,
        secondsOnScreen: Math.round(list.reduce((sum, i) => sum + i.shown_ms, 0) / 1000),
        audienceReach,
        avgAudience: round1(audienceReach / list.length),
        firstShown: Math.min(...list.map((i) => i.started_at)),
        lastShown: Math.max(...list.map((i) => i.started_at)),
      };
    })
    .sort((a, b) => b.secondsOnScreen - a.secondsOnScreen || a.sponsor.localeCompare(b.sponsor));
}

const csvCell = (value: string | number | boolean) => {
  const text = String(value);
  return /[",\n;]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

/** Gösterim dökümü (sponsora/faturaya ek): her satır tek gösterim, zaman ISO. */
export function impressionsCsv(impressions: readonly AdImpressionRecord[]): string {
  const header = ["started_at", "sponsor", "ad_id", "type", "shown_seconds", "completed", "audience", "room_id"];
  const rows = [...impressions]
    .sort((a, b) => a.started_at - b.started_at)
    .map((i) =>
      [
        new Date(i.started_at).toISOString(),
        i.sponsor_name,
        i.ad_id,
        i.ad_type,
        round1(i.shown_ms / 1000),
        i.completed,
        i.audience,
        i.room_id,
      ]
        .map(csvCell)
        .join(","),
    );
  return [header.join(","), ...rows].join("\n") + "\n";
}
