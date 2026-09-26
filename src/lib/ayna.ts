/**
 * AYNA — "Dünyayı ve salonu tahmin et" oyununun saf mantığı.
 *
 * Her turda bir gerçek dünya sorusu soruluyor (ör. "dünyadaki bebeklerin
 * yüzde kaçı aşılı?"); misafir 0–100 arası bir tahmin kilitliyor. Puan
 * tahminin gerçeğe uzaklığıyla azalıyor. Asıl şov anı ise salon özeti:
 * "Bu salonun %78'i olduğundan DÜŞÜK tahmin etti" — insanlar dünyayı
 * sistematik biçimde olduğundan kötü sanıyor ve bunu hep birlikte görmek
 * hem şaşırtıcı hem de empati kuran bir an.
 *
 * Bu dosyada Firestore yok: host ekranı buradaki fonksiyonları çağırıp
 * sonucu tek bir transaction ile yazıyor (bkz. pages/host/ayna/aynaActions.ts).
 */

/** Tahmin skalası. Tüm sorular bu aralıkta cevaplanabilir olmalı. */
export const AYNA_MIN = 0;
export const AYNA_MAX = 100;

/** Tam isabet sayılan en büyük sapma (skala birimi). */
export const AYNA_EXACT_TOLERANCE = 1;
/** Bu kadar veya daha fazla sapan tahmin puan almaz. */
export const AYNA_ZERO_POINT_ERROR = 25;
export const AYNA_BASE_POINTS = 1000;
export const AYNA_EXACT_BONUS = 250;

/**
 * Oyuncudan gelen ham tahmini güvenli bir sayıya çevirir.
 *
 * İstemci kurcalanabilir kabul ediliyor: cevap dokümanındaki değer metin
 * olarak geliyor ve her şey olabilir. Sayı değilse `null` (tahmin yok),
 * aralık dışıysa sınırına kırpılıyor — skala dışı bir değer ekstra puan
 * getiremez.
 */
export function parseGuess(raw: unknown): number | null {
  const value = typeof raw === "number" ? raw : typeof raw === "string" && raw.trim() !== "" ? Number(raw) : NaN;
  if (!Number.isFinite(value)) return null;
  return Math.min(AYNA_MAX, Math.max(AYNA_MIN, value));
}

/**
 * Bir tahminin puanı: sapma 0 iken 1000, sapma 25 ve üstünde 0, arada
 * doğrusal. Tam isabete (±1) ayrıca bonus.
 */
export function scoreGuess(guess: number, truth: number): number {
  const error = Math.abs(guess - truth);
  const base = Math.round(AYNA_BASE_POINTS * Math.max(0, 1 - error / AYNA_ZERO_POINT_ERROR));
  return base + (error <= AYNA_EXACT_TOLERANCE ? AYNA_EXACT_BONUS : 0);
}

export interface GuessSummary {
  count: number;
  /** Salonun ortanca tahmini; tahmin yoksa `null`. */
  median: number | null;
  /** Gerçeğin tam isabet toleransı dışında üstünde / altında kalanların yüzdesi. */
  overPct: number;
  underPct: number;
  exactCount: number;
  /** Başlıkta hangi cümlenin gösterileceği. */
  verdict: "under" | "over" | "split" | "none";
}

/**
 * Salonun toplu tahmini — TV'deki "salon aynası" başlığı.
 *
 * Eğilim ancak açık bir çoğunluk varsa ilan ediliyor (%60+). Aksi halde
 * "salon ikiye bölündü" diyoruz; küçük farkı "salonun çoğu yanıldı" diye
 * sunmak yanıltıcı olurdu.
 */
export function summarizeGuesses(guesses: readonly number[], truth: number): GuessSummary {
  const count = guesses.length;
  if (count === 0) {
    return { count, median: null, overPct: 0, underPct: 0, exactCount: 0, verdict: "none" };
  }

  const sorted = [...guesses].sort((a, b) => a - b);
  const mid = Math.floor(count / 2);
  const median = count % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;

  let over = 0;
  let under = 0;
  let exactCount = 0;
  for (const g of guesses) {
    if (Math.abs(g - truth) <= AYNA_EXACT_TOLERANCE) exactCount++;
    else if (g > truth) over++;
    else under++;
  }

  const overPct = Math.round((over / count) * 100);
  const underPct = Math.round((under / count) * 100);
  const MAJORITY = 60;
  const verdict = underPct >= MAJORITY ? "under" : overPct >= MAJORITY ? "over" : "split";

  return { count, median, overPct, underPct, exactCount, verdict };
}

export interface GuessDot {
  playerId: string;
  value: number;
  /** Aynı kutudaki kaçıncı nokta (0 = en alttaki). */
  stack: number;
}

/**
 * TV'deki nokta bulutu için yerleşim: skala `binWidth` genişliğinde
 * kutulara bölünüyor, aynı kutuya düşen tahminler üst üste diziliyor.
 * Sıralama deterministik (değer, sonra oyuncu kimliği) — yeniden
 * render'da noktalar yer değiştirip zıplamasın.
 */
export function layoutGuessDots(guesses: Readonly<Record<string, number>>, binWidth = 2): GuessDot[] {
  const entries = Object.entries(guesses).sort(([idA, a], [idB, b]) => a - b || idA.localeCompare(idB));
  const heights = new Map<number, number>();
  return entries.map(([playerId, value]) => {
    const bin = Math.floor(value / binWidth);
    const stack = heights.get(bin) ?? 0;
    heights.set(bin, stack + 1);
    return { playerId, value, stack };
  });
}

/** Tur puanlarından büyükten küçüğe sıralı ilk `limit` oyuncu. */
export function topScorers(points: Readonly<Record<string, number>>, limit = 3): { playerId: string; points: number }[] {
  return Object.entries(points)
    .filter(([, p]) => p > 0)
    .sort(([idA, a], [idB, b]) => b - a || idA.localeCompare(idB))
    .slice(0, limit)
    .map(([playerId, p]) => ({ playerId, points: p }));
}

/**
 * Oyunun soru sırası. Yakın zamanda sorulanlar (`recentIds`) önce
 * eleniyor; havuz yetmezse onlar da geri alınıyor — oyun hiçbir zaman
 * istenenden az soruyla başlamasın. `random` testte sabitlenebilsin diye
 * parametre.
 */
export function pickQuestionIds(
  poolIds: readonly string[],
  count: number,
  recentIds: readonly string[] = [],
  random: () => number = Math.random,
): string[] {
  const recent = new Set(recentIds);
  const fresh = shuffle(poolIds.filter((id) => !recent.has(id)), random);
  const stale = shuffle(poolIds.filter((id) => recent.has(id)), random);
  return [...fresh, ...stale].slice(0, Math.max(0, count));
}

function shuffle<T>(items: T[], random: () => number): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Cevap dokümanlarında bu turu ayıran anahtar (`answers.round_letter`). */
export function aynaRoundKey(index: number): string {
  return `ayna_${index}`;
}
