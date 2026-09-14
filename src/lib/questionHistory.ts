/**
 * Geceler arasi soru tekrar hafizasi.
 *
 * Soru secimi her oturumda havuzu sifirdan karistiriyordu, yani haftalik
 * gelen bir mudavim ucuncu ziyaretinde ayni sorulari goruyordu. Almanca
 * havuz ozellikle kucuk oldugu icin bu hizli fark ediliyor.
 *
 * Hafiza HOST CIHAZININ localStorage'inda tutuluyor. Sebebi pratik: mekanin
 * TV'si her gece ayni cihaz, dolayisiyla "bu mekanda yakinda soruldu" bilgisi
 * dogal olarak mekana ait oluyor. Firestore'a yazmak icin ya kural degisikligi
 * (host anonim oturum) ya da ayri bir koleksiyon gerekirdi; ikisi de bu
 * faydanin karsiligi degil. Depolama silinirse hafiza sifirlanir — kabul
 * edilebilir, en kotu ihtimalle eski davranisa donulur.
 */

const STORAGE_KEY = "hengame_quiz_history";

/** Bu sureden eski kayitlar unutuluyor: soru havuza geri donsun. */
export const HISTORY_TTL_MS = 30 * 24 * 60 * 60 * 1000;

/** Depolamanin sinirsiz buyumesini engelleyen ust sinir. */
const MAX_ENTRIES = 500;

type HistoryEntry = { id: string; at: number };

function read(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (e): e is HistoryEntry =>
        typeof e === "object" && e !== null &&
        typeof (e as HistoryEntry).id === "string" &&
        typeof (e as HistoryEntry).at === "number",
    );
  } catch {
    // Gizli sekme, dolu kota, bozuk JSON — hicbiri oyunu durdurmamali.
    return [];
  }
}

/** Son HISTORY_TTL_MS icinde sorulmus soru kimlikleri, yeniden eskiye. */
export function recentQuestionIds(now: number = Date.now()): string[] {
  return read()
    .filter((e) => now - e.at < HISTORY_TTL_MS)
    .sort((a, b) => b.at - a.at)
    .map((e) => e.id);
}

/** Bir turda sorulan sorulari hafizaya yazar. */
export function rememberQuestions(ids: readonly string[], now: number = Date.now()): void {
  if (ids.length === 0) return;
  try {
    const fresh = read().filter((e) => now - e.at < HISTORY_TTL_MS && !ids.includes(e.id));
    const merged = [...ids.map((id) => ({ id, at: now })), ...fresh].slice(0, MAX_ENTRIES);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch {
    // Yazamamak oyunu etkilemiyor: en fazla tekrar hafizasi calismaz.
  }
}

/** Test ve "hafizayi sifirla" icin. */
export function clearQuestionHistory(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* yoksayilir */
  }
}
