import { test, expect, type Browser, type Page } from "@playwright/test";
import {
  closeAll,
  expectTvPlayerCount,
  joinFromQr,
  newPhone,
  openNight,
  realErrors,
  scanTvQr,
  startGameFromDashboard,
  type Phone,
  type Tv,
} from "./support/cafe";
import { adminGet, adminQuery, adminUpdate, clearAuth, clearFirestore } from "./support/emulator";
import { recordMetric } from "./support/metrics";

/**
 * HENGAME NOVA (zarlı takım yarışı): 4 telefon = 4 tek kişilik takım.
 * Zar host'ta olduğu için belirli bir tahta durumu emülatörden kurulur
 * (kuralları atlayan yönetici yazımı); oy, hamle, eve gönderme ve kazanma
 * gerçek TV ve telefon ekranlarından geçer.
 */
test.beforeEach(async () => {
  await clearFirestore();
  await clearAuth();
});

type Race = {
  game_id: number;
  teams: string[];
  members: Record<string, string>;
  pawns: Record<string, number[]>;
  round: number;
  dice: Record<string, number>;
  vote_ends_at: number;
  moves: Array<{ team: string; pawn: number | null; roll: number; bonus: boolean; captured: unknown[] }>;
  winners: string[];
  finished: boolean;
};

/** `E2E_SHOTS=1`: belge için ekran görüntüsü (docs/gorsel/nova). */
const shot = async (page: Page, name: string) => {
  if (process.env.E2E_SHOTS) await page.screenshot({ path: `docs/gorsel/nova/${name}.png` });
};

const roomOf = (id: string) => adminGet(`rooms/${id}`);
const raceOf = async (id: string) => ((await roomOf(id))?.race ?? null) as Race | null;

async function night(browser: Browser, n: number) {
  const tv = await openNight(browser);
  const joinUrl = await scanTvQr(tv);
  const phones: Phone[] = [];
  for (let i = 0; i < n; i++) phones.push(await newPhone(browser, i, `SPIELER${i + 1}`));
  await Promise.all(phones.map((p) => joinFromQr(p, joinUrl)));
  await expectTvPlayerCount(tv.page, n);
  return { tv, phones };
}

/** Oylamanın açıldığı tur gelene kadar bekler. */
async function waitForVote(tv: Tv, round: number): Promise<Race> {
  await expect
    .poll(async () => {
      const room = await roomOf(tv.roomId);
      return room?.status === "race_vote" ? (room.race as Race).round : null;
    }, { timeout: 60_000, message: `${round}. turun oylaması` })
    .toBe(round);
  return (await raceOf(tv.roomId))!;
}

/** Tahtayı ve zarları belirli bir duruma getirir (oylama süresini yeniden başlatır). */
async function rig(tv: Tv, race: Race, pawns: Record<string, number[]>, dice: Record<string, number>): Promise<void> {
  await adminUpdate(`rooms/${tv.roomId}`, { race: { ...race, pawns, before: pawns, dice, vote_ends_at: Date.now() + 8_000 } });
}

