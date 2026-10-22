import { expect, type Page } from "@playwright/test";
import { adminGet } from "./emulator";
import type { Phone, Tv } from "./cafe";
import { trace } from "./metrics";

/**
 * Host eğitimi (tutorial): oda "tutorial" durumundan çıkana kadar görünen
 * "WEITER" / "SPIEL STARTEN" düğmesine basar. Etiket animasyonla değiştiği
 * için düğme metnine değil oda durumuna bakıyoruz.
 */
export async function skipHostTutorial(tv: Tv): Promise<void> {
  const next = tv.page.getByRole("button", { name: /^(WEITER|SPIEL STARTEN)$/ });
  for (let i = 0; i < 12; i++) {
    const status = (await adminGet(`rooms/${tv.roomId}`))?.status;
    if (status !== "tutorial") return;
    trace(`host eğitimi adım ${i + 1}`);
    await next.click({ timeout: 5_000 }).catch(() => undefined);
    await tv.page.waitForTimeout(500);
  }
  throw new Error("Host eğitimi bitmedi");
}

export type Option = "A" | "B" | "C" | "D";
const OPTIONS: Option[] = ["A", "B", "C", "D"];

export async function quizAnswerKey(roomId: string): Promise<Option[]> {
  const secret = await adminGet(`rooms/${roomId}/secret/quiz`);
  const key = (secret?.answers ?? secret?.key ?? secret?.options) as Option[] | undefined;
  if (!Array.isArray(key)) throw new Error(`Cevap anahtarı okunamadı: ${JSON.stringify(secret)}`);
  return key;
}

export function wrongOption(correct: Option, salt: number): Option {
  const others = OPTIONS.filter((o) => o !== correct);
  return others[salt % others.length];
}

/** Telefonda şık düğmesi etkin olana kadar bekleyip basar; basma anını döner. */
export async function tapOption(phone: Phone, opt: Option): Promise<number> {
  const btn = phone.page.getByTestId(`quiz-option-${opt}`);
  await expect(btn).toBeEnabled({ timeout: 30_000 });
  const at = await phone.page.evaluate(() => Date.now());
  await btn.click();
  return at;
}

type ProbeWindow = { __probe?: number | null; __probeLast?: string | null };

/**
 * TV'de "⚡ n / N SPIELER BEREIT" sayacının n'ye ulaştığı anı (TV saatiyle)
 * yakalar. Sayfa içinde MutationObserver: Playwright'ın yoklama aralığı
 * ölçüme girmesin. `textContent` okunuyor: `innerText` her mutasyonda
 * yerleşim hesaplatır, yük altındaki TV'yi ölçüm sırasında yavaşlatmasın.
 */
export async function armAnsweredProbe(tv: Page, n: number, total: number): Promise<void> {
  await tv.evaluate(
    ({ n, total }) => {
      const w = window as unknown as ProbeWindow;
      w.__probe = null;
      w.__probeLast = null;
      const check = () => {
        const text = document.body.textContent ?? "";
        const m = /⚡ (\d+) \/ (\d+) SPIELER BEREIT/.exec(text);
        if (m) w.__probeLast = m[0];
        // Herkes cevaplayınca TV soruyu hemen kapatıyor: "N / N" hiç
        // çizilmeyebilir, o yüzden doğru şıkkın açıklanması da sayılır.
        const reached =
          (m != null && Number(m[1]) === n && Number(m[2]) === total) ||
          (n === total && text.includes("RICHTIGE ANTWORT"));
        if (w.__probe == null && reached) {
          w.__probe = Date.now();
          obs.disconnect();
        }
      };
      const obs = new MutationObserver(check);
      obs.observe(document.body, { subtree: true, childList: true, characterData: true });
      check();
    },
    { n, total },
  );
}

/**
 * Sayaç beklenen değere ulaşmazsa TV'nin en son gösterdiği sayaçla düşer:
 * "1 / 11" hayalet oyuncu kaydı, "0 / 10" TV'ye ulaşmayan cevap demektir.
 */
export async function readProbe(tv: Page, timeout = 15_000): Promise<number> {
  try {
    const handle = await tv.waitForFunction(() => (window as unknown as ProbeWindow).__probe ?? null, undefined, { timeout });
    return (await handle.jsonValue()) as number;
  } catch (err) {
    const last = await tv.evaluate(() => (window as unknown as ProbeWindow).__probeLast ?? null).catch(() => null);
    throw new Error(`TV cevap sayacı ${timeout} ms içinde beklenen değere ulaşmadı (son görülen: ${last ?? "sayaç yok"})`, {
      cause: err,
    });
  }
}

