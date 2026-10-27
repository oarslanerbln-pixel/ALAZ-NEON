/**
 * YÖRÜNGE SAPANI — saf oyun mantığı.
 *
 * Akış: telefon şutu (`power`, `angle`, `curve`) `answers` koleksiyonuna yazar;
 * TV tek yazar olarak şutları geliş sırasıyla tek tek fırlatır, sonucu
 * (`judgeShot`) belirler ve golü `total_score`'a ekler. Eskiden şut oyuncu
 * belgesine yazılıyordu: kural bu alanı reddettiği için hiçbir şut TV'ye
 * ulaşmıyordu, ulaşsa da her şut odadaki her telefona bir okuma olarak
 * yansıyacaktı.
 */

export const SLINGSHOT_ROUND_SEC = 45;
export const SLINGSHOT_INTRO_MS = 4500;
export const SLINGSHOT_GOAL_POINTS = 100;
/**
 * Telefonun iki şut arasında beklediği süre. TV bir topu ~1 sn uçurup 2 sn
 * sonucu gösteriyor; 10 kişi peş peşe çekince kuyruk süreden uzun olmasın.
 */
export const SLINGSHOT_COOLDOWN_MS = 3000;
/** Süre bitince kuyrukta kalan şutların fırlatılması için tanınan ek süre. */
export const SLINGSHOT_DRAIN_MS = 6000;

/** Kale ve kaleci ölçüleri (3D sahne birimleri, kale merkezi x=0). */
export const GOAL_WIDTH = 16;
export const GOAL_HEIGHT = 7.5;
const KEEPER_REACH_X = 2.5;
const KEEPER_REACH_Y = 5.5;
const POST_MARGIN = 0.8;

export type ShotResult = "goal" | "saved" | "crossbar" | "out";

export interface SlingshotShot {
  power: number; // 0..100
  angle: number; // -45..+45 derece
  curve: number; // -1..+1
}

/**
 * Topun kale çizgisini geçtiği nokta (`bx`, `by`) ve o anki kaleci konumuna
 * (`keeperX`) göre şutun sonucu.
 */
export function judgeShot(bx: number, by: number, keeperX: number): ShotResult {
  if (Math.abs(bx - keeperX) < KEEPER_REACH_X && by >= 0 && by <= KEEPER_REACH_Y) return "saved";
  if (Math.abs(bx) < GOAL_WIDTH / 2 - 0.5 && by > 0 && by < GOAL_HEIGHT - 1) return "goal";
  const nearPost = Math.abs(Math.abs(bx) - GOAL_WIDTH / 2) < POST_MARGIN && by <= GOAL_HEIGHT;
  const nearBar = Math.abs(by - (GOAL_HEIGHT - 1)) < POST_MARGIN && Math.abs(bx) <= GOAL_WIDTH / 2;
  return nearPost || nearBar ? "crossbar" : "out";
}

/**
 * Bir turun cevaplarını ayıran anahtar (`answers.round_letter`). Turun bitiş
 * zamanı her başlatmada farklı olduğu için yeniden oynanan tur, önceki turun
 * şutlarını yeniden fırlatmaz.
 */
export function slingshotRoundKey(endTime: number | null | undefined): string | null {
  return typeof endTime === "number" && endTime > 0 ? `slingshot-${endTime}` : null;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * Cevap belgesindeki şut. İstemci kurcalanabilir kabul edilir: değerler
 * oyunun aralığına kırpılır, sayı olmayan şut atılır.
 */
export function parseShot(data: Record<string, unknown> | null | undefined): SlingshotShot | null {
  if (!data) return null;
  const power = Number(data.power);
  const angle = Number(data.angle);
  const curve = Number(data.curve);
  if (![power, angle, curve].every(Number.isFinite)) return null;
  return { power: clamp(power, 0, 100), angle: clamp(angle, -45, 45), curve: clamp(curve, -1, 1) };
}

/** TV'de gösterilen gol sayısı: oyunun tek puan kaynağı gol. */
export function goalsFromScore(totalScore: number | undefined): number {
  return Math.floor((totalScore || 0) / SLINGSHOT_GOAL_POINTS);
}
