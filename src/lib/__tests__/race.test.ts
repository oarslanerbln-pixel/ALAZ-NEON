import { describe, expect, it } from "vitest";

import {
  RACE_FINISH,
  RACE_MAX_ROUNDS,
  RACE_RING,
  applyMove,
  assignRaceTeams,
  capturesAt,
  gateCell,
  initialPawns,
  leadingTeams,
  legalPawns,
  moveTarget,
  parsePawnVote,
  raceStandings,
  resolveRound,
  ringCell,
  rollDice,
  rollDie,
  tallyPawnVote,
  teamScore,
  turnOrder,
  withLateJoiners,
  type RacePawns,
  type RaceTeamId,
} from "../race";

/** Sırayla verilen zar değerlerini üreten sahte rastgelelik. */
function dice(...values: number[]) {
  let i = 0;
  return () => (values[i++ % values.length] - 1) / 6 + 0.01;
}

const ALL: RaceTeamId[] = ["fire", "earth", "air", "water"];
const DUO: RaceTeamId[] = ["fire", "earth"];

describe("tahta geometrisi", () => {
  it("kapılar halkada eşit aralıklı", () => {
    expect(ALL.map(gateCell)).toEqual([0, 6, 12, 18]);
  });

  it("ilerleme 1 kendi kapısı; tam tur kapıdan önceki karede biter", () => {
    expect(ringCell("earth", 1)).toBe(6);
    expect(ringCell("earth", RACE_RING)).toBe(5);
    expect(ringCell("water", 7)).toBe(0);
  });

  it("üs, iniş yolu ve çekirdek halkada değil", () => {
    expect(ringCell("fire", 0)).toBeNull();
    expect(ringCell("fire", RACE_RING + 1)).toBeNull();
    expect(ringCell("fire", RACE_FINISH)).toBeNull();
  });
});

describe("takım dağıtımı", () => {
  it("dengeli ve girdinin sırasından bağımsız", () => {
    const ids = Array.from({ length: 10 }, (_, i) => `p${i}`);
    const a = assignRaceTeams(ids);
    const b = assignRaceTeams([...ids].reverse());
    expect(a).toEqual(b);
    const sizes = a.teams.map((t) => Object.values(a.members).filter((m) => m === t).length);
    expect(a.teams).toEqual(ALL);
    expect(Math.max(...sizes) - Math.min(...sizes)).toBeLessThanOrEqual(1);
  });

  it("az oyuncuda takım sayısı oyuncu sayısı kadar", () => {
    expect(assignRaceTeams(["a", "b"]).teams).toEqual(DUO);
    expect(assignRaceTeams(["a", "b", "c"]).teams).toHaveLength(3);
    expect(assignRaceTeams([]).teams).toEqual([]);
  });

  it("sonradan katılan en küçük takıma girer; yeni kimse yoksa aynı nesne", () => {
    const base = assignRaceTeams(["a", "b", "c", "d", "e"]); // fire 2 kişi
    expect(withLateJoiners(base, ["a", "b"])).toBe(base.members);
    const next = withLateJoiners(base, ["a", "z"]);
    expect(next.z).toBe("earth");
    expect(base.members.z).toBeUndefined();
  });
});

describe("geçerli hamleler", () => {
  it("üsteki piyon her zarla çıkar", () => {
    const pawns = initialPawns(ALL);
    expect(moveTarget(pawns, "fire", 0, 1)).toBe(1);
    expect(moveTarget(pawns, "fire", 0, 4)).toBe(4);
    expect(legalPawns(pawns, "fire", 3)).toEqual([0, 1]);
  });

  it("kendi piyonunun üstüne gelinemez", () => {
    const pawns: RacePawns = { fire: [2, 5] };
    expect(moveTarget(pawns, "fire", 0, 3)).toBeNull();
    expect(legalPawns(pawns, "fire", 3)).toEqual([1]);
  });

  it("çekirdeğe tam sayı şartı yok; çekirdekteki piyon oynamaz", () => {
    const pawns: RacePawns = { fire: [RACE_FINISH, RACE_FINISH - 1] };
    expect(moveTarget(pawns, "fire", 1, 6)).toBe(RACE_FINISH);
    expect(moveTarget(pawns, "fire", 0, 2)).toBeNull();
  });
});