export interface QuizResult {
  /** Tek telefonun basması → TV sayacı (ms), soru başına. */
  answerLatencyMs: number[];
  /** Herkesin aynı anda bastığı → TV'de hepsi göründü (ms), soru başına. */
  burstLatencyMs: number[];
}

/**
 * Bir quiz'i baştan sona oynatır. `pick(phoneIndex, questionIndex, correct)`
 * her telefonun şıkkını seçer. TV'de oyun başlatılmış olmalı (tutorial ya da
 * quiz_intro).
 */
export async function playQuiz(
  tv: Tv,
  phones: Phone[],
  questions: number,
  pick: (p: number, q: number, correct: Option) => Option,
): Promise<QuizResult> {
  const result: QuizResult = { answerLatencyMs: [], burstLatencyMs: [] };
  // Oyun başlatma yazımı asenkron (soru paketi lazy yükleniyor): durum
  // gece lobisinden çıkana kadar bekle, eğitim ekranıysa geç.
  let status = "";
  await expect
    .poll(async () => (status = String((await adminGet(`rooms/${tv.roomId}`))?.status)), { timeout: 30_000 })
    .toMatch(/^(tutorial|quiz_intro|question_intro)$/);
  if (status === "tutorial") await skipHostTutorial(tv);

  for (let q = 0; q < questions; q++) {
    trace(`quiz soru ${q + 1}: TIMER STARTEN bekleniyor`);
    await tv.page.getByRole("button", { name: "TIMER STARTEN" }).click({ timeout: 60_000 });
    const key = await quizAnswerKey(tv.roomId);
    const correct = key[q];

    trace(`quiz soru ${q + 1}: doğru şık ${correct}`);
    // Önce tek telefon: uçtan uca cevap gecikmesi.
    await armAnsweredProbe(tv.page, 1, phones.length);
    const t0 = await tapOption(phones[0], pick(0, q, correct));
    result.answerLatencyMs.push((await readProbe(tv.page)) - t0);

    // Sonra geri kalan herkes aynı anda.
    if (phones.length > 1) {
      await Promise.all(phones.slice(1).map((ph) => expect(ph.page.getByTestId("quiz-option-A")).toBeEnabled({ timeout: 30_000 })));
      await armAnsweredProbe(tv.page, phones.length, phones.length);
      const starts = await Promise.all(phones.slice(1).map((ph, i) => tapOption(ph, pick(i + 1, q, correct))));
      result.burstLatencyMs.push((await readProbe(tv.page, 30_000)) - Math.min(...starts));
    }

    trace(`quiz soru ${q + 1}: herkes cevapladı, açıklama bekleniyor`);
    // Herkes cevapladı → TV soruyu kendiliğinden kapatır ve doğru şıkkı açıklar.
    // Sunucu, doğru şık odaya yazılana (puanlama bitene) kadar bekler: düğme
    // ondan önce görünüyor ve erken basmak ekranı geri attırıyor (bulgu O1).
    await waitForReveal(tv, q);
    await tv.page.getByRole("button", { name: "RANGLISTE ANZEIGEN" }).click({ timeout: 30_000 });
    const last = q === questions - 1;
    await tv.page.getByRole("button", { name: last ? "SPIEL BEENDEN 🏆" : "NÄCHSTE FRAGE →" }).click({ timeout: 30_000 });
  }
  return result;
}

/** Host doğru şıkkı odaya yazdı mı (puanlama tamamlandı). */
export async function waitForReveal(tv: Tv, q: number): Promise<void> {
  await expect
    .poll(async () => {
      const r = await adminGet(`rooms/${tv.roomId}`);
      return (r?.quiz_reveal as { index?: number } | null)?.index;
    }, { timeout: 30_000 })
    .toBe(q);
}

/** TV'de "ZUR LOBBY" (onay penceresi kabul edilir) → gece lobisi. */
export async function returnToNightLobby(tv: Tv): Promise<void> {
  tv.page.once("dialog", (d) => d.accept());
  await tv.page.getByRole("button", { name: "ZUR LOBBY" }).first().click();
  await expect.poll(async () => (await adminGet(`rooms/${tv.roomId}`))?.status, { timeout: 15_000 }).toBe("night_lobby");
}
