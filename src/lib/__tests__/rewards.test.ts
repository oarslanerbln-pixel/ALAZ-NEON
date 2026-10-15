import { describe, it, expect } from "vitest";
import { buildRewardDocs, resolveWinners } from "../rewardWinners";
import { DEFAULT_VENUE_CONFIG, type Player, type VenueConfig } from "../../types/database";

function makePlayer(overrides: Partial<Player> = {}): Player {
  return {
    id: "p1",
    room_id: "room-1",
    nickname: "OYUNCU",
    uid: "uid-1",
    team_name: null,
    total_score: 0,
    created_at: Date.now(),
    ...overrides,
  };
}

describe("resolveWinners — bireysel mod", () => {
  it("en yüksek puanlı tek oyuncuyu döner", () => {
    const players = [
      makePlayer({ id: "p1", uid: "u1", nickname: "A", total_score: 50 }),
      makePlayer({ id: "p2", uid: "u2", nickname: "B", total_score: 90 }),
      makePlayer({ id: "p3", uid: "u3", nickname: "C", total_score: 30 }),
    ];
    expect(resolveWinners("individual", players)).toEqual([
      { uid: "u2", nickname: "B" },
    ]);
  });

  it("beraberlikte TÜM en yüksek puanlıları döner, birini keyfi elemez", () => {
    const players = [
      makePlayer({ id: "p1", uid: "u1", nickname: "A", total_score: 90 }),
      makePlayer({ id: "p2", uid: "u2", nickname: "B", total_score: 90 }),
      makePlayer({ id: "p3", uid: "u3", nickname: "C", total_score: 40 }),
    ];
    const winners = resolveWinners("individual", players);
    expect(winners).toHaveLength(2);
    expect(winners.map((w) => w.uid).sort()).toEqual(["u1", "u2"]);
  });

  it("herkesin puanı 0 ise kimseye ödül verilmez", () => {
    const players = [
      makePlayer({ id: "p1", uid: "u1", total_score: 0 }),
      makePlayer({ id: "p2", uid: "u2", total_score: 0 }),
    ];
    expect(resolveWinners("individual", players)).toEqual([]);
  });

  it("uid'i 'anonymous' düşen kırık oturum kazanan sayılmaz", () => {
    const players = [
      makePlayer({ id: "p1", uid: "anonymous", total_score: 100 }),
      makePlayer({ id: "p2", uid: "u2", total_score: 20 }),
    ];
    expect(resolveWinners("individual", players)).toEqual([
      { uid: "u2", nickname: "OYUNCU" },
    ]);
  });

  it("oyuncu listesi boşsa kazanan yok", () => {
    expect(resolveWinners("individual", [])).toEqual([]);
  });
});

describe("resolveWinners — takım modu", () => {
  it("kazanan takımın TÜM üyelerini döner, takım toplamına göre", () => {
    const players = [
      makePlayer({ id: "p1", uid: "u1", nickname: "A", team_name: "Kırmızı", total_score: 40 }),
      makePlayer({ id: "p2", uid: "u2", nickname: "B", team_name: "Kırmızı", total_score: 30 }),
      makePlayer({ id: "p3", uid: "u3", nickname: "C", team_name: "Mavi", total_score: 60 }),
    ];
    // Kırmızı: 70, Mavi: 60 → Kırmızı kazanır, her iki üyesi de kazanan.
    const winners = resolveWinners("team", players);
    expect(winners).toHaveLength(2);
    expect(winners.map((w) => w.uid).sort()).toEqual(["u1", "u2"]);
  });

  it("takım puanları eşitse iki takımın da tüm üyeleri kazanır", () => {
    const players = [
      makePlayer({ id: "p1", uid: "u1", team_name: "Kırmızı", total_score: 50 }),
      makePlayer({ id: "p2", uid: "u2", team_name: "Mavi", total_score: 50 }),
    ];
    const winners = resolveWinners("team", players);
    expect(winners.map((w) => w.uid).sort()).toEqual(["u1", "u2"]);
  });

  it("takımsız oyuncu (team_name null) kendi tek kişilik takımı sayılır", () => {
    const players = [
      makePlayer({ id: "p1", uid: "u1", nickname: "Yalnız", team_name: null, total_score: 100 }),
      makePlayer({ id: "p2", uid: "u2", nickname: "A", team_name: "Kırmızı", total_score: 30 }),
      makePlayer({ id: "p3", uid: "u3", nickname: "B", team_name: "Kırmızı", total_score: 30 }),
    ];
    // Yalnız oyuncu tek başına 100 puanla en yüksek takım toplamına sahip.
    expect(resolveWinners("team", players)).toEqual([
      { uid: "u1", nickname: "Yalnız" },
    ]);
  });
});

describe("buildRewardDocs — yazılacak ödül dokümanları", () => {
  const NOW = 1_700_000_000_000;
  const venue = (overrides: Partial<VenueConfig> = {}): VenueConfig => ({
    ...DEFAULT_VENUE_CONFIG,
    rewards_enabled: true,
    reward_title: "  Ücretsiz Espresso  ",
    reward_description: " Barda göster ",
    reward_type: "drink",
    reward_validity_days: 30,
    ...overrides,
  });
  const winner = { uid: "u1", nickname: "ALAZ" };
  const fixedCode = () => "K7M2Q9";

  it("ödül sistemi kapalıysa ya da şablon boşsa hiçbir şey üretmez", () => {
    expect(buildRewardDocs([winner], venue({ rewards_enabled: false }), NOW, fixedCode)).toEqual([]);
    expect(buildRewardDocs([winner], venue({ reward_title: "   " }), NOW, fixedCode)).toEqual([]);
  });

  it("oturumsuz kazanana ödül yazılmaz", () => {
    const docs = buildRewardDocs(
      [winner, { uid: "anonymous", nickname: "X" }, { uid: "", nickname: "Y" }],
      venue(),
      NOW,
      fixedCode,
    );
    expect(docs.map((d) => d.uid)).toEqual(["u1"]);
  });

  it("şablondan kırpılmış başlık, kod ve geçerlilik süresiyle ödül üretir", () => {
    expect(buildRewardDocs([winner], venue(), NOW, fixedCode)).toEqual([
      {
        uid: "u1",
        nickname: "ALAZ",
        type: "drink",
        title: "Ücretsiz Espresso",
        description: "Barda göster",
        status: "available",
        code: "K7M2Q9",
        earned_at: NOW,
        expires_at: NOW + 30 * 24 * 60 * 60 * 1000,
      },
    ]);
  });

  it("geçerlilik süresi yoksa expires_at alanı hiç yazılmaz (undefined Firestore'da hata)", () => {
    const [reward] = buildRewardDocs([winner], venue({ reward_validity_days: 0 }), NOW, fixedCode);
    expect("expires_at" in reward).toBe(false);
  });

  it("yalnızca kuralın kabul ettiği alanları yazar (firestore.rules → isValidNewReward)", () => {
    const allowed = ["uid", "nickname", "type", "title", "description", "status", "code", "earned_at", "expires_at"];
    for (const reward of buildRewardDocs([winner], venue(), NOW)) {
      expect(Object.keys(reward).every((key) => allowed.includes(key))).toBe(true);
      expect(reward.code).toMatch(/^[A-Z2-9]{6}$/);
    }
  });
});
