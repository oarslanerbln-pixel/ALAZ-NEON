import { describe, it, expect } from "vitest";
import { impressionsCsv, summarizeSponsors, type AdImpressionRecord } from "../sponsorReport";

const imp = (over: Partial<AdImpressionRecord> = {}): AdImpressionRecord => ({
  ad_id: "ad1",
  sponsor_name: "Efes",
  ad_type: "image",
  room_id: "r1",
  started_at: Date.UTC(2026, 9, 4, 21, 0),
  shown_ms: 10_000,
  planned_ms: 10_000,
  completed: true,
  audience: 12,
  ...over,
});

describe("summarizeSponsors", () => {
  it("sponsor başına gösterim, tamamlanma, ekran süresi ve izleyici", () => {
    const summary = summarizeSponsors([
      imp(),
      imp({ shown_ms: 4_000, completed: false, audience: 8, started_at: Date.UTC(2026, 9, 4, 22, 0) }),
      imp({ sponsor_name: "Red Bull", shown_ms: 30_000, audience: 20 }),
    ]);
    expect(summary.map((s) => s.sponsor)).toEqual(["Red Bull", "Efes"]);
    expect(summary[1]).toMatchObject({
      impressions: 2,
      completed: 1,
      completionRate: 0.5,
      secondsOnScreen: 14,
      audienceReach: 20,
      avgAudience: 10,
      firstShown: Date.UTC(2026, 9, 4, 21, 0),
      lastShown: Date.UTC(2026, 9, 4, 22, 0),
    });
  });

  it("gösterim yoksa boş", () => {
    expect(summarizeSponsors([])).toEqual([]);
  });
});

describe("impressionsCsv", () => {
  it("zaman sırasıyla, virgül ve tırnak kaçışlı", () => {
    const csv = impressionsCsv([imp({ started_at: Date.UTC(2026, 9, 4, 23, 0) }), imp({ sponsor_name: 'Bar "Neon", Kadıköy' })]);
    const lines = csv.trim().split("\n");
    expect(lines[0]).toBe("started_at,sponsor,ad_id,type,shown_seconds,completed,audience,room_id");
    expect(lines[1]).toBe('2026-10-04T21:00:00.000Z,"Bar ""Neon"", Kadıköy",ad1,image,10,true,12,r1');
    expect(lines[2].startsWith("2026-10-04T23:00:00.000Z,Efes,")).toBe(true);
  });
});
