import { describe, it, expect } from "vitest";
import { getLeagueFromScore, getNextLeagueProgress, LEAGUE_TIERS } from "../league";

describe("HEGAME League logic", () => {
  it("sıfır puan için Bronz Lig döner", () => {
    const league = getLeagueFromScore(0);
    expect(league.tier).toBe("BRONZE");
    expect(league.badge).toBe("🥉");
  });

  it("1500 puan için Gümüş Lig döner", () => {
    const league = getLeagueFromScore(1500);
    expect(league.tier).toBe("SILVER");
    expect(league.badge).toBe("🥈");
  });

  it("3500 puan için Altın Lig döner", () => {
    const league = getLeagueFromScore(3500);
    expect(league.tier).toBe("GOLD");
    expect(league.badge).toBe("🥇");
  });

  it("15000 puan için en üst kademe olan Hegame Titan döner", () => {
    const league = getLeagueFromScore(15000);
    expect(league.tier).toBe("LEGEND");
    expect(league.title).toBe("Hegame Titan");
    expect(league.badge).toBe("👑");
  });

  it("bir sonraki lig ilerlemesini doğru hesaplar", () => {
    // Bronz (0) -> Gümüş (1000) aralığında 500 puan %50 ilerleme demektir
    const progress = getNextLeagueProgress(500);
    expect(progress.current.tier).toBe("BRONZE");
    expect(progress.next?.tier).toBe("SILVER");
    expect(progress.progressPercent).toBe(50);
    expect(progress.pointsNeeded).toBe(500);
  });

  it("en üst lige ulaşıldığında next null ve %100 döner", () => {
    const maxScore = LEAGUE_TIERS[LEAGUE_TIERS.length - 1].minScore + 5000;
    const progress = getNextLeagueProgress(maxScore);
    expect(progress.next).toBeNull();
    expect(progress.progressPercent).toBe(100);
    expect(progress.pointsNeeded).toBe(0);
  });
});