describe("eve gönderme", () => {
  it("halkada rakibin üstüne gelen onu üsse yollar", () => {
    // fire ilerleme 7 = kare 6 = earth kapısı (earth ilerleme 1).
    const pawns: RacePawns = { fire: [4, 0], earth: [1, 9] };
    const { pawns: next, move } = applyMove(pawns, "fire", 0, 3);
    expect(move.captured).toEqual([{ team: "earth", pawn: 0 }]);
    expect(next.earth).toEqual([0, 9]);
    expect(next.fire).toEqual([7, 0]);
    expect(pawns.earth).toEqual([1, 9]);
  });

  it("iniş yolu güvenli", () => {
    const pawns: RacePawns = { fire: [RACE_RING, 0], earth: [RACE_RING + 1, 0] };
    expect(capturesAt(pawns, "fire", RACE_RING + 1)).toEqual([]);
  });

  it("geçersiz hamle tahtayı değiştirmez", () => {
    const pawns: RacePawns = { fire: [2, 5] };
    const { pawns: next, move } = applyMove(pawns, "fire", 0, 3);
    expect(next).toBe(pawns);
    expect(move.pawn).toBeNull();
  });
});

describe("oy sayımı", () => {
  it("en çok oyu alan oynar; tek oy da geçer", () => {
    expect(tallyPawnVote([1, 1, 0], [0, 1], [10, 3])).toBe(1);
    expect(tallyPawnVote([1], [0, 1], [10, 3])).toBe(1);
  });

  it("eşitlikte ve oysuz turda daha ilerideki", () => {
    expect(tallyPawnVote([0, 1], [0, 1], [3, 10])).toBe(1);
    expect(tallyPawnVote([], [0, 1], [3, 3])).toBe(0);
  });

  it("geçersiz piyona verilen oy sayılmaz", () => {
    expect(tallyPawnVote([0, 0, 0], [1], [3, 10])).toBe(1);
    expect(tallyPawnVote([0], [], [3, 10])).toBeNull();
  });

  it("telefon verisi doğrulanır", () => {
    expect(parsePawnVote({ type: "race_vote", pawn: "1" })).toBe(1);
    expect(parsePawnVote({ type: "race_vote", pawn: "7" })).toBeNull();
    expect(parsePawnVote({ type: "race_vote", pawn: "-1" })).toBeNull();
    expect(parsePawnVote({ type: "zodiac", pawn: "1" })).toBeNull();
    expect(parsePawnVote(undefined)).toBeNull();
  });
});