test("HENGAME NOVA: oy, hamle, eve gönderme ve kazanan takım; gece ligi puanı dağıtılır", async ({ browser }) => {
  test.setTimeout(5 * 60_000);
  const { tv, phones } = await night(browser, 4);
  try {
    await startGameFromDashboard(tv.page, "NOVA");
    const first = await waitForVote(tv, 1);
    expect(first.teams).toEqual(["fire", "earth", "air", "water"]);
    expect(Object.keys(first.members).sort()).toEqual(phones.map((p) => p.playerId).sort());
    const phoneOf = (team: string) => phones.find((p) => first.members[p.playerId ?? ""] === team)!;
    await expect(tv.page.getByTestId("race-board")).toBeVisible();
    await expect(tv.page.getByText("Wähl deine Figur!")).toBeVisible();

    // 1. tur: herkes 1. piyonu seçer; üsteki piyon altı beklemeden çıkar.
    // Zarlar sabit (altı yok): ek hamle ve yakalama sonucu değiştirmesin.
    const firstDice = { fire: 2, earth: 3, air: 4, water: 5 };
    await rig(tv, first, first.pawns, firstDice);
    const roundStart = Date.now();
    for (const p of phones) {
      await expect(p.page.getByTestId("race-vote")).toBeVisible({ timeout: 20_000 });
      await p.page.getByTestId("race-pawn-0").click();
      await expect(p.page.getByText("Stimme gezählt")).toBeVisible();
    }
    await expect
      .poll(async () => (await adminQuery("answers", "room_id", tv.roomId)).filter((a) => a.round_letter === `race-${first.game_id}-1`).length)
      .toBe(4);
    const second = await waitForVote(tv, 2);
    recordMetric("novaRoundMs_allVoted_4teams", Date.now() - roundStart);
    for (const team of second.teams) {
      expect(second.pawns[team], `${team}: 1. piyon zar kadar ilerledi, 2. piyon üste`).toEqual([firstDice[team as keyof typeof firstDice], 0]);
    }

    // 2. tur (sıra: earth, air, water, fire): fire 3 atıp earth'ün kapısındaki
    // piyonun üstüne gelir. Altı yok, sonuç zarsız belirli.
    await rig(tv, second, { fire: [4, 0], earth: [1, 0], air: [0, 0], water: [0, 0] }, { fire: 3, earth: 2, air: 1, water: 1 });
    const fire = phoneOf("fire");
    await expect(fire.page.getByText("Schickt einen Gegner heim!")).toBeVisible({ timeout: 10_000 });
    await shot(fire.page, "telefon-oy");
    await shot(tv.page, "tv-oylama");
    await fire.page.getByTestId("race-pawn-0").click();
    // earth 2. piyonunu çıkarır; 1. piyon kapıda kalır.
    await phoneOf("earth").page.getByTestId("race-pawn-1").click();
    await phoneOf("air").page.getByTestId("race-pawn-0").click();
    await phoneOf("water").page.getByTestId("race-pawn-0").click();
    await expect(tv.page.getByTestId("race-banner")).toHaveText("Feuer schickt Erde zurück zur Basis!", { timeout: 30_000 });
    await tv.page.waitForTimeout(700);
    await shot(tv.page, "tv-eve-gonderme");
    const third = await waitForVote(tv, 3);
    expect(third.pawns.fire, "fire earth'ün kapısında").toEqual([7, 0]);
    expect(third.pawns.earth, "earth'ün 1. piyonu üsse döndü").toEqual([0, 2]);

    // 3. tur (sıra: air, water, fire, earth): fire'ın son piyonu çekirdeğe girer.
    await rig(tv, third, { ...third.pawns, fire: [27, 25] }, { fire: 3, earth: 1, air: 1, water: 1 });
    // Bu turda kimse oy vermez: süre dolunca en ilerideki geçerli piyon oynar.
    await expect.poll(async () => (await roomOf(tv.roomId))?.status, { timeout: 60_000 }).toBe("race_finished");
    const final = (await raceOf(tv.roomId))!;
    expect(final.winners).toEqual(["fire"]);
    expect(final.moves.at(-1)?.team, "kazanan hamleden sonra kimse oynamaz").toBe("fire");

    await expect(tv.page.getByTestId("race-finished")).toContainText("Siegerteam");
    await expect(tv.page.getByTestId("race-finished")).toContainText("Feuer");
    await expect(fire.page.getByText("Dein Team hat gewonnen!")).toBeVisible({ timeout: 15_000 });
    await expect(phoneOf("earth").page.getByText("Spiel vorbei")).toBeVisible({ timeout: 15_000 });
    await tv.page.waitForTimeout(1_500);
    await shot(tv.page, "tv-kazanan");
    await shot(fire.page, "telefon-kazanan");

    // Gece ligi: kazanan takımın üyesine 10, diğerlerine katılım puanı.
    await expect.poll(async () => (await roomOf(tv.roomId))?.night_awarded, { timeout: 15_000 }).toBe(true);
    await expect.poll(async () => Number((await adminGet(`players/${fire.playerId}`))?.night_score), { timeout: 15_000 }).toBe(10);
    for (const team of ["earth", "air", "water"]) {
      expect(Number((await adminGet(`players/${phoneOf(team).playerId}`))?.night_score), team).toBe(1);
    }
    // Zar ve tahta host'ta: oyuncunun oyun skoru telefondan beyan edilmez.
    for (const p of [tv, ...phones]) expect(realErrors(p), p.page.url()).toEqual([]);
  } finally {
    await closeAll(tv, ...phones);
  }
});

test("HENGAME NOVA: iki oyuncuyla iki takım; oy verilmese de oyun ilerler ve erken bitirilebilir", async ({ browser }) => {
  test.setTimeout(4 * 60_000);
  const { tv, phones } = await night(browser, 2);
  try {
    await startGameFromDashboard(tv.page, "NOVA");
    const first = await waitForVote(tv, 1);
    expect(first.teams).toEqual(["fire", "earth"]);
    // Kimse oy vermez: süre dolunca otomatik hamle, sonra 2. tur.
    const second = await waitForVote(tv, 2);
    expect(second.pawns.fire.some((p) => p > 0) && second.pawns.earth.some((p) => p > 0), "iki takım da oynadı").toBe(true);

    // Personel oyunu erken bitirir: en ilerideki takım kazanır.
    tv.page.once("dialog", (d) => d.accept());
    await tv.page.getByRole("button", { name: "Personalmenü" }).click();
    await tv.page.getByRole("menuitem", { name: "VORZEITIG BEENDEN" }).click();
    await expect.poll(async () => (await roomOf(tv.roomId))?.status, { timeout: 20_000 }).toBe("race_finished");
    expect((await raceOf(tv.roomId))!.winners.length).toBeGreaterThan(0);

    // Tekrar oyna: yeni oyun, eski oylar ve tahta taşınmaz.
    await tv.page.getByRole("button", { name: "Nochmal spielen" }).click();
    const again = await waitForVote(tv, 1);
    expect(again.game_id).not.toBe(first.game_id);
    expect(again.pawns).toEqual({ fire: [0, 0], earth: [0, 0] });
    for (const p of [tv, ...phones]) expect(realErrors(p), p.page.url()).toEqual([]);
  } finally {
    await closeAll(tv, ...phones);
  }
});
