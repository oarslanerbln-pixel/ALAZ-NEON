export type RangePreset = "today" | "week" | "month";

/** Rapor aralığı: bugün, bu hafta (Pazartesi başlangıçlı) ya da bu ay; bitiş şimdi. */
export function rangeFor(preset: RangePreset): { start: number; end: number } {
  const now = new Date();
  const end = now.getTime();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  if (preset === "week") {
    // Pazartesi başlangıçlı hafta — getDay() Pazar=0 döndürüyor, ona göre kaydırıyoruz.
    const day = start.getDay();
    const diffToMonday = day === 0 ? 6 : day - 1;
    start.setDate(start.getDate() - diffToMonday);
  } else if (preset === "month") {
    start.setDate(1);
  }
  return { start: start.getTime(), end };
}