describe("tur", () => {
  it("başlayan takım her tur değişir", () => {
    expect(turnOrder(ALL, 1)).toEqual(ALL);
    expect(turnOrder(ALL, 2)).toEqual(["earth", "air", "water", "fire"]);
    expect(turnOrder(ALL, 5)).toEqual(ALL);
    expect(turnOrder([], 3)).toEqual([]);
  });

  it("zar 1–6 arasında", () => {
    expect(rollDie(() => 0)).toBe(1);
    expect(rollDie(() => 0.999999)).toBe(6);
    expect(rollDie(() => 1)).toBe(6);
    expect(Object.keys(rollDice(ALL))).toEqual(ALL);
  });

  it("altı ek hamle verir; aynı piyon oynar, tur başına bir kez", () => {
    const state = { teams: DUO, pawns: initialPawns(DUO), round: 1, dice: { fire: 6, earth: 2 } };
    const r = resolveRound(state, { fire: [1] }, dice(6, 6));
    expect(r.moves.map((m) => [m.team, m.roll, m.bonus, m.pawn])).toEqual([
      ["fire", 6, false, 1],
      ["fire", 6, true, 1],
      ["earth", 2, false, 0],
    ]);
    expect(r.pawns.fire).toEqual([0, 12]);
    expect(r.finished).toBe(false);
  });

  it("sıradaki takım öncekinin hamlesinden sonraki tahtada oynar", () => {
    // fire 3 atıp earth kapısındaki piyonu yollar; earth o piyonla üsten yeniden çıkar.
    const pawns: RacePawns = { fire: [4, 0], earth: [1, 0] };
    const r = resolveRound({ teams: DUO, pawns, round: 1, dice: { fire: 3, earth: 2 } }, { fire: [0], earth: [0] });
    expect(r.moves[0].captured).toHaveLength(1);
    expect(r.pawns.earth).toEqual([2, 0]);
  });

  it("iki piyonu çekirdeğe giren takım o an kazanır, kalanlar oynamaz", () => {
    const state = {
      teams: ALL,
      pawns: { ...initialPawns(ALL), fire: [RACE_FINISH, RACE_FINISH - 2] },
      round: 1,
      dice: { fire: 3, earth: 4, air: 4, water: 4 },
    };
    const r = resolveRound(state, {});
    expect(r).toMatchObject({ finished: true, winners: ["fire"] });
    expect(r.moves).toHaveLength(1);
  });

  it("tur sınırında en ilerideki kazanır; eşitlikte ortak galibiyet", () => {
    const base = { teams: DUO, round: RACE_MAX_ROUNDS, dice: { fire: 1, earth: 1 } };
    const lead = resolveRound({ ...base, pawns: { fire: [10, 0], earth: [2, 0] } }, {});
    expect(lead).toMatchObject({ finished: true, winners: ["fire"] });
    const tie = resolveRound({ ...base, pawns: { fire: [10, 0], earth: [10, 0] } }, {});
    expect(tie.winners).toEqual(["fire", "earth"]);
    const before = resolveRound({ ...base, round: RACE_MAX_ROUNDS - 1, pawns: { fire: [10, 0], earth: [2, 0] } }, {});
    expect(before.finished).toBe(false);
  });
});

describe("sıralama ve skor", () => {
  it("önce evdeki piyon, sonra toplam adım", () => {
    const pawns: RacePawns = { fire: [20, 20], earth: [RACE_FINISH, 0], air: [20, 20], water: [0, 0] };
    const s = raceStandings(pawns, ALL);
    expect(s.map((r) => [r.team, r.rank])).toEqual([
      ["earth", 1],
      ["fire", 2],
      ["air", 2],
      ["water", 4],
    ]);
  });

  it("hiç ilerleme yoksa kazanan yok", () => {
    expect(leadingTeams(initialPawns(ALL), ALL)).toEqual([]);
  });

  it("takım skoru: ev 100, yoldaki piyon adımı kadar", () => {
    expect(teamScore({ fire: [RACE_FINISH, 12] }, "fire")).toBe(112);
    expect(teamScore({}, "fire")).toBe(0);
  });
});

describe("tam oyun", () => {
  it("her oyun tur sınırı içinde biter ve halkada iki piyon aynı karede kalmaz", () => {
    for (let seed = 1; seed <= 200; seed++) {
      let s = seed;
      const random = () => {
        s = (s * 1664525 + 1013904223) % 4294967296;
        return s / 4294967296;
      };
      let pawns = initialPawns(ALL);
      let finished = false;
      let winners: RaceTeamId[] = [];
      for (let round = 1; round <= RACE_MAX_ROUNDS && !finished; round++) {
        const r = resolveRound({ teams: ALL, pawns, round, dice: rollDice(ALL, random) }, {}, random);
        pawns = r.pawns;
        finished = r.finished;
        winners = r.winners;
        const cells = ALL.flatMap((t) => (pawns[t] ?? []).map((p) => ringCell(t, p)).filter((c) => c !== null));
        expect(new Set(cells).size).toBe(cells.length);
      }
      expect(finished).toBe(true);
      expect(winners.length).toBeGreaterThan(0);
    }
  });
});
